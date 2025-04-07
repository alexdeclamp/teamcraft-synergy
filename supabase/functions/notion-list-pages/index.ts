
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
    const { userId, pageSize = 30, startCursor = null, parentId = null, mode = 'pages' } = await req.json();
    
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
    
    // If in workspace mode, fetch workspace structure
    if (mode === 'workspaces') {
      return await getWorkspaces(accessToken, corsHeaders);
    }
    
    // If in parent mode, fetch children of specified parent
    if (mode === 'parent' && parentId) {
      return await getParentChildren(accessToken, parentId, pageSize, startCursor, corsHeaders);
    }
    
    // Default mode - fetch pages with pagination support
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

    // Add parent filter if provided
    if (parentId) {
      searchParams['filter'] = {
        property: 'parent',
        value: {
          type: 'page_id',
          page_id: parentId
        }
      };
    }
    
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
    
    // Prepare an array to hold the detailed page information
    const pagesWithDetails = [];
    
    // Process each page to get more details
    for (const page of searchResults.results) {
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
      
      pagesWithDetails.push({
        id: page.id,
        title: pageTitle,
        url: page.url,
        last_edited: page.last_edited_time,
        icon: pageIcon,
        parent: {
          type: page.parent.type,
          id: page.parent.type === 'database_id' ? page.parent.database_id : 
              (page.parent.type === 'page_id' ? page.parent.page_id : null),
          name: parentName
        },
        created_time: page.created_time,
        has_children: page.has_children
      });
    }
    
    // Return success response with pagination data and detailed pages
    return new Response(
      JSON.stringify({
        success: true,
        pages: pagesWithDetails,
        next_cursor: searchResults.next_cursor || null,
        has_more: searchResults.has_more || false
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

// Function to get workspaces and top-level pages/databases
async function getWorkspaces(accessToken, corsHeaders) {
  try {
    // First get databases
    const dbResponse = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          value: 'database',
          property: 'object'
        },
        page_size: 100
      }),
    });
    
    if (!dbResponse.ok) {
      throw new Error(`Failed to fetch databases: ${dbResponse.statusText}`);
    }
    
    const dbResults = await dbResponse.json();
    
    // Get top level pages (in workspace)
    const pageResponse = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'parent',
          value: {
            type: 'workspace'
          }
        },
        page_size: 100
      }),
    });
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch top-level pages: ${pageResponse.statusText}`);
    }
    
    const pageResults = await pageResponse.json();
    
    const workspaceItems = [];
    
    // Process databases
    for (const db of dbResults.results) {
      let dbTitle = '';
      let dbIcon = null;
      
      if (db.title && db.title.length > 0) {
        dbTitle = db.title.map(t => t.plain_text).join('');
      } else {
        dbTitle = 'Untitled Database';
      }
      
      if (db.icon) {
        dbIcon = db.icon.type === 'emoji' ? db.icon.emoji : 
                (db.icon.type === 'external' ? db.icon.external.url : null);
      }
      
      workspaceItems.push({
        id: db.id,
        title: dbTitle,
        icon: dbIcon,
        type: 'database',
        parent: {
          type: db.parent.type,
          id: db.parent.type === 'page_id' ? db.parent.page_id : null
        },
        has_children: true,
        last_edited: db.last_edited_time
      });
    }
    
    // Process pages
    for (const page of pageResults.results) {
      if (page.object === 'page') {
        let pageTitle = '';
        let pageIcon = null;
        
        // Extract title
        if (page.properties?.title?.title?.length > 0) {
          pageTitle = page.properties.title.title.map(t => t.plain_text).join('');
        } else if (page.properties?.Name?.title?.length > 0) {
          pageTitle = page.properties.Name.title.map(t => t.plain_text).join('');
        } else {
          pageTitle = 'Untitled';
        }
        
        // Extract icon
        if (page.icon) {
          pageIcon = page.icon.type === 'emoji' ? page.icon.emoji : 
                    (page.icon.type === 'external' ? page.icon.external.url : null);
        }
        
        workspaceItems.push({
          id: page.id,
          title: pageTitle,
          icon: pageIcon,
          type: 'page',
          parent: {
            type: page.parent.type,
            id: null
          },
          has_children: page.has_children,
          url: page.url,
          last_edited: page.last_edited_time
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        workspaces: workspaceItems
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error fetching workspaces"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}

// Function to get children of a specific parent (page or database)
async function getParentChildren(accessToken, parentId, pageSize, startCursor, corsHeaders) {
  try {
    // Check what type of parent we have (page or database)
    const parentResponse = await fetch(`https://api.notion.com/v1/blocks/${parentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    
    if (!parentResponse.ok) {
      const parentData = await parentResponse.json();
      
      if (parentData.code === 'object_not_found') {
        // If not found as a block, try as a database
        return await getDatabaseItems(accessToken, parentId, pageSize, startCursor, corsHeaders);
      }
      
      throw new Error(`Failed to fetch parent info: ${parentResponse.statusText}`);
    }
    
    // It's a page, get its children
    const childrenResponse = await fetch(`https://api.notion.com/v1/blocks/${parentId}/children`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    
    if (!childrenResponse.ok) {
      throw new Error(`Failed to fetch children: ${childrenResponse.statusText}`);
    }
    
    const childrenData = await childrenResponse.json();
    
    const childItems = [];
    
    for (const child of childrenData.results) {
      if (child.type === 'child_page') {
        childItems.push({
          id: child.id,
          title: child.child_page.title || 'Untitled',
          type: 'page',
          has_children: true,
          parent: {
            type: 'page_id',
            id: parentId
          }
        });
      } else if (child.type === 'child_database') {
        childItems.push({
          id: child.id,
          title: child.child_database.title || 'Untitled Database',
          type: 'database',
          has_children: true,
          parent: {
            type: 'page_id',
            id: parentId
          }
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        children: childItems,
        next_cursor: childrenData.next_cursor || null,
        has_more: childrenData.has_more || false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error fetching parent children"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}

// Function to get database items
async function getDatabaseItems(accessToken, databaseId, pageSize, startCursor, corsHeaders) {
  try {
    const queryParams = {
      page_size: pageSize
    };
    
    if (startCursor) {
      queryParams['start_cursor'] = startCursor;
    }
    
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryParams),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to query database: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const items = [];
    
    for (const page of data.results) {
      let pageTitle = '';
      let pageIcon = null;
      
      // Extract title
      const titleProp = Object.values(page.properties).find(
        (prop: any) => prop.type === 'title'
      ) as any;
      
      if (titleProp?.title?.length > 0) {
        pageTitle = titleProp.title.map((t: any) => t.plain_text).join('');
      } else {
        pageTitle = 'Untitled';
      }
      
      // Extract icon
      if (page.icon) {
        pageIcon = page.icon.type === 'emoji' ? page.icon.emoji : 
                  (page.icon.type === 'external' ? page.icon.external.url : null);
      }
      
      items.push({
        id: page.id,
        title: pageTitle,
        icon: pageIcon,
        type: 'page',
        url: page.url,
        parent: {
          type: 'database_id',
          id: databaseId
        },
        has_children: page.has_children,
        last_edited: page.last_edited_time
      });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        items: items,
        next_cursor: data.next_cursor || null,
        has_more: data.has_more || false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error querying database:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error querying database"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}
