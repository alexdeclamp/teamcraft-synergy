
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
    const reqBody = await req.json();
    const { pdfUrl, fileName, message, documentContext } = reqBody;
    
    // Input validation
    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'PDF URL is required',
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!message) {
      return new Response(
        JSON.stringify({ 
          error: 'Message is required',
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ 
          error: 'ANTHROPIC_API_KEY is not configured',
          success: false
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Chat with PDF: ${fileName}`);
    console.log(`PDF URL: ${pdfUrl}`);
    console.log(`User message: ${message}`);
    
    // Check document context
    if (!documentContext || documentContext.trim() === '') {
      console.log('No document context provided');
      return new Response(
        JSON.stringify({ 
          error: 'No document content available. The document may still be processing.',
          success: false
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Using document context for chat');
    console.log(`Document context length: ${documentContext.length} characters`);
    
    // Call Claude API
    try {
      console.log("Calling Claude API...");
      
      // Limit document context length to prevent exceeding token limits
      const maxContextLength = 100000; // ~25K tokens
      const truncatedContext = documentContext.length > maxContextLength
        ? documentContext.substring(0, maxContextLength) + "... [Content truncated due to length]"
        : documentContext;
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1500,
          system: `You are an AI assistant that helps users chat with PDF documents. 
              The current document is: "${fileName}".
              Use the following content from the document to answer the user's questions. 
              If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.
              
              Document content:
              ${truncatedContext}`,
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
        console.error(`Claude API error: ${response.status}`, errorText);
        throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Claude API response received");
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Invalid response from Claude API:', data);
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
          details: apiError.stack || '',
          success: false
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in chat-with-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
