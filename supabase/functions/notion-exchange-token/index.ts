
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
    const { code, userId } = await req.json();
    
    if (!code || !userId) {
      throw new Error("Missing required parameters: code and userId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get Notion credentials from env
    const notionClientId = Deno.env.get('NOTION_CLIENT_ID');
    const notionClientSecret = Deno.env.get('NOTION_CLIENT_SECRET');
    
    if (!notionClientId || !notionClientSecret) {
      throw new Error("Missing Notion API credentials");
    }
    
    // Exchange code for access token with Notion
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${notionClientId}:${notionClientSecret}`)}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${req.headers.get('origin')}/notion-connect`, // Must match the redirect URI in your Notion integration
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API error:", errorData);
      throw new Error(`Notion API error: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }
    
    const tokenData = await response.json();
    
    // Store the access token in the database
    const { error: insertError } = await supabase
      .from('notion_connections')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        bot_id: tokenData.bot_id,
        workspace_id: tokenData.workspace_id,
        workspace_name: tokenData.workspace_name,
        workspace_icon: tokenData.workspace_icon,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error(`Failed to save Notion connection: ${insertError.message}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        workspace_name: tokenData.workspace_name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in notion-exchange-token function:", error);
    
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
