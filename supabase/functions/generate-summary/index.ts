
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
    const { type, content, imageUrl, userId, projectId } = await req.json();
    
    console.log(`Processing ${type} summary request`);
    console.log(`User ID: ${userId}`);
    
    if (!projectId) {
      throw new Error('Project ID is required for generating summaries');
    }
    
    if (type === 'image') {
      console.log(`Image URL: ${imageUrl}`);
      console.log(`Project ID: ${projectId}`);
    }
    
    let prompt = '';
    let messages = [];
    let model = 'gpt-4o-mini'; // Default model for all summaries now
    
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
      // Using the same model for image analysis to avoid potential issues
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
      throw new Error('Invalid summary type requested');
    }

    console.log('Sending request to OpenAI API with model:', model);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
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
          max_tokens: 500, // Add a limit to ensure we get a response
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
          // If JSON parsing fails, use the raw error text
          errorMessage = errorText.substring(0, 100); // Limit length
        }
        
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('OpenAI API response:', JSON.stringify(data).substring(0, 200));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Invalid response structure from OpenAI:', JSON.stringify(data));
        throw new Error('Invalid response structure from OpenAI');
      }
      
      const summary = data.choices[0].message.content;

      if (type === 'image' && userId && projectId) {
        // Initialize Supabase client with service role key for admin access
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
        
        if (!supabase) {
          throw new Error('Failed to initialize Supabase client');
        }
        
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
          console.error('Error saving summary:', saveError);
          // Log error but don't throw - we still want to return the summary
        }
      }

      console.log('Successfully generated summary:', summary.substring(0, 100) + '...');

      return new Response(JSON.stringify({ summary }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (openAIError) {
      console.error('Error in OpenAI API call:', openAIError);
      return new Response(JSON.stringify({ error: openAIError.message }), {
        status: 200, // Return 200 instead of 500 to avoid the "non-2xx status code" issue
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, // Return 200 even for errors to avoid the "non-2xx status code" issue
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
