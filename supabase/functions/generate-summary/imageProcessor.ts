
import { openAIApiKey, corsHeaders } from "./utils.ts";

// Process and analyze an image using OpenAI's API
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
    
    // Call OpenAI to analyze the image
    const summary = await analyzeImageWithOpenAI(dataUrl);
    return summary;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Error processing image: ${error.message}`);
  }
}

// Analyze image with OpenAI
async function analyzeImageWithOpenAI(dataUrl: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    // Set up messages for OpenAI with image
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant specialized in analyzing images and extracting information. Please describe this image in detail, including any text, objects, people, or other elements visible in it.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please describe this image in detail.' },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ];
    
    // Call OpenAI API with proper error handling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: messages,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in analyzeImageWithOpenAI:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}
