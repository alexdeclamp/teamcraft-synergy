
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
  const systemPrompt = `You are an AI assistant specialized in analyzing images and extracting ALL information visible in them.

Your task is to:
1. Describe the image in comprehensive detail
2. Extract ALL text content visible in the image, including small or peripheral text
3. Identify and transcribe ALL numerical data, statistics, metrics, or measurements
4. Accurately reproduce any tables, charts, or structured data with proper formatting
5. Capture all names, dates, labels, and identifiers exactly as they appear
6. Preserve the format and structure of any lists, bullet points, or hierarchical information
7. Note any logos, branding, or distinctive visual elements
8. Identify information in diagrams, flowcharts, or process visualizations

For tables:
- Maintain column alignments and preserve all headers exactly as shown
- Include all row labels and data values with their exact spelling and formatting
- Use markdown table format with proper column separators
- Ensure numerical values maintain their precision and decimal formatting

For charts and graphs:
- Describe the type of chart/graph (line, bar, pie, etc.)
- List all axes labels, scales, and units
- Extract data points, trends, and notable features
- Provide numerical values where visibly discernible

IMPORTANT: Your PRIMARY goal is information extraction - ensure NO detail or text is missed, no matter how minor it might seem.`;

  const userPrompt = "Please analyze this image and extract ALL information visible in it. Include every piece of text, number, table content, and visual data present. Format tables and structured content appropriately using markdown.";
  
  // Set up messages for OpenAI with image
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    }
  ];
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.3, // Lower temperature for more accurate extraction
      max_tokens: 1500, // Increased token limit for comprehensive extraction
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
