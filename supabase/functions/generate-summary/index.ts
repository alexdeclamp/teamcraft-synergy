
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
    console.log('Content length:', content.length);
    console.log('Project ID:', projectId);
    
    const messages = [
      {
        role: 'system',
        content: type === 'note' ? 
          'You are an AI assistant that summarizes text notes. Create a concise 2-3 sentence summary that captures the key points.' : 
          'You are an AI assistant that describes images. Create a detailed but concise description of what you see in the image. Focus on the main subject, colors, style, and any notable features.'
      },
      {
        role: 'user',
        content: type === 'note' ?
          `Please summarize the following note: ${content}` :
          `Please describe what you see in this image URL: ${content}`
      }
    ];
    
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
        max_tokens: 300,
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
