
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

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
    const { text, model = 'claude', maxLength = 1500, title, projectId } = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for summarization');
    }

    console.log(`Summarizing text with ${model}. Length: ${text.length} characters`);
    console.log(`Using title: ${title || 'No title provided'}`);
    console.log(`Project ID: ${projectId || 'No project ID provided'}`);
    
    let summary;
    
    if (model === 'claude' && claudeApiKey) {
      summary = await summarizeWithClaude(text, maxLength);
    } else if (openAIApiKey) {
      summary = await summarizeWithOpenAI(text, maxLength);
    } else {
      throw new Error('No API key available for the selected model');
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        model: model === 'claude' && claudeApiKey ? 'claude' : 'openai',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-text function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function summarizeWithClaude(text: string, maxLength: number): Promise<string> {
  try {
    console.log("Calling Claude API...");
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: maxLength,
        messages: [
          {
            role: 'user',
            content: `Please summarize the following text. Focus on the key points and main ideas. Keep your summary concise but comprehensive:

${text.slice(0, 100000)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Claude response received successfully");
    return data.content[0].text;
  } catch (error) {
    console.error("Error in Claude summarization:", error);
    throw error;
  }
}

async function summarizeWithOpenAI(text: string, maxLength: number): Promise<string> {
  try {
    console.log("Calling OpenAI API...");
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
            content: 'You are an AI assistant that summarizes documents. Create a concise but comprehensive summary that captures the key points and main ideas.'
          },
          {
            role: 'user',
            content: `Please summarize the following text:\n\n${text.slice(0, 100000)}`
          }
        ],
        max_tokens: maxLength
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI summarization:", error);
    throw error;
  }
}
