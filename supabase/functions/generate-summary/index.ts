
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
    const requestBody = await req.json();
    const { type, content, imageUrl, userId, projectId, noteId } = requestBody;
    
    console.log(`Processing ${type} summary request`);
    console.log(`User ID: ${userId}`);
    console.log(`Project ID: ${projectId}`);
    console.log(`Note ID: ${noteId || 'not provided'}`);
    console.log(`Content length: ${content ? content.length : 0}`);
    
    if (!projectId) {
      console.error('Missing projectId in request body');
      return new Response(JSON.stringify({ error: 'Project ID is required for generating summaries' }), {
        status: 200, // Use 200 to avoid client-side HTTP error handling issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (type === 'image' && !imageUrl) {
      console.error('Missing imageUrl for image summary request');
      return new Response(JSON.stringify({ error: 'Image URL is required for image summaries' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (type === 'note' && (!content || content.trim() === '')) {
      console.error('Empty content for note summary request');
      return new Response(JSON.stringify({ error: 'Note content cannot be empty' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    let prompt = '';
    let messages = [];
    let model = 'gpt-4o-mini'; // Use gpt-4o-mini for all summaries
    
    if (type === 'note') {
      prompt = `
      You are a project manager and data protection officer. Create a concise summary of the following project note.
      Focus on key elements, main takeaways, and important learnings that would help someone remember what this note was about.
      Make your summary professional, clear, and highlight any action items or decisions if present.
      
      NOTE CONTENT:
      ${content}
      `;
      
      messages = [
        { role: 'system', content: 'You are a professional project manager and data protection officer assistant that specializes in creating concise summaries of project materials.' },
        { role: 'user', content: prompt }
      ];
    } else if (type === 'image') {
      messages = [
        {
          role: 'system',
          content: 'You are a professional project manager and data protection officer assistant that specializes in describing project-related images accurately. When describing images, focus on factual details rather than making assumptions.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Please provide a concise, accurate description of this project-related image. Focus only on what you can clearly see in the image. If the image is not clear or you cannot identify key elements, state that directly. Do not make assumptions about the purpose or context if they are not visually apparent.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ];
    } else {
      return new Response(JSON.stringify({ error: 'Invalid summary type requested' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending request to OpenAI API with model:', model);

    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key is not configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        let errorMessage = 'Unknown OpenAI API error';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          errorMessage = errorText.substring(0, 100);
        }
        
        return new Response(JSON.stringify({ error: `OpenAI API error: ${errorMessage}` }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log('OpenAI API response received');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Invalid response structure from OpenAI:', JSON.stringify(data));
        return new Response(JSON.stringify({ error: 'Invalid response structure from OpenAI' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const summary = data.choices[0].message.content;
      console.log('Generated summary:', summary.substring(0, 100) + '...');

      // Initialize Supabase client with service role key for admin access
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      
      if (!supabase) {
        console.error('Failed to initialize Supabase client');
        return new Response(JSON.stringify({ error: 'Failed to initialize Supabase client' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Save the summary to the appropriate table based on type
      if (type === 'image' && userId && projectId) {
        // Check if a summary already exists for this image in this project
        const { data: existingSummary, error: checkError } = await supabase
          .from('image_summaries')
          .select('id')
          .eq('image_url', imageUrl)
          .eq('project_id', projectId)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking for existing summary:', checkError);
          // Don't throw here, just log and continue
        }
        
        let saveError;
        
        if (existingSummary) {
          // Update existing summary
          console.log('Updating existing summary for image:', imageUrl);
          const { error } = await supabase
            .from('image_summaries')
            .update({
              summary: summary,
              user_id: userId, // Keep track of who last updated it
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSummary.id);
            
          saveError = error;
        } else {
          // Insert new summary
          console.log('Inserting new summary for image:', imageUrl);
          console.log('With project ID:', projectId);
          const { error } = await supabase
            .from('image_summaries')
            .insert({
              user_id: userId,
              image_url: imageUrl,
              summary: summary,
              project_id: projectId
            });
            
          saveError = error;
        }

        if (saveError) {
          console.error('Error saving image summary:', saveError);
          // Log error but don't fail the request - we still want to return the summary
        }
      } else if (type === 'note' && userId && projectId && noteId) {
        // Save note summary to note_summaries table
        console.log('Saving summary for note:', noteId);
        
        // Check if a summary already exists for this note
        const { data: existingNoteSummary, error: checkNoteError } = await supabase
          .from('note_summaries')
          .select('id')
          .eq('note_id', noteId)
          .maybeSingle();
          
        if (checkNoteError) {
          console.error('Error checking for existing note summary:', checkNoteError);
          // Don't throw here, just log and continue
        }
        
        let noteSaveError;
        
        if (existingNoteSummary) {
          // Update existing note summary
          console.log('Updating existing summary for note:', noteId);
          const { error } = await supabase
            .from('note_summaries')
            .update({
              summary: summary,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingNoteSummary.id);
            
          noteSaveError = error;
        } else {
          // Insert new note summary
          console.log('Inserting new summary for note:', noteId);
          const { error } = await supabase
            .from('note_summaries')
            .insert({
              user_id: userId,
              note_id: noteId,
              project_id: projectId,
              summary: summary
            });
            
          noteSaveError = error;
        }

        if (noteSaveError) {
          console.error('Error saving note summary:', noteSaveError);
          // Log error but don't fail the request - we still want to return the summary
        }
      }

      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (openAIError) {
      console.error('Error in OpenAI API call:', openAIError);
      return new Response(JSON.stringify({ error: openAIError.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
