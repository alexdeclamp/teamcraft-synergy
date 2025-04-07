
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
    
    // Fixed Notion credentials
    const notionClientId = '1ced872b-594c-8011-973d-0037bb560676';
    const notionClientSecret = 'secret_8rG8VbVfc4IlB3etPPktydFKT2A8TNdAeoVLy4xpQiH';
    
    if (!notionClientId || !notionClientSecret) {
      throw new Error("Missing Notion API credentials");
    }
    
    // Get the redirect URI from the request origin
    const redirectUri = `${req.headers.get('origin')}/notion-connect`;
    
    console.log("Exchanging code for access token with parameters:", {
      notionClientId,
      redirectUri,
      code: "REDACTED"
    });
    
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
        redirect_uri: redirectUri,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion API error:", errorData);
      throw new Error(`Notion API error: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }
    
    const tokenData = await response.json();
    console.log("Received token data:", {
      workspace_name: tokenData.workspace_name,
      bot_id: tokenData.bot_id
    });
    
    // First check if there's an existing connection for this user
    const { data: existingConnection } = await supabase
      .from('notion_connections')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('notion_connections')
        .update({
          access_token: tokenData.access_token,
          bot_id: tokenData.bot_id,
          workspace_id: tokenData.workspace_id,
          workspace_name: tokenData.workspace_name,
          workspace_icon: tokenData.workspace_icon,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(`Failed to update Notion connection: ${updateError.message}`);
      }
    } else {
      // Insert new connection
      const { error: insertError } = await supabase
        .from('notion_connections')
        .insert({
          user_id: userId,
          access_token: tokenData.access_token,
          bot_id: tokenData.bot_id,
          workspace_id: tokenData.workspace_id,
          workspace_name: tokenData.workspace_name,
          workspace_icon: tokenData.workspace_icon,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(`Failed to save Notion connection: ${insertError.message}`);
      }
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
