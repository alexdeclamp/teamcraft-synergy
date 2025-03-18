
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  
  // Replace "Heading:" and "Subheading:" with proper markdown headings
  let formatted = text
    // Convert headings to markdown
    .replace(/^Executive Summary:/gmi, '## Executive Summary')
    .replace(/^Description:/gmi, '## Description')
    .replace(/^Key Learnings:/gmi, '## Key Learnings')
    .replace(/^Blockers:/gmi, '## Blockers')
    .replace(/^Next Steps:/gmi, '## Next Steps')
    // Ensure double line breaks between sections
    .replace(/\n(## )/g, '\n\n$1')
    // Fix bullet points
    .replace(/^[-*•]\s*/gm, '• ')
    // Ensure proper spacing between paragraphs
    .replace(/([^\n])\n([^\s#•-])/g, '$1\n\n$2')
    // Remove extra spaces
    .replace(/\s{3,}/g, '\n\n')
    // Ensure proper heading spacing
    .replace(/^(## .*)\n([^\n])/gm, '$1\n\n$2');
  
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
            content: `Please summarize the following ${title ? 'document titled "' + title + '"' : 'text'} in a structured format with these sections:

1. Executive Summary: A brief 2-3 sentence overview of the key points
2. Description: A more detailed explanation of the content and context
3. Key Learnings: The main takeaways from the document, presented as bullet points
4. Blockers: Any challenges, obstacles, or issues mentioned (if relevant, otherwise omit this section)
5. Next Steps: Recommendations or future actions based on the content

Use proper markdown formatting with each section clearly labeled. Here's the text to summarize:

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
            content: `You are an AI assistant that summarizes documents in a structured format. Create summaries with these specific sections:

1. Executive Summary: A brief 2-3 sentence overview of the key points
2. Description: A more detailed explanation of the content and context
3. Key Learnings: The main takeaways from the document, presented as bullet points
4. Blockers: Any challenges, obstacles, or issues mentioned (if relevant, otherwise omit this section)
5. Next Steps: Recommendations or future actions based on the content

FORMAT YOUR SUMMARY AS CLEAN MARKDOWN with these exact section headings.`
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
