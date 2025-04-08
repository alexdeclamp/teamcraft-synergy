
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
    
    // Revoke the token with Google (if possible)
    const { data: connection } = await supabase
      .from('google_drive_connections')
      .select('access_token')
      .eq('user_id', userId)
      .single();
      
    if (connection?.access_token) {
      try {
        // Attempt to revoke the token
        await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (revokeError) {
        // Just log the error but continue with disconnection
        console.error("Error revoking Google token:", revokeError);
      }
    }
    
    // Delete the connection from the database
    const { error } = await supabase
      .from('google_drive_connections')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error("Supabase delete error:", error);
      throw new Error(`Failed to delete Google Drive connection: ${error.message}`);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Google Drive connection deleted successfully",
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in google-drive-disconnect function:", error);
    
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
