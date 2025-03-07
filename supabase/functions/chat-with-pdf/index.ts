
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
    const { pdfUrl, fileName, message, documentContext } = await req.json();
    
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
    
    console.log(`Chat with PDF: ${fileName}`);
    console.log(`PDF URL: ${pdfUrl}`);
    console.log(`User message: ${message}`);
    
    // Call Claude API with the PDF URL in the correct format
    try {
      console.log("Calling Claude API with file_url parameter...");
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
                  text: `Please answer my question about this PDF document named "${fileName}": ${message}`
                },
                {
                  type: "file_url", 
                  file_url: {
                    url: pdfUrl
                  }
                }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error with file_url: ${response.status}`, errorText);
        throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Invalid response from Claude API with file_url:', data);
        throw new Error('Invalid response format from Claude API');
      }
      
      const answer = data.content[0].text;
      console.log("Answer generated successfully using file_url approach");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          answer: answer,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error calling Claude API with file_url:', apiError);
      
      // Fallback to using document context if available
      if (documentContext && documentContext.trim() !== '') {
        return await handleWithDocumentContext(pdfUrl, fileName, message, documentContext);
      } else {
        throw apiError; // Re-throw if we can't use the fallback
      }
    }
  } catch (error) {
    console.error('Error in chat-with-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to handle PDF chat using text-based approach
async function handleWithDocumentContext(pdfUrl, fileName, message, documentContext) {
  console.log("Falling back to document context approach...");
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1500,
        system: `You are an AI assistant that helps users chat with PDF documents. 
            The current document is: "${fileName}".
            Use the following content from the document to answer the user's questions. 
            If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.
            
            Document content:
            ${documentContext}`,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error with document context approach: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${response.status}. Details: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid response from Claude API with document context approach:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from Claude API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const answer = data.content[0].text;
    
    console.log("Answer generated successfully using document context approach");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        answer: answer,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in document context approach:', error);
    return new Response(
      JSON.stringify({ 
        error: `Error with document context approach: ${error.message || 'Unknown error'}`,
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
