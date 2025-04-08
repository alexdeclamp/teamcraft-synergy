
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
    const { userId, folderId } = await req.json();
    
    if (!userId) {
      throw new Error("Missing required parameter: userId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the user's Google Drive connection
    const { data: connection, error: connectionError } = await supabase
      .from('google_drive_connections')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (connectionError || !connection) {
      throw new Error("Google Drive connection not found");
    }
    
    // Use the access token to fetch files
    const fileListUrl = folderId
      ? `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime)&pageSize=100`
      : `https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime)&pageSize=100`;
    
    const response = await fetch(fileListUrl, {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if token has expired (401 error)
      if (response.status === 401) {
        // Token expired, need to refresh
        if (connection.refresh_token) {
          try {
            const refreshResponse = await refreshAccessToken(connection.refresh_token);
            
            // Update the access token in the database
            const { error: updateError } = await supabase
              .from('google_drive_connections')
              .update({
                access_token: refreshResponse.access_token,
                expires_at: new Date(Date.now() + refreshResponse.expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
              
            if (updateError) {
              throw new Error(`Failed to update access token: ${updateError.message}`);
            }
            
            // Retry the request with the new token
            const retryResponse = await fetch(fileListUrl, {
              headers: {
                'Authorization': `Bearer ${refreshResponse.access_token}`,
              },
            });
            
            if (!retryResponse.ok) {
              throw new Error(`Google API error after refresh: ${await retryResponse.text()}`);
            }
            
            const retryData = await retryResponse.json();
            
            return new Response(
              JSON.stringify(retryData),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            throw new Error(`Token refresh failed: ${refreshError.message}`);
          }
        } else {
          throw new Error("Access token expired and no refresh token available");
        }
      }
      
      console.error("Google API error:", errorData);
      throw new Error(`Google API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in google-drive-import function:", error);
    
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

// Helper function to refresh an access token
async function refreshAccessToken(refreshToken: string) {
  const clientId = '312467123740-kapmie1lpqg4h5chlg3lh4pcs6iosfaa.apps.googleusercontent.com';
  const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET') || '';
  
  if (!clientSecret) {
    throw new Error("Missing Google Drive client secret");
  }
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Refresh token error: ${JSON.stringify(errorData)}`);
  }
  
  return await response.json();
}
