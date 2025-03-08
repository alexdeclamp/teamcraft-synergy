
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
    
    for (let i = 0; i < pdfUrls.length; i++) {
      const pdfUrl = pdfUrls[i];
      const fileName = fileNames[i] || `Document ${i + 1}`;
      
      try {
        console.log(`Processing PDF (${i+1}/${pdfUrls.length}): ${fileName}`);
        
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
            throw new Error(`Claude API error: ${apiResponse.status} - ${await apiResponse.text()}`);
          }
          
          const data = await apiResponse.json();
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
            throw new Error(`OpenAI API error: ${apiResponse.status} - ${await apiResponse.text()}`);
          }
          
          const data = await apiResponse.json();
          summary = data.choices[0].message.content;
        }
        
        results.push({
          fileName,
          pdfUrl,
          summary
        });
        
        console.log(`Successfully generated summary for ${fileName}`);
      } catch (error) {
        console.error(`Error processing PDF ${fileName}:`, error);
        errors.push({
          fileName,
          pdfUrl,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        errors,
        totalProcessed: results.length,
        totalErrors: errors.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-multiple-pdfs function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
