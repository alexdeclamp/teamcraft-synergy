
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { action } = await req.json();

    // Log the API call
    if (action === 'log_api_call') {
      const { error } = await supabaseClient.from('user_usage_stats').insert({
        user_id: user.id,
        action_type: 'api_call',
      });

      if (error) {
        console.error('Error logging API call:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // Get user usage statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get API call count for the current month
    const { data: apiCallsData, error: apiError, count: apiCallCount } = await supabaseClient
      .from('user_usage_stats')
      .select('*', { count: 'exact' })
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
    
    // Get storage usage
    const { data: projectsData, error: projectsError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .is('is_archived', false);
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return new Response(
        JSON.stringify({ error: projectsError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const projectIds = projectsData?.map(project => project.id) || [];
    
    let totalStorageBytes = 0;
    
    // For each project, get the storage usage
    for (const projectId of projectIds) {
      try {
        const { data: storageBucket, error: storageError } = await supabaseClient
          .storage
          .from('project_images')
          .list(projectId);
        
        if (!storageError && storageBucket) {
          for (const file of storageBucket) {
            totalStorageBytes += file.metadata?.size || 0;
          }
        }
        
        // Also check documents storage
        const { data: documentsBucket, error: documentsError } = await supabaseClient
          .storage
          .from('project_documents')
          .list(projectId);
        
        if (!documentsError && documentsBucket) {
          for (const file of documentsBucket) {
            totalStorageBytes += file.metadata?.size || 0;
          }
        }
      } catch (storageErr) {
        console.error(`Error fetching storage for project ${projectId}:`, storageErr);
        // Continue with other projects instead of failing completely
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
    
    return new Response(
      JSON.stringify({ 
        apiCalls: apiCallsData?.length || 0,
        storageUsed,
        activeBrains: projectIds.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
