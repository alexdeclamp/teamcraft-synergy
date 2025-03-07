
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, projectId, userId, noteId, imageUrl } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (type === 'note' && !noteId) {
      throw new Error('Note ID is required for note summaries');
    }
    
    if (type === 'image' && !imageUrl) {
      throw new Error('Image URL is required for image summaries');
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Log an OpenAI API call before making the request
    try {
      const { error: logError } = await supabase
        .from('user_usage_stats')
        .insert({
          user_id: userId,
          action_type: 'openai_api_call',
        });
      
      if (logError) {
        console.error('Error logging OpenAI API call:', logError);
      }
    } catch (error) {
      console.error('Error inserting OpenAI API call record:', error);
    }
    
    // Initialize the OpenAI API client
    console.log('Generating summary for:', type);
    
    if (type === 'image') {
      console.log('Processing image URL:', imageUrl);
    } else {
      console.log('Content length:', content.length);
    }
    
    console.log('Project ID:', projectId);
    
    let messages;
    
    if (type === 'image') {
      // For image analysis, we need to send the image as a base64 data URL
      try {
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
        
        // Set up messages for OpenAI with image - improved detailed prompt
        messages = [
          {
            role: 'system',
            content: `You are an AI assistant specialized in comprehensive image analysis. Analyze the provided image in full detail, extracting ALL information present:

1. For text content: Extract ALL text visible in the image accurately, maintaining original formatting
2. For tables/structured data: Reproduce the entire table structure with ALL rows and columns
3. For charts: Describe type, axes, data points, trends, and numerical values
4. For diagrams: Detail all components, connections, and text labels
5. For photographs: Identify subjects, environment, actions, and relevant details
6. For UI screenshots: Describe all interface elements, controls, and visible data
7. For document images: Extract headings, paragraphs, and page structure

Format your response appropriately:
- For tables: Use structured markdown table format
- For lists: Use proper bullet or numbered formatting
- For hierarchical data: Use headings and subheadings
- For paragraphs: Maintain original spacing and structure

IMPORTANT: Do not omit ANY information visible in the image. If data appears cut off, mention what is visible and that it's truncated.
Your goal is to produce a comprehensive, well-structured textual representation of EVERYTHING in the image.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please provide a complete and detailed description of everything in this image, extracting all visible information. Format structured data appropriately with tables, lists, and proper spacing.' },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ];
        
        console.log('Successfully converted image to base64 data URL');
      } catch (error) {
        console.error('Error processing image:', error);
        throw new Error(`Error processing image: ${error.message}`);
      }
    } else {
      // For text notes
      messages = [
        {
          role: 'system',
          content: 'You are an AI assistant that summarizes text notes. Create a concise 2-3 sentence summary that captures the key points.'
        },
        {
          role: 'user',
          content: `Please summarize the following note: ${content}`
        }
      ];
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    console.log('Generated summary:', summary);
    
    if (type === 'note') {
      // Save note summary to the database
      console.log('Saving note summary to database');
      const { data: saveData, error: saveError } = await supabase
        .from('note_summaries')
        .upsert({
          note_id: noteId,
          project_id: projectId,
          user_id: userId,
          summary: summary,
          updated_at: new Date().toISOString()
        }, { onConflict: 'note_id' })
        .select();
      
      if (saveError) {
        console.error('Error saving note summary:', saveError);
      } else {
        console.log('Note summary saved successfully:', saveData);
      }
    } else if (type === 'image') {
      // Save image summary to database
      const { data: saveData, error: saveError } = await supabase
        .from('image_summaries')
        .upsert({
          image_url: imageUrl,
          project_id: projectId,
          user_id: userId,
          summary: summary,
          updated_at: new Date().toISOString()
        }, { onConflict: 'image_url' })
        .select();
      
      if (saveError) {
        console.error('Error saving image summary:', saveError);
      } else {
        console.log('Image summary saved successfully:', saveData);
      }
    }
    
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
