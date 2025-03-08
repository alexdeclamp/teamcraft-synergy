
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
    const { pdfUrl, fileName, userQuestion, documentContext } = reqBody;
    
    console.log(`Ask Question for PDF: ${fileName}`);
    console.log(`PDF URL: ${pdfUrl}`);
    console.log(`User Question: ${userQuestion}`);
    
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
    
    if (!userQuestion) {
      return new Response(
        JSON.stringify({ 
          error: 'Question is required',
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
    
    try {
      console.log("Calling Claude API");
      
      // Prepare system message and messages for Claude API
      let systemMessage = `You are an AI assistant that helps users answer questions about PDF documents. 
          The current document is: "${fileName}".`;
          
      // Create messages array
      let messages = [];
      
      // If we have document context, use it in the system message
      if (documentContext && documentContext.trim() !== '') {
        console.log(`Using provided document context (${documentContext.length} chars)`);
        
        // Limit document context length to prevent exceeding token limits
        const maxContextLength = 80000; // reduce from 90K for safety
        const truncatedContext = documentContext.length > maxContextLength
          ? documentContext.substring(0, maxContextLength) + "... [Content truncated due to length]"
          : documentContext;
        
        systemMessage += `\nUse the following content from the document to answer the user's questions. 
            If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.
            
            Document content:
            ${truncatedContext}`;
            
        // Standard message format with text context
        messages = [
          {
            role: "user",
            content: userQuestion
          }
        ];
      } else {
        // No document context provided, use file_url approach with Claude vision
        console.log("No document context provided, using file_url with Claude vision API");
        
        // Using file_url in content for Claude to analyze the PDF directly
        messages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please answer this question about the PDF document: ${userQuestion}`
              },
              {
                type: "file_url",
                file_url: {
                  url: pdfUrl
                }
              }
            ]
          }
        ];
      }
      
      console.log(`Calling Claude API with ${documentContext ? 'text context' : 'file_url'} approach`);
      
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
          system: systemMessage,
          messages: messages
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error: ${response.status}`, errorText);
        throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Claude API response received successfully");
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Invalid response format from Claude API:', JSON.stringify(data));
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
    console.error('Error in ask-pdf-question function:', error);
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
