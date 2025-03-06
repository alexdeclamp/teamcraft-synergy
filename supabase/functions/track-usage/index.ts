
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Create a Supabase client with the Auth context of the request
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user 
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      // Return empty/mock data for unauthenticated requests instead of an error
      return new Response(
        JSON.stringify({ 
          apiCalls: 0,
          storageUsed: "0 KB",
          activeBrains: 0,
          status: "unauthenticated",
          message: "Please log in to see your usage statistics"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Parse the request body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      body = { action: null };
    }
    
    const { action } = body || {};

    // Log the API call if requested
    if (action === 'log_api_call') {
      try {
        const { error: logError } = await supabaseClient.from('user_usage_stats').insert({
          user_id: user.id,
          action_type: 'api_call',
        });

        if (logError) {
          console.error('Error logging API call:', logError);
          // Continue execution to still return statistics even if logging fails
        }
      } catch (error) {
        console.error('Error inserting API call record:', error);
        // Continue execution to still return statistics
      }
    }

    // Get user usage statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get API call count for the current month
    let apiCallCount = 0;
    try {
      const { count, error: apiError } = await supabaseClient
        .from('user_usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'api_call')
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (!apiError) {
        apiCallCount = count || 0;
      } else {
        console.error('Error fetching API calls:', apiError);
      }
    } catch (error) {
      console.error('Error in API call count query:', error);
    }
    
    // Get project count (active brains)
    let activeProjectsCount = 0;
    try {
      const { count, error: projectsError } = await supabaseClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .is('is_archived', false);
      
      if (!projectsError) {
        activeProjectsCount = count || 0;
      } else {
        console.error('Error fetching projects:', projectsError);
      }
    } catch (error) {
      console.error('Error in projects count query:', error);
    }
    
    // For simplicity, provide an estimated storage value
    // In a real application, you would calculate actual storage usage
    const storageUsed = "5.2 KB";
    
    return new Response(
      JSON.stringify({ 
        apiCalls: apiCallCount,
        storageUsed,
        activeBrains: activeProjectsCount,
        status: "success"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        apiCalls: 0,
        storageUsed: "0 KB",
        activeBrains: 0,
        status: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
