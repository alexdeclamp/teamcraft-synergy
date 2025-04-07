
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
    
    // Fetch pages from Notion API
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          value: 'page',
          property: 'object'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API error:", errorData);
      throw new Error(`Notion API error: ${errorData.message || 'Unknown error'}`);
    }
    
    const searchResults = await response.json();
    
    // Process and format the pages
    const pages = searchResults.results.map((page: any) => {
      // Extract page title - this is a simplification, actual implementation
      // would need to handle different page structure formats
      let title = 'Untitled';
      
      try {
        if (page.properties && page.properties.title) {
          title = page.properties.title.title[0]?.plain_text || 'Untitled';
        } else if (page.properties && page.properties.Name) {
          title = page.properties.Name.title[0]?.plain_text || 'Untitled';
        }
      } catch (e) {
        console.warn("Error extracting page title:", e);
      }
      
      return {
        id: page.id,
        title,
        type: page.object,
        url: page.url,
        last_edited: page.last_edited_time,
      };
    });
    
    // Return pages list
    return new Response(
      JSON.stringify({
        success: true,
        pages,
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
