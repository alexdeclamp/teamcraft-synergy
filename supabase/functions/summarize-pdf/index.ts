
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

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
    const { pdfUrl, fileName, projectId } = await req.json();
    
    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'PDF URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Summarizing PDF: ${fileName}`);
    console.log(`PDF URL: ${pdfUrl}`);
    
    // Call Claude API with improved error handling
    try {
      console.log("Calling Claude API...");
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are an expert BCG consultant analyzing the PDF document "${fileName}".
                  
                  The PDF URL is: ${pdfUrl}
                  
                  Create a comprehensive analysis of this document with the following sections:
                  
                  1. Executive Summary: A brief 2-3 sentence overview highlighting the core strategic message and business implications
                  2. Description: A clear explanation of the content and its business context without unnecessary details
                  3. Key Learning Points: The critical strategic insights from the document, presented as focused bullet points
                  4. Warnings: Any potential risks, challenges, or red flags that should be considered (if relevant, otherwise omit this section)
                  5. Next Steps: Recommended actions and strategic priorities based on this information (if relevant, otherwise omit this section)
                  
                  FORMAT YOUR SUMMARY AS CLEAN MARKDOWN with these exact section headings. Maintain a professional, consulting tone throughout.
                  
                  Be concise, data-driven, and focus on actionable insights with a strategic perspective. If you cannot properly access or read the PDF, clearly state this issue rather than generating an inaccurate summary.`
                }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error: ${response.status}`, errorText);
        return new Response(
          JSON.stringify({ error: `Claude API error: ${response.status}. Details: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      console.log("Claude API response received:", JSON.stringify(data).slice(0, 200) + "...");
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Invalid response from Claude API:', data);
        return new Response(
          JSON.stringify({ error: 'Invalid response format from Claude API' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const summary = data.content[0].text;
      
      console.log("Summary generated successfully");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary: summary,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error calling Claude API:', apiError);
      return new Response(
        JSON.stringify({ 
          error: `Error calling Claude API: ${apiError.message || 'Unknown API error'}`,
          details: apiError.stack || ''
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in summarize-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
