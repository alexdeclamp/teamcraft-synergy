
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
    const { pdfUrl, fileName, userQuestion, documentContext } = await req.json();
    
    if (!userQuestion) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Ask Question: ${userQuestion}`);
    console.log(`Document: ${fileName || 'Unnamed document'}`);
    
    // Use the provided document context to answer the question
    if (documentContext && documentContext.trim() !== '') {
      console.log('Using document context to answer the question...');
      
      try {
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
            system: `You are an AI assistant that helps users answer questions about PDF documents. 
                The current document is: "${fileName || 'Document'}".
                Use the following content from the document to answer the user's questions. 
                If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.
                
                Document content:
                ${documentContext}`,
            messages: [
              {
                role: "user",
                content: userQuestion
              }
            ]
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.content || !data.content[0] || !data.content[0].text) {
          throw new Error('Invalid response format from Claude API');
        }
        
        const answer = data.content[0].text;
        
        console.log("Answer generated successfully");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            answer: answer,
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
    } else {
      // If no document context is provided
      return new Response(
        JSON.stringify({ 
          error: `No document context provided. Unable to process the request.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in ask-pdf-question function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
