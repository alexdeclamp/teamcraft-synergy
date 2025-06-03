
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
    console.log('🔧 Clean note text function called');
    
    const { noteContent, cleanType, model = 'claude' } = await req.json();
    
    console.log('📝 Request details:', { 
      contentLength: noteContent?.length || 0, 
      cleanType, 
      model,
      hasAnthropicKey: !!anthropicApiKey,
      hasOpenaiKey: !!openaiApiKey
    });
    
    if (!noteContent) {
      console.error('❌ No note content provided');
      return new Response(
        JSON.stringify({ error: 'Note content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!cleanType || !['format', 'summarize', 'enhance'].includes(cleanType)) {
      console.error('❌ Invalid clean type:', cleanType);
      return new Response(
        JSON.stringify({ error: 'Valid cleanType is required (format, summarize, or enhance)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🤖 Cleaning note text with ${model} model, type: ${cleanType}`);
    
    // Use the appropriate prompt from our local prompts object
    const prompt = textFormattingPrompts[cleanType] + `\n\nHere is the text to clean:\n\n${noteContent}`;

    let result;
    if (model === 'claude' && anthropicApiKey) {
      console.log('🔵 Using Claude API');
      result = await callClaudeAPI(prompt, anthropicApiKey);
    } else if (openaiApiKey) {
      console.log('🟢 Using OpenAI API');
      result = await callOpenAIAPI(prompt, openaiApiKey);
    } else {
      const missingKey = model === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
      console.error(`❌ Missing API key: ${missingKey}`);
      return new Response(
        JSON.stringify({ error: `${missingKey} is not configured` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Text cleaning completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        cleanedText: result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error in clean-note-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || '' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callClaudeAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
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
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}. Details: ${errorText}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAIAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}. Details: ${errorText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}
