
import { openAIApiKey, corsHeaders } from "./utils.ts";
import { textPrompts } from "../../../src/utils/aiPrompts.ts";

// Process and summarize text content using OpenAI's API
export async function processText(content: string): Promise<string> {
  try {
    console.log('Content length:', content.length);
    
    // Use the centralized summary prompt
    const summaryPrompt = textPrompts.summary.openai;
    
    // Set up messages for OpenAI for text summarization with structured format
    const messages = [
      {
        role: 'system',
        content: summaryPrompt
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
