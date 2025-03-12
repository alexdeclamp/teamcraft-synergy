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
      summary = await summarizeWithClaude(text, maxLength, title);
    } else if (openAIApiKey) {
      summary = await summarizeWithOpenAI(text, maxLength, title);
    } else {
      throw new Error('No API key available for the selected model');
    }

    // Format summary text - ensure it has proper markdown formatting
    summary = formatSummaryText(summary);

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

function formatSummaryText(text) {
  if (!text) return '';
  
  // Ensure proper markdown formatting
  let formatted = text
    // Fix headings that are missing spaces after #
    .replace(/^(#{1,6})([^\s])/gm, '$1 $2')
    // Ensure double line breaks between sections
    .replace(/\n(#{1,6}\s)/g, '\n\n$1')
    // Fix bullet points formatting
    .replace(/^[-*•]\s*/gm, '• ')
    // Ensure proper spacing between paragraphs
    .replace(/([^\n])\n([^\s#•-])/g, '$1\n\n$2')
    // Remove extra spaces
    .replace(/\s{3,}/g, '\n\n')
    // Ensure proper heading spacing
    .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
    .replace(/^(#{1,6}\s.*)\n([^\n])/gm, '$1\n\n$2');
  
  return formatted.trim();
}

async function summarizeWithClaude(text: string, maxLength: number, title?: string): Promise<string> {
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
            content: `Please summarize the following ${title ? 'document titled "' + title + '"' : 'text'}. 

FORMAT YOUR SUMMARY AS CLEAN MARKDOWN WITH STRICT ADHERENCE TO THESE FORMATTING RULES:
1. Use clear markdown headings with hash symbols (# for main headings, ## for subheadings)
2. Always add TWO line breaks after each heading
3. Use bullet points (•) for lists with proper indentation
4. Ensure paragraphs have double line breaks between them
5. Make sure there are no spacing issues in the final output
6. Don't use excessive line breaks or irregular spacing
7. Format all section titles consistently
8. Don't run section headings into the content underneath them

Here's the text to summarize:

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

async function summarizeWithOpenAI(text: string, maxLength: number, title?: string): Promise<string> {
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
            content: `You are an AI assistant that summarizes documents. Create a concise but comprehensive summary that captures the key points and main ideas.

FORMAT YOUR SUMMARY AS CLEAN MARKDOWN WITH STRICT ADHERENCE TO THESE FORMATTING RULES:
1. Use clear markdown headings with hash symbols (# for main headings, ## for subheadings)
2. Always add TWO line breaks after each heading
3. Use bullet points (•) for lists with proper indentation
4. Ensure paragraphs have double line breaks between them
5. Make sure there are no spacing issues in the final output
6. Don't use excessive line breaks or irregular spacing
7. Format all section titles consistently
8. Don't run section headings into the content underneath them`
          },
          {
            role: 'user',
            content: `Please summarize the following ${title ? 'document titled "' + title + '"' : 'text'}:\n\n${text.slice(0, 100000)}`
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
