
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define the prompts directly in the edge function instead of importing from src/utils/aiPrompts.ts
const textFormattingPrompts = {
  format: `Format and clean this text. Correct spelling and grammar, improve readability, and organize with proper paragraphs and spacing. Do not summarize or change the meaning. Keep all original information intact.`,
  
  summarize: `Summarize this text concisely while preserving the key points and main ideas. Organize with clear headings and bullet points where appropriate.`,
  
  enhance: `Enhance this text by improving clarity, flow, and organization. Fix grammar and spelling issues, improve sentence structure, add appropriate headings, and organize content logically. Do not add new information that wasn't in the original text.`
};

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
    const { noteContent, cleanType, model = 'claude' } = await req.json();
    
    if (!noteContent) {
      return new Response(
        JSON.stringify({ error: 'Note content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!cleanType || !['format', 'summarize', 'enhance'].includes(cleanType)) {
      return new Response(
        JSON.stringify({ error: 'Valid cleanType is required (format, summarize, or enhance)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Cleaning note text with ${model} model, type: ${cleanType}`);
    
    // Use the appropriate prompt from our local prompts object
    const prompt = textFormattingPrompts[cleanType] + `\n\nHere is the text to clean:\n${noteContent}`;

    let result;
    if (model === 'claude') {
      if (!anthropicApiKey) {
        return new Response(
          JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      result = data.content[0].text;
    } else {
      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that cleans and improves text content.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      result = data.choices[0].message.content;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        cleanedText: result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in clean-note-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
