
import { openAIApiKey, corsHeaders } from "./utils.ts";

// Import our text summarization prompt
const textSummarizationPrompt = `You are an AI assistant that summarizes text notes in a structured format. 
Create summaries with these specific sections:

1. Executive Summary: A brief 2-3 sentence overview of the key points
2. Description: A more detailed explanation of the content and context
3. Key Learnings: The main takeaways from the document, presented as bullet points
4. Blockers: Any challenges, obstacles, or issues mentioned (if relevant, otherwise omit this section)
5. Next Steps: Recommendations or future actions based on the content

FORMAT YOUR SUMMARY AS CLEAN MARKDOWN with these exact section headings.`;

// Process and summarize text content using OpenAI's API
export async function processText(content: string): Promise<string> {
  try {
    console.log('Content length:', content.length);
    
    // Set up messages for OpenAI for text summarization with structured format
    const messages = [
      {
        role: 'system',
        content: textSummarizationPrompt
      },
      {
        role: 'user',
        content: `Please summarize the following note: ${content}`
      }
    ];
    
    // Call OpenAI API to summarize the text
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing text:', error);
    throw new Error(`Error processing text: ${error.message}`);
  }
}
