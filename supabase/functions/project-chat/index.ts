
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
    const { projectId, message, userId, description, aiPersona } = await req.json();
    
    console.log(`Processing chat request for project: ${projectId}`);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Check if user can make this API call
    const { data: usageData, error: usageError } = await supabase.functions.invoke('track-usage', {
      body: { 
        userId: userId,
        action: 'log_api_call'
      }
    });
    
    if (usageError) {
      console.error('Error checking API usage:', usageError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify API usage limits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user has reached their limit
    if (usageData.limitReached && !usageData.canMakeCall) {
      console.log(`User ${userId} has reached their daily API limit`);
      return new Response(
        JSON.stringify({ 
          error: 'Daily API limit reached',
          limitReached: true,
          dailyApiCalls: usageData.dailyApiCalls
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify project exists and get the latest data
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectError) {
      console.error('Error fetching project data:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch project context
    const { data: notes } = await supabase
      .from('project_notes')
      .select('content, title, tags, is_favorite, is_important, is_archived')
      .eq('project_id', projectId)
      .order('is_favorite', { ascending: false })
      .order('is_important', { ascending: false });

    const { data: imageSummaries } = await supabase
      .from('image_summaries')
      .select('summary, is_favorite, is_important, is_archived')
      .eq('project_id', projectId);
    
    const { data: documents } = await supabase
      .from('project_documents')
      .select('file_name, content_text, is_favorite, is_important, is_archived')
      .eq('project_id', projectId);
    
    const { data: updatesData } = await supabase
      .from('project_updates')
      .select('content, created_at, user_id, is_important, is_archived')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Process updates if they exist
    let updatesWithUserNames = [];
    if (updatesData && updatesData.length > 0) {
      const userIds = [...new Set(updatesData.map(update => update.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const userMap = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          userMap[profile.id] = profile.full_name;
        });
      }
      
      updatesWithUserNames = updatesData.map(update => ({
        content: update.content,
        created_at: update.created_at,
        user_name: userMap[update.user_id] || 'Unknown User',
        is_important: update.is_important,
        is_archived: update.is_archived
      }));
    }

    // Combine project context
    const projectContext = `
    Project Title:
    ${projectData.title || 'No project title available.'}
    
    Project Description:
    ${projectData.description || 'No project description available.'}
    
    Project Notes:
    ${notes?.map(note => {
      const metadata = [];
      if (note.is_favorite) metadata.push('FAVORITE');
      if (note.is_important) metadata.push('IMPORTANT');
      if (note.is_archived) metadata.push('ARCHIVED');
      
      const metadataStr = metadata.length > 0 ? ` [${metadata.join(', ')}]` : '';
      return `Title: ${note.title}${metadataStr}\nContent: ${note.content}\nTags: ${note.tags?.join(', ') || 'No tags'}`;
    }).join('\n\n') || 'No notes available.'}
    
    Image Analysis:
    ${imageSummaries?.map(img => {
      const metadata = [];
      if (img.is_favorite) metadata.push('FAVORITE');
      if (img.is_important) metadata.push('IMPORTANT');
      if (img.is_archived) metadata.push('ARCHIVED');
      
      const metadataStr = metadata.length > 0 ? ` [${metadata.join(', ')}]` : '';
      return `${img.summary}${metadataStr}`;
    }).join('\n') || 'No image summaries available.'}
    
    Project Documents:
    ${documents?.map(doc => {
      const metadata = [];
      if (doc.is_favorite) metadata.push('FAVORITE');
      if (doc.is_important) metadata.push('IMPORTANT');
      if (doc.is_archived) metadata.push('ARCHIVED');
      
      const metadataStr = metadata.length > 0 ? ` [${metadata.join(', ')}]` : '';
      return `Document: ${doc.file_name}${metadataStr}\nContent: ${doc.content_text?.substring(0, 500)}${doc.content_text?.length > 500 ? '...' : ''}`;
    }).join('\n\n') || 'No documents available.'}
    
    Recent Updates:
    ${updatesWithUserNames.map(update => {
      const metadata = [];
      if (update.is_important) metadata.push('IMPORTANT');
      if (update.is_archived) metadata.push('ARCHIVED');
      
      const metadataStr = metadata.length > 0 ? ` [${metadata.join(', ')}]` : '';
      return `Update by ${update.user_name} on ${new Date(update.created_at).toLocaleDateString()}${metadataStr}: ${update.content}`;
    }).join('\n') || 'No recent updates.'}`;

    console.log(`Project context generated for: ${projectData.title}`);

    // Construct system message
    const systemMessage = `You are a Project Management Officer (PMO) assistant who helps discuss and analyze projects. 
    You are currently working on the project: "${projectData.title}".
    
    Use the following context about the project's notes, images, documents and updates to inform your responses:
    
    ${projectContext}
    
    When discussing the project:
    1. Reference specific notes, images, documents or updates when relevant
    2. Pay special attention to items marked as FAVORITE or IMPORTANT - these are critical project materials
    3. Be aware of ARCHIVED items but don't focus on them unless explicitly asked
    4. Provide actionable insights and suggestions
    5. Stay focused on project management best practices
    6. Be concise but informative
    7. ONLY discuss the current project, do not mention other projects like "Hotel booking funnel optimization" unless it's actually this project`;

    // Use OpenAI API
    console.log('Selected model: openai');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

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
