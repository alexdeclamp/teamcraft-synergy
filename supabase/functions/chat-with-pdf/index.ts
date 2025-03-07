
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
    const { pdfUrl, fileName, message, documentContext, projectId } = await req.json();
    
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
    console.log(`Document context length: ${documentContext ? documentContext.length : 0} characters`);
    
    // Call Claude API with the file URL
    try {
      console.log("Calling Claude API with file_url...");
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
                  text: `This is a PDF document named "${fileName}". Please answer my following question about this document: ${message}`
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
        console.error(`Claude API error: ${response.status}`, errorText);
        
        // Fallback to text-based approach if file_url fails
        if (documentContext && documentContext.trim() !== '') {
          console.log('File URL approach failed, falling back to document context approach...');
          return await handleWithDocumentContext(pdfUrl, fileName, message, documentContext);
        }
        
        return new Response(
          JSON.stringify({ error: `Claude API error: ${response.status}. Details: ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      console.log("Claude API response received:", JSON.stringify(data).slice(0, 200) + "...");
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Invalid response from Claude API:', data);
        
        // Fallback to text-based approach if response format is invalid
        if (documentContext && documentContext.trim() !== '') {
          console.log('Invalid response format, falling back to document context approach...');
          return await handleWithDocumentContext(pdfUrl, fileName, message, documentContext);
        }
        
        return new Response(
          JSON.stringify({ error: 'Invalid response format from Claude API' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
      
      // Fallback to text-based approach if there's an error
      if (documentContext && documentContext.trim() !== '') {
        console.log('Error with file_url approach, falling back to document context approach...');
        return await handleWithDocumentContext(pdfUrl, fileName, message, documentContext);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Error calling Claude API: ${apiError.message || 'Unknown API error'}`,
          details: apiError.stack || ''
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
  console.log("Using document context approach as fallback...");
  
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
