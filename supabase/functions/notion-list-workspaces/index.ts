
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
    
    // Get the list of workspaces the user has access to
    console.log("Fetching workspaces from Notion API");
    const workspaces = [];
    
    // First, get the user's primary workspace from their user profile
    const userResponse = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      
      if (userData.workspace_name) {
        workspaces.push(userData.workspace_name);
      }
      
      // Additionally, fetch a small sample of pages to find other workspaces
      const searchResponse = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_size: 10,
          filter: {
            value: 'page',
            property: 'object'
          }
        }),
      });
      
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        
        // Extract unique workspace names from results
        for (const page of searchResults.results) {
          try {
            // Some pages might have workspace information
            if (page.workspace_name && !workspaces.includes(page.workspace_name)) {
              workspaces.push(page.workspace_name);
            }
            
            // Try to get workspace info from workspace icon
            if (page.workspace_icon && page.workspace_icon.workspace_name && 
                !workspaces.includes(page.workspace_icon.workspace_name)) {
              workspaces.push(page.workspace_icon.workspace_name);
            }
          } catch (err) {
            console.error("Error processing page workspace info:", err);
          }
        }
      }
    }
    
    // If no workspaces found, add a default one
    if (workspaces.length === 0) {
      workspaces.push("My Notion Workspace");
    }
    
    console.log(`Found ${workspaces.length} workspaces`);
    
    // Return success response with workspaces list
    return new Response(
      JSON.stringify({
        success: true,
        workspaces: workspaces
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
