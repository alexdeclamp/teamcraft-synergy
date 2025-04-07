
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, pageId, projectId } = await req.json();
    
    if (!userId || !pageId || !projectId) {
      throw new Error("Missing required parameters: userId, pageId, and projectId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the project exists and user has access to it
    const { data: projectAccess, error: projectError } = await supabase.rpc(
      'is_project_member',
      { project_id: projectId, user_id: userId }
    );
    
    const { data: projectOwner, error: ownerError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();
      
    if ((projectError && ownerError) || (!projectAccess && projectOwner?.owner_id !== userId)) {
      throw new Error("You don't have access to this project");
    }
    
    // Get the Notion access token from the database
    const { data: connectionData, error: connectionError } = await supabase
      .from('notion_connections')
      .select('access_token')
      .eq('user_id', userId)
      .single();
    
    if (connectionError || !connectionData) {
      console.error("Error fetching Notion connection:", connectionError);
      throw new Error("Notion connection not found");
    }
    
    const accessToken = connectionData.access_token;
    
    // Fetch page details from Notion
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });
    
    if (!pageResponse.ok) {
      const errorData = await pageResponse.json();
      console.error("Notion API error (page):", errorData);
      throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    const pageData = await pageResponse.json();
    
    // Fetch page content from Notion
    const blockResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });
    
    if (!blockResponse.ok) {
      const errorData = await blockResponse.json();
      console.error("Notion API error (blocks):", errorData);
      throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    const blocksData = await blockResponse.json();
    
    // Get page title
    const pageTitle = pageData.properties.title?.title?.[0]?.plain_text || 
                      pageData.properties.Name?.title?.[0]?.plain_text || 
                      'Untitled Notion Page';
    
    // Convert blocks to markdown-like format
    let content = '';
    
    for (const block of blocksData.results) {
      switch (block.type) {
        case 'paragraph':
          if (block.paragraph.rich_text && block.paragraph.rich_text.length > 0) {
            content += block.paragraph.rich_text.map((text) => text.plain_text).join('') + '\n\n';
          } else {
            content += '\n';
          }
          break;
        case 'heading_1':
          if (block.heading_1.rich_text && block.heading_1.rich_text.length > 0) {
            content += '# ' + block.heading_1.rich_text.map((text) => text.plain_text).join('') + '\n\n';
          }
          break;
        case 'heading_2':
          if (block.heading_2.rich_text && block.heading_2.rich_text.length > 0) {
            content += '## ' + block.heading_2.rich_text.map((text) => text.plain_text).join('') + '\n\n';
          }
          break;
        case 'heading_3':
          if (block.heading_3.rich_text && block.heading_3.rich_text.length > 0) {
            content += '### ' + block.heading_3.rich_text.map((text) => text.plain_text).join('') + '\n\n';
          }
          break;
        case 'bulleted_list_item':
          if (block.bulleted_list_item.rich_text && block.bulleted_list_item.rich_text.length > 0) {
            content += '- ' + block.bulleted_list_item.rich_text.map((text) => text.plain_text).join('') + '\n';
          }
          break;
        case 'numbered_list_item':
          if (block.numbered_list_item.rich_text && block.numbered_list_item.rich_text.length > 0) {
            content += '1. ' + block.numbered_list_item.rich_text.map((text) => text.plain_text).join('') + '\n';
          }
          break;
        case 'to_do':
          if (block.to_do.rich_text && block.to_do.rich_text.length > 0) {
            const checkbox = block.to_do.checked ? '[x]' : '[ ]';
            content += `- ${checkbox} ` + block.to_do.rich_text.map((text) => text.plain_text).join('') + '\n';
          }
          break;
        case 'quote':
          if (block.quote.rich_text && block.quote.rich_text.length > 0) {
            content += '> ' + block.quote.rich_text.map((text) => text.plain_text).join('') + '\n\n';
          }
          break;
        case 'code':
          if (block.code.rich_text && block.code.rich_text.length > 0) {
            content += '```' + (block.code.language || '') + '\n' + 
                        block.code.rich_text.map((text) => text.plain_text).join('') + 
                        '\n```\n\n';
          }
          break;
        case 'divider':
          content += '---\n\n';
          break;
      }
    }
    
    // Create a note with the Notion content
    const { data: noteData, error: noteError } = await supabase
      .from('project_notes')
      .insert({
        title: `Notion: ${pageTitle}`,
        content: content.trim(),
        project_id: projectId,
        user_id: userId,
        tags: ['notion', 'imported', 'notion-import'],
        source_document: {
          type: 'notion',
          url: pageData.url,
          name: pageTitle,
          id: pageId
        }
      })
      .select()
      .single();
    
    if (noteError) {
      console.error("Error creating note:", noteError);
      throw new Error(`Failed to create note: ${noteError.message}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        note: noteData,
        message: `Successfully imported "${pageTitle}" from Notion`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in notion-import-page function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
