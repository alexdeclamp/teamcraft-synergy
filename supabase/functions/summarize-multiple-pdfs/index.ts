
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrls, fileNames, projectId, userId, model = 'claude' } = await req.json();
    
    if (!pdfUrls || !Array.isArray(pdfUrls) || pdfUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'PDF URLs array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (model === 'claude' && !anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (model === 'openai' && !openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process each PDF in sequence, but send one response
    const results = [];
    const errors = [];
    
    // Process documents in even smaller batches to prevent resource exhaustion
    const BATCH_SIZE = 2; // Process 2 documents at a time instead of 3
    let processedCount = 0;
    
    for (let batchIndex = 0; batchIndex < Math.ceil(pdfUrls.length / BATCH_SIZE); batchIndex++) {
      const startIdx = batchIndex * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, pdfUrls.length);
      const batchPromises = [];
      
      console.log(`Processing batch ${batchIndex + 1} (documents ${startIdx + 1} to ${endIdx})`);
      
      // Create promises for the current batch
      for (let i = startIdx; i < endIdx; i++) {
        batchPromises.push(processPdf(pdfUrls[i], fileNames[i], model));
      }
      
      // Process the batch concurrently
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Handle results from the batch
      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        const index = startIdx + i;
        
        if (result.status === 'fulfilled') {
          results.push({
            fileName: fileNames[index],
            pdfUrl: pdfUrls[index],
            summary: result.value
          });
          console.log(`Successfully generated summary for ${fileNames[index]}`);
        } else {
          errors.push({
            fileName: fileNames[index],
            pdfUrl: pdfUrls[index],
            error: result.reason?.message || 'Failed to process document'
          });
          console.error(`Error processing PDF ${fileNames[index]}:`, result.reason);
        }
        
        processedCount++;
      }
      
      // Add a LONGER delay between batches to allow resources to be freed
      if (batchIndex < Math.ceil(pdfUrls.length / BATCH_SIZE) - 1) {
        console.log(`Pausing for 2 seconds between batches to manage resources...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        errors,
        totalProcessed: processedCount,
        totalSuccess: results.length,
        totalErrors: errors.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-multiple-pdfs function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processPdf(pdfUrl: string, fileName: string, model: string): Promise<string> {
  try {
    console.log(`Processing PDF: ${fileName}`);
    
    let apiResponse;
    let summary;
    
    // Add timeout and retry logic for API calls
    const MAX_RETRIES = 2;
    let retries = 0;
    let success = false;
    
    while (!success && retries <= MAX_RETRIES) {
      try {
        if (retries > 0) {
          console.log(`Retry attempt ${retries} for ${fileName}`);
          // Add delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
        
        // Call the appropriate AI API based on the model parameter with a timeout
        if (model === 'claude') {
          // Call Claude API with a simpler prompt to reduce processing load
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout
          
          apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicApiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: "claude-3-haiku-20240307",
              max_tokens: 1000, // Reduced token count to make processing faster
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Provide a brief summary of this PDF document (${pdfUrl}). Focus only on the most important information.`
                    }
                  ]
                }
              ]
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Claude API error: ${apiResponse.status} - ${errorText}`);
          }
          
          const data = await apiResponse.json();
          if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error('Invalid response format from Claude API');
          }
          
          summary = data.content[0].text;
        } else {
          // Call OpenAI API with a simpler prompt
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout
          
          apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "Provide brief summaries of documents, focusing only on key information."
                },
                {
                  role: "user",
                  content: `Provide a brief summary of this PDF document (${pdfUrl}).`
                }
              ]
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`OpenAI API error: ${apiResponse.status} - ${errorText}`);
          }
          
          const data = await apiResponse.json();
          if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
            throw new Error('Invalid response format from OpenAI API');
          }
          
          summary = data.choices[0].message.content;
        }
        
        success = true;
      } catch (error) {
        retries++;
        if (retries > MAX_RETRIES) {
          throw error;
        }
        console.error(`Error attempt ${retries} processing ${fileName}:`, error);
      }
    }
    
    return summary;
  } catch (error) {
    console.error(`Error processing PDF ${fileName}:`, error);
    throw error;
  }
}
