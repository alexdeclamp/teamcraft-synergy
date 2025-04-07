
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
    
    // Fetch page from Notion
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
    
    // Fetch page content (blocks) from Notion
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
    
    // Extract title from page data
    const pageTitle = pageData.properties.title?.title?.[0]?.plain_text || 
                      pageData.properties.Name?.title?.[0]?.plain_text || 
                      'Imported from Notion';
    
    // Convert Notion blocks to markdown (simplified version)
    let content = '';
    for (const block of blocksData.results) {
      if (block.type === 'paragraph') {
        const text = block.paragraph.rich_text.map((rt: any) => rt.plain_text).join('');
        content += text + '\n\n';
      } else if (block.type === 'heading_1') {
        const text = block.heading_1.rich_text.map((rt: any) => rt.plain_text).join('');
        content += `# ${text}\n\n`;
      } else if (block.type === 'heading_2') {
        const text = block.heading_2.rich_text.map((rt: any) => rt.plain_text).join('');
        content += `## ${text}\n\n`;
      } else if (block.type === 'heading_3') {
        const text = block.heading_3.rich_text.map((rt: any) => rt.plain_text).join('');
        content += `### ${text}\n\n`;
      } else if (block.type === 'bulleted_list_item') {
        const text = block.bulleted_list_item.rich_text.map((rt: any) => rt.plain_text).join('');
        content += `- ${text}\n`;
      } else if (block.type === 'numbered_list_item') {
        const text = block.numbered_list_item.rich_text.map((rt: any) => rt.plain_text).join('');
        content += `1. ${text}\n`;
      } else if (block.type === 'to_do') {
        const text = block.to_do.rich_text.map((rt: any) => rt.plain_text).join('');
        const checked = block.to_do.checked ? '[x]' : '[ ]';
        content += `- ${checked} ${text}\n`;
      } else if (block.type === 'quote') {
        const text = block.quote.rich_text.map((rt: any) => rt.plain_text).join('');
        content += `> ${text}\n\n`;
      } else if (block.type === 'code') {
        const text = block.code.rich_text.map((rt: any) => rt.plain_text).join('');
        const language = block.code.language || '';
        content += `\`\`\`${language}\n${text}\n\`\`\`\n\n`;
      } else if (block.type === 'divider') {
        content += `---\n\n`;
      }
    }
    
    // Save as project note
    const { data: noteData, error: noteError } = await supabase
      .from('project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,
        title: pageTitle,
        content: content,
        tags: ['notion-import'],
        source_document: {
          type: 'notion',
          pageId: pageId,
          url: pageData.url,
          imported_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (noteError) {
      console.error("Error saving note:", noteError);
      throw new Error(`Failed to save imported note: ${noteError.message}`);
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
