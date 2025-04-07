
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
      throw new Error("Missing required parameters: userId, pageId, projectId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user's Notion connection
    const { data: connectionData, error: connectionError } = await supabase
      .from('notion_connections')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (connectionError || !connectionData) {
      throw new Error("Notion connection not found. Please reconnect to Notion.");
    }
    
    const accessToken = connectionData.access_token;
    
    // Fetch the specific page content from Notion
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    
    if (!pageResponse.ok) {
      const errorData = await pageResponse.json();
      console.error("Notion API error fetching page:", errorData);
      throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    const pageData = await pageResponse.json();
    
    // Extract page title
    let title = 'Untitled';
    try {
      if (pageData.properties && pageData.properties.title) {
        title = pageData.properties.title.title[0]?.plain_text || 'Untitled';
      } else if (pageData.properties && pageData.properties.Name) {
        title = pageData.properties.Name.title[0]?.plain_text || 'Untitled';
      }
    } catch (e) {
      console.warn("Error extracting page title:", e);
    }
    
    // Fetch page content blocks
    const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    
    if (!blocksResponse.ok) {
      const errorData = await blocksResponse.json();
      console.error("Notion API error fetching blocks:", errorData);
      throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    const blocksData = await blocksResponse.json();
    
    // Process blocks to extract text content
    let content = '';
    
    // Simple block processing - actual implementation would need to handle 
    // various block types more comprehensively
    for (const block of blocksData.results) {
      if (block.type === 'paragraph') {
        const textContent = block.paragraph.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += textContent + '\n\n';
        }
      } else if (block.type === 'heading_1') {
        const textContent = block.heading_1.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `# ${textContent}\n\n`;
        }
      } else if (block.type === 'heading_2') {
        const textContent = block.heading_2.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `## ${textContent}\n\n`;
        }
      } else if (block.type === 'heading_3') {
        const textContent = block.heading_3.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `### ${textContent}\n\n`;
        }
      } else if (block.type === 'bulleted_list_item') {
        const textContent = block.bulleted_list_item.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `- ${textContent}\n`;
        }
      } else if (block.type === 'numbered_list_item') {
        const textContent = block.numbered_list_item.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `1. ${textContent}\n`;
        }
      } else if (block.type === 'to_do') {
        const textContent = block.to_do.rich_text.map((text: any) => text.plain_text).join('');
        const checked = block.to_do.checked ? '[x]' : '[ ]';
        if (textContent) {
          content += `${checked} ${textContent}\n`;
        }
      } else if (block.type === 'quote') {
        const textContent = block.quote.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `> ${textContent}\n\n`;
        }
      } else if (block.type === 'code') {
        const textContent = block.code.rich_text.map((text: any) => text.plain_text).join('');
        if (textContent) {
          content += `\`\`\`${block.code.language || ''}\n${textContent}\n\`\`\`\n\n`;
        }
      }
    }
    
    // Create note in project_notes table
    const { data: noteData, error: noteError } = await supabase
      .from('project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,
        title: title,
        content: content,
        tags: ['notion', 'imported'],
        source_document: {
          type: 'notion',
          notion_page_id: pageId,
          notion_url: pageData.url,
          imported_at: new Date().toISOString()
        },
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
