
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
    const { projectId, message, userId } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Fetch project notes
    const { data: notes } = await supabase
      .from('project_notes')
      .select('content, summary')
      .eq('project_id', projectId);

    // Fetch image summaries
    const { data: imageSummaries } = await supabase
      .from('image_summaries')
      .select('summary')
      .eq('user_id', userId);

    // Combine all project context
    const projectContext = `
    Project Notes and Summaries:
    ${notes?.map(note => `Note: ${note.content}\nSummary: ${note.summary}`).join('\n\n') || 'No notes available.'}
    
    Image Analysis:
    ${imageSummaries?.map(img => img.summary).join('\n') || 'No image summaries available.'}
    `;

    const messages = [
      {
        role: 'system',
        content: `You are a Project Management Officer (PMO) assistant who helps discuss and analyze projects. 
        Use the following context about the project's notes and images to inform your responses:
        
        ${projectContext}
        
        When discussing the project:
        1. Reference specific notes or images when relevant
        2. Provide actionable insights and suggestions
        3. Stay focused on project management best practices
        4. Be concise but informative
        `
      },
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to OpenAI');
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
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in project-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
