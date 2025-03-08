
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { pdfUrl, fileName, message, documentContext, model = 'claude' } = await req.json();
    
    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'PDF URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the requested model's API key is available
    if ((model === 'claude' && !anthropicApiKey) || (model === 'openai' && !openAIApiKey)) {
      const missingKey = model === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
      return new Response(
        JSON.stringify({ error: `${missingKey} is not configured` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Chat with PDF: ${fileName}`);
    console.log(`PDF URL: ${pdfUrl}`);
    console.log(`User message: ${message}`);
    console.log(`Using model: ${model}`);
    
    // Prepare the context for the AI
    let contextContent = '';
    if (documentContext && documentContext.trim() !== '') {
      contextContent = documentContext;
      console.log('Using provided document context');
    } else {
      // We could implement fetching/extracting context here if needed
      console.log('No document context provided');
    }
    
    // System message for both models
    const systemMessage = `You are an AI assistant that helps users chat with PDF documents. 
      The current document is: "${fileName}".
      Use the following content from the document to answer the user's questions. 
      If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.
      
      Document content:
      ${contextContent}`;

    // Call the selected API
    try {
      console.log(`Calling ${model.toUpperCase()} API...`);
      let data;
      
      if (model === 'claude') {
        // Call Claude API
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
            system: systemMessage,
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
        
        data = await response.json();
        
        if (!data.content || !data.content[0] || !data.content[0].text) {
          console.error('Invalid response from Claude API:', data);
          throw new Error('Invalid response format from Claude API');
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            answer: data.content[0].text,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: systemMessage
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error: ${response.status}`, errorText);
          throw new Error(`OpenAI API error: ${response.status}. Details: ${errorText}`);
        }
        
        data = await response.json();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            answer: data.choices[0].message.content,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
    } catch (apiError) {
      console.error(`Error calling ${model.toUpperCase()} API:`, apiError);
      return new Response(
        JSON.stringify({ 
          error: `Error calling ${model.toUpperCase()} API: ${apiError.message || 'Unknown API error'}`,
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
