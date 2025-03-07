
import { openAIApiKey, corsHeaders } from "./utils.ts";

// Process and analyze an image using OpenAI's API
export async function processImage(imageUrl: string): Promise<string> {
  try {
    console.log('Processing image URL:', imageUrl);
    
    // Download the image from the URL
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
    
    // Set up messages for OpenAI with image
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assistant that describes images. Create a detailed but concise description of what you see in the image. Identify and describe all elements, text, numbers, charts, graphs, and any visual data present. Focus on extracting ALL information accurately, including numerical data, names, dates, and any text visible in the image. Format tables, lists, and structured content appropriately.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please analyze this image and extract ALL information visible in it, including any text, numbers, tables, or visual elements.' },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ];
    
    // Call OpenAI API to analyze the image
    const summary = await callOpenAI(messages);
    return summary;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Error processing image: ${error.message}`);
  }
}

// Call OpenAI API with the provided messages
async function callOpenAI(messages: any[]): Promise<string> {
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
      max_tokens: 500, // Increased token limit for more detailed extraction
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}
