
import { corsHeaders } from "./utils.ts";

// Process and analyze an image using Anthropic's Claude API
export async function processImage(imageUrl: string): Promise<string> {
  try {
    console.log('Processing image URL:', imageUrl);
    
    // Download the image from the URL with proper error handling
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Get the image as a blob
    const imageBlob = await imageResponse.blob();
    
    // Convert the blob to base64
    const imageArrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
    
    // Determine content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Create data URL
    const dataUrl = `data:${contentType};base64,${base64Image}`;
    
    console.log('Successfully converted image to base64 data URL');
    
    // Call Claude to analyze the image
    const summary = await analyzeImageWithClaude(dataUrl);
    return summary;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Error processing image: ${error.message}`);
  }
}

// Analyze image with Claude
async function analyzeImageWithClaude(dataUrl: string): Promise<string> {
  // Get API key from environment variables
  const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!claudeApiKey) {
    throw new Error('Claude API key is not configured');
  }

  try {
    console.log('Calling Claude API to analyze image');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please describe this image in detail. Include any text, objects, people, or elements visible in it.'
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: dataUrl.split(',')[1]
                }
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }
    
    return data.content[0].text;
  } catch (error) {
    console.error('Error in analyzeImageWithClaude:', error);
    throw new Error(`Failed to analyze image with Claude: ${error.message}`);
  }
}
