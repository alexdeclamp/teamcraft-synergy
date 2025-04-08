
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
    const { code, userId, redirectUri } = await req.json();
    
    if (!code || !userId) {
      throw new Error("Missing required parameters: code and userId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fixed Google Drive credentials
    const clientId = '312467123740-kapmie1lpqg4h5chlg3lh4pcs6iosfaa.apps.googleusercontent.com';
    const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET') || '';
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing Google Drive API credentials");
    }
    
    // Use the redirect URI passed from the frontend, or fallback to a fixed URI format
    const finalRedirectUri = redirectUri || `${req.headers.get('origin')}/google-drive-connect`;
    
    console.log("Exchanging code for access token with parameters:", {
      clientId,
      redirectUri: finalRedirectUri,
      code: "REDACTED"
    });
    
    // Exchange code for access token with Google OAuth API
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: finalRedirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google API error:", errorData);
      throw new Error(`Google API error: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }
    
    const tokenData = await response.json();
    console.log("Received token data:", {
      access_token: "REDACTED",
      refresh_token: "REDACTED",
      expires_in: tokenData.expires_in
    });
    
    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      console.error("Error fetching user info:", await userInfoResponse.text());
      throw new Error('Failed to fetch user info from Google Drive');
    }
    
    const userInfo = await userInfoResponse.json();
    
    // First check if there's an existing connection for this user
    const { data: existingConnection } = await supabase
      .from('google_drive_connections')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('google_drive_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || existingConnection.refresh_token,
          expires_at: expiresAt.toISOString(),
          user_email: userInfo.user.emailAddress,
          user_name: userInfo.user.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(`Failed to update Google Drive connection: ${updateError.message}`);
      }
    } else {
      // Insert new connection
      const { error: insertError } = await supabase
        .from('google_drive_connections')
        .insert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          user_email: userInfo.user.emailAddress,
          user_name: userInfo.user.displayName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(`Failed to save Google Drive connection: ${insertError.message}`);
      }
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        user_name: userInfo.user.displayName,
        user_email: userInfo.user.emailAddress,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in google-drive-exchange-token function:", error);
    
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
