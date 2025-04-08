
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fetch page details from Notion API
export async function fetchPageDetails(pageId: string, accessToken: string) {
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
  
  return await pageResponse.json();
}

// Fetch page blocks (content) from Notion API
export async function fetchPageBlocks(pageId: string, accessToken: string) {
  const blockResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
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
  
  return await blockResponse.json();
}

// Fetch children blocks for a specific block
export async function fetchChildBlocks(blockId: string, accessToken: string) {
  const childrenResponse = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
    },
  });
  
  if (!childrenResponse.ok) {
    throw new Error(`Error fetching children for block ${blockId}`);
  }
  
  return await childrenResponse.json();
}

// Verify user has access to the project
export async function verifyProjectAccess(supabase: any, projectId: string, userId: string) {
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
  
  return true;
}

// Get Notion access token for a user
export async function getNotionAccessToken(supabase: any, userId: string) {
  const { data: connectionData, error: connectionError } = await supabase
    .from('notion_connections')
    .select('access_token')
    .eq('user_id', userId)
    .single();
  
  if (connectionError || !connectionData) {
    console.error("Error fetching Notion connection:", connectionError);
    throw new Error("Notion connection not found");
  }
  
  return connectionData.access_token;
}
