
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.25.0";

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
    // Create a Supabase client with the Auth context of the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key instead
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user data from the authenticated request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      body = { action: null };
    }
    
    const { action } = body || {};

    // Log the API call
    if (action === 'log_api_call') {
      const { error: logError } = await supabaseClient.from('user_usage_stats').insert({
        user_id: user.id,
        action_type: 'api_call',
      });

      if (logError) {
        console.error('Error logging API call:', logError);
        return new Response(
          JSON.stringify({ error: logError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // Get user usage statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get API call count for the current month
    const { count: apiCallCount, error: apiError } = await supabaseClient
      .from('user_usage_stats')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action_type', 'api_call')
      .gte('created_at', firstDayOfMonth.toISOString());
    
    if (apiError) {
      console.error('Error fetching API calls:', apiError);
      return new Response(
        JSON.stringify({ error: apiError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Get project count (active brains)
    const { data: projectsData, error: projectsError } = await supabaseClient
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .is('is_archived', false);
    
    const activeProjectsCount = projectsData?.length || 0;
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return new Response(
        JSON.stringify({ error: projectsError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Calculate storage usage
    let totalStorageBytes = 0;
    
    // Get all storage buckets
    const { data: buckets } = await supabaseClient.storage.listBuckets();
    
    if (buckets && buckets.length > 0) {
      for (const bucket of buckets) {
        // Check for project-specific storage by looking for user files
        try {
          const { data: files } = await supabaseClient.storage.from(bucket.name).list();
          
          if (files) {
            for (const file of files) {
              // If we can determine the file belongs to the user, add its size
              // This is a simplified approach - in practice, you'd want to check file ownership
              if (file.metadata?.owner_id === user.id) {
                totalStorageBytes += file.metadata?.size || 0;
              }
            }
          }
        } catch (err) {
          console.error(`Error checking bucket ${bucket.name}:`, err);
          // Continue with other buckets
        }
      }
    }
    
    // Format storage size
    let storageUsed;
    if (totalStorageBytes < 1024) {
      storageUsed = `${totalStorageBytes} bytes`;
    } else if (totalStorageBytes < 1024 * 1024) {
      storageUsed = `${(totalStorageBytes / 1024).toFixed(2)} KB`;
    } else {
      storageUsed = `${(totalStorageBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    // If we couldn't calculate storage accurately, provide a fallback
    if (totalStorageBytes === 0) {
      storageUsed = "0 KB";
    }
    
    return new Response(
      JSON.stringify({ 
        apiCalls: apiCallCount || 0,
        storageUsed,
        activeBrains: activeProjectsCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
