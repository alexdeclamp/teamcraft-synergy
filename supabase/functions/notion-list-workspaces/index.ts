
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
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("Missing required parameter: userId");
    }
    
    console.log(`Processing workspace request for userId: ${userId}`);
    
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
    
    // Get workspaces via the Notion API
    const workspaces = new Set<string>();
    
    // First get user info which contains the primary workspace
    try {
      const userResponse = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.workspace_name) {
          workspaces.add(userData.workspace_name);
        }
      }
    } catch (err) {
      console.error("Error fetching primary workspace:", err);
    }
    
    // Now perform a search to get pages from all available workspaces
    try {
      const searchResponse = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_size: 100,
          filter: {
            value: 'page',
            property: 'object'
          }
        }),
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        // Iterate through results to extract workspace names
        if (searchData.results && Array.isArray(searchData.results)) {
          // Use a set of promises to get workspace info in parallel
          const promises = searchData.results.map(async (page: any) => {
            try {
              // If page doesn't have workspace info directly, try to infer it from page data
              // or use additional API calls if needed
              if (page.workspace_name) {
                workspaces.add(page.workspace_name);
              } else if (page.parent && page.parent.workspace) {
                // Some pages have workspace info in the parent field
                const parentWorkspace = page.parent.workspace_name || "Workspace";
                workspaces.add(parentWorkspace);
              }
            } catch (err) {
              console.error("Error processing page for workspace info:", err);
            }
          });
          
          // Wait for all promises to resolve
          await Promise.all(promises);
        }
      }
    } catch (err) {
      console.error("Error fetching pages for workspace extraction:", err);
    }
    
    // If we still don't have any workspaces, add a default one
    if (workspaces.size === 0) {
      workspaces.add("Notion");
    }
    
    console.log(`Found ${workspaces.size} workspaces`);
    
    // Return the list of workspaces
    return new Response(
      JSON.stringify({
        success: true,
        workspaces: Array.from(workspaces),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in notion-list-workspaces function:", error);
    
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
