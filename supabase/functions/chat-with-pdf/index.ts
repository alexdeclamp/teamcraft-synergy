
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Add PDF parsing library
import * as pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to fetch and extract text from a PDF URL
async function extractTextFromPdf(url) {
  try {
    console.log(`Fetching PDF from: ${url}`);
    
    // Fetch the PDF
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    // Get the PDF as ArrayBuffer
    const pdfData = await response.arrayBuffer();
    
    // Load the PDF with pdf.js
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    // Extract text from each page
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      textContent += strings.join(' ') + '\n';
    }
    
    console.log(`Extracted ${textContent.length} characters from PDF`);
    
    return textContent;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfUrl, fileName, message, documentContext, model = 'openai' } = await req.json();
    
    console.log(`Chat with PDF request received for: ${fileName || 'unnamed document'}`);
    console.log(`Using model: ${model}`);
    console.log(`User message: ${message}`);
    
    if (!message || message.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'No message provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if we should use provided document context or extract from PDF URL
    if ((!documentContext || documentContext.trim() === '') && !pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'Either document context or PDF URL is required' }),
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
    
    // Prepare the context for the AI
    let contextContent = '';
    
    if (documentContext && documentContext.trim() !== '') {
      console.log(`Using provided document context (${documentContext.length} characters)`);
      contextContent = documentContext;
    } else if (pdfUrl) {
      // Extract text from the PDF URL
      try {
        console.log('No document context provided, extracting from PDF URL...');
        contextContent = await extractTextFromPdf(pdfUrl);
        console.log(`Successfully extracted ${contextContent.length} characters from PDF`);
      } catch (extractError) {
        console.error('Error extracting PDF text:', extractError);
        return new Response(
          JSON.stringify({ error: `Failed to extract text from PDF: ${extractError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (!contextContent || contextContent.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'No document content available to process' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Truncate context if it's too large (to avoid token limit issues)
    const maxContextLength = 75000; // Characters, not tokens
    if (contextContent.length > maxContextLength) {
      console.log(`Document context too large (${contextContent.length} chars), truncating to ${maxContextLength} chars`);
      contextContent = contextContent.substring(0, maxContextLength) + 
        "\n\n[Note: The document is too large and has been truncated. Some information may be missing.]";
    }
    
    // System message for both models
    const systemMessage = `You are an AI assistant that helps users understand and analyze documents. 
      The current document is: "${fileName || 'Unnamed document'}".
      
      Use the following content from the document to answer the user's questions:
      
      ${contextContent}
      
      Guidelines:
      1. Base your answers solely on the document content provided. Don't reference external information.
      2. If you don't know the answer based on the provided document content, admit that you don't know rather than making up information.
      3. When quoting from the document, use quotation marks and be precise.
      4. If the document is truncated, mention that some information might be missing.
      5. Format your responses in a clear, easy-to-read manner with proper spacing.
      6. For technical or complex documents, explain terms when appropriate.`;

    // Call the selected API
    try {
      console.log(`Calling ${model.toUpperCase()} API...`);
      let data;
      
      if (model === 'claude' && anthropicApiKey) {
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
        console.log('Claude API response received successfully');
        
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
        console.log('OpenAI API response received successfully');
        
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
