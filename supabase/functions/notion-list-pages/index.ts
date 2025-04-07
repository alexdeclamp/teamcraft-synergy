
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
    const { 
      userId, 
      pageSize = 50, 
      startCursor = null,
      workspaceFilter = null,
      parentTypeFilter = null,
      searchQuery = null 
    } = await req.json();
    
    if (!userId) {
      throw new Error("Missing required parameter: userId");
    }
    
    console.log(`Processing request for userId: ${userId}, pageSize: ${pageSize}, startCursor: ${startCursor}`);
    console.log(`Filters: workspace=${workspaceFilter}, parentType=${parentTypeFilter}, search=${searchQuery}`);
    
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
    
    // Fetch workspace information first to get workspace name
    let workspaceName = 'Notion';
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
          workspaceName = userData.workspace_name;
        }
      }
    } catch (err) {
      console.error("Error fetching workspace details:", err);
    }
    
    // Fetch pages from Notion with pagination and filtering support
    const searchParams = {
      filter: {
        value: 'page',
        property: 'object'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: pageSize
    };
    
    // Add start_cursor for pagination if provided
    if (startCursor) {
      searchParams['start_cursor'] = startCursor;
    }
    
    // Add search query if provided
    if (searchQuery) {
      searchParams['query'] = searchQuery;
    }
    
    console.log("Sending search request to Notion API");
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API error:", errorData);
      throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    const searchResults = await response.json();
    console.log(`Retrieved ${searchResults.results?.length || 0} pages from Notion API`);
    
    // Prepare an array to hold the detailed page information
    const pagesWithDetails = [];
    
    // Process each page to get more details
    for (const page of searchResults.results) {
      try {
        let pageTitle = '';
        let pageIcon = null;
        let parentName = 'Workspace';
        
        // Extract title from properties
        if (page.properties?.title?.title?.length > 0) {
          pageTitle = page.properties.title.title.map(t => t.plain_text).join('');
        } else if (page.properties?.Name?.title?.length > 0) {
          pageTitle = page.properties.Name.title.map(t => t.plain_text).join('');
        } else {
          pageTitle = 'Untitled';
        }
        
        if (searchQuery && !pageTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
          continue; // Skip pages that don't match the search query
        }
        
        // Extract icon
        if (page.icon) {
          pageIcon = page.icon.type === 'emoji' ? page.icon.emoji : 
                    (page.icon.type === 'external' ? page.icon.external.url : null);
        }
        
        // Get parent information
        if (page.parent.type === 'database_id') {
          // Try to get the database name if it's a database item
          try {
            const dbResponse = await fetch(`https://api.notion.com/v1/databases/${page.parent.database_id}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Notion-Version': '2022-06-28',
              },
            });
            
            if (dbResponse.ok) {
              const dbData = await dbResponse.json();
              parentName = dbData.title?.[0]?.plain_text || 'Database';
            }
          } catch (err) {
            console.error("Error fetching database details:", err);
            parentName = 'Database';
          }
        } else if (page.parent.type === 'page_id') {
          parentName = 'Page';
        } else if (page.parent.type === 'workspace') {
          parentName = 'Workspace';
        }

        // Apply parent type filter if needed
        if (parentTypeFilter && page.parent.type !== parentTypeFilter) {
          continue; // Skip pages with different parent type
        }
        
        const pageData = {
          id: page.id,
          title: pageTitle,
          url: page.url,
          last_edited: page.last_edited_time,
          icon: pageIcon,
          parent: {
            type: page.parent.type,
            name: parentName,
            id: page.parent.database_id || page.parent.page_id || 'workspace'
          },
          workspace: {
            name: workspaceName
          },
          created_time: page.created_time,
          has_children: page.has_children
        };
        
        // Apply workspace filter if needed
        if (workspaceFilter && pageData.workspace.name !== workspaceFilter) {
          continue; // Skip pages from different workspaces
        }
        
        pagesWithDetails.push(pageData);
      } catch (error) {
        console.error(`Error processing page ${page.id}:`, error);
        // Continue with the next page
      }
    }
    
    console.log(`Successfully processed ${pagesWithDetails.length} pages with details after filtering`);
    
    // Return success response with pagination data and detailed pages
    return new Response(
      JSON.stringify({
        success: true,
        pages: pagesWithDetails,
        next_cursor: searchResults.next_cursor || null,
        has_more: searchResults.has_more || false,
        workspace_name: workspaceName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in notion-list-pages function:", error);
    
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
