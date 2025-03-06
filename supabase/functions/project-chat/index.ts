
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
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Fetch project notes with favorite and important flags
    const { data: notes } = await supabase
      .from('project_notes')
      .select('content, title, tags, is_favorite, is_important, is_archived')
      .eq('project_id', projectId)
      .order('is_favorite', { ascending: false })
      .order('is_important', { ascending: false });

    // Fetch image summaries with metadata
    const { data: imageSummaries } = await supabase
      .from('image_summaries')
      .select('summary, is_favorite, is_important, is_archived')
      .eq('user_id', userId);
    
    // Fetch project documents with metadata
    const { data: documents } = await supabase
      .from('project_documents')
      .select('file_name, content_text, is_favorite, is_important, is_archived')
      .eq('project_id', projectId);
    
    // Fetch project updates
    const { data: updatesData } = await supabase
      .from('project_updates')
      .select('content, created_at, user_id, is_important, is_archived')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Process updates if they exist
    let updatesWithUserNames = [];
    if (updatesData && updatesData.length > 0) {
      // Extract user IDs
      const userIds = [...new Set(updatesData.map(update => update.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      // Create a user map
      const userMap = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          userMap[profile.id] = profile.full_name;
        });
      }
      
      // Join the data manually
      updatesWithUserNames = updatesData.map(update => ({
        content: update.content,
        created_at: update.created_at,
        user_name: userMap[update.user_id] || 'Unknown User',
        is_important: update.is_important,
        is_archived: update.is_archived
      }));
    }

    // Combine all project context
    const projectContext = `
    Project Description:
    ${description || 'No project description available.'}
    
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
    }).join('\n') || 'No recent updates.'}
    `;

    console.log('Project context assembled from multiple sources');
    console.log('Information being sent to OpenAI:');
    console.log('------------------------------');
    console.log(projectContext);
    console.log('------------------------------');
    
    // Construct the system message with the AI persona
    let systemMessage = `You are a Project Management Officer (PMO) assistant who helps discuss and analyze projects. 
    Use the following context about the project's notes, images, documents and updates to inform your responses:
    
    ${projectContext}
    
    When discussing the project:
    1. Reference specific notes, images, documents or updates when relevant
    2. Pay special attention to items marked as FAVORITE or IMPORTANT - these are critical project materials
    3. Be aware of ARCHIVED items but don't focus on them unless explicitly asked
    4. Provide actionable insights and suggestions
    5. Stay focused on project management best practices
    6. Be concise but informative`;
    
    // Add the AI persona if provided
    if (aiPersona) {
      console.log('Using custom AI persona:', aiPersona.substring(0, 100) + (aiPersona.length > 100 ? '...' : ''));
      systemMessage += `\n\nAdditional persona instructions: ${aiPersona}`;
    }
    
    const messages = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: message
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
