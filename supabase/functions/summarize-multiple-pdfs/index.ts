
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
    
    // Process documents in smaller batches to prevent resource exhaustion
    const BATCH_SIZE = 3; // Process 3 documents at a time
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
      
      // Add a small delay between batches to allow resources to be freed
      if (batchIndex < Math.ceil(pdfUrls.length / BATCH_SIZE) - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    // Call the appropriate AI API based on the model parameter
    if (model === 'claude') {
      // Call Claude API
      apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please provide a comprehensive summary of this PDF document (${pdfUrl}). 
                  
                  Include the following in your summary:
                  1. The main purpose and key points of the document
                  2. Important facts, figures, and findings
                  3. Any conclusions or recommendations
                  
                  Format your response in a clear, structured way using paragraphs, bullet points, and headings as appropriate.`
                }
              ]
            }
          ]
        })
      });
      
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
      // Call OpenAI API
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
              content: "You are a helpful assistant that provides comprehensive summaries of PDF documents."
            },
            {
              role: "user",
              content: `Please provide a comprehensive summary of this PDF document (${pdfUrl}). 
              
              Include the following in your summary:
              1. The main purpose and key points of the document
              2. Important facts, figures, and findings
              3. Any conclusions or recommendations
              
              Format your response in a clear, structured way using paragraphs, bullet points, and headings as appropriate.`
            }
          ]
        })
      });
      
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
    
    return summary;
  } catch (error) {
    console.error(`Error processing PDF ${fileName}:`, error);
    throw error;
  }
}
