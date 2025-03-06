
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create a Supabase admin client with the service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      body = { action: null, userId: null };
    }
    
    const { action, userId } = body || {};
    
    // If no userId is provided, try to extract from the request header
    let userIdToUse = userId;
    if (!userIdToUse) {
      try {
        // Create a client using the request's authorization to extract the user
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
        const clientWithAuth = createClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: { Authorization: req.headers.get('Authorization')! },
            },
          }
        );
        
        const { data: { user }, error: authError } = await clientWithAuth.auth.getUser();
        
        if (authError || !user) {
          console.error('Authentication error:', authError);
          // Return empty/mock data for unauthenticated requests
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
        
        userIdToUse = user.id;
      } catch (error) {
        console.error('Error extracting user from token:', error);
        // Return empty data if auth fails
        return new Response(
          JSON.stringify({ 
            apiCalls: 0,
            storageUsed: "0 KB",
            activeBrains: 0,
            status: "error",
            message: "Failed to authenticate user"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }
    
    if (!userIdToUse) {
      return new Response(
        JSON.stringify({ 
          apiCalls: 0,
          storageUsed: "0 KB",
          activeBrains: 0,
          status: "error",
          message: "User ID is required"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Log the OpenAI API call if requested - using admin client
    if (action === 'log_api_call') {
      try {
        const { error: logError } = await adminClient.from('user_usage_stats').insert({
          user_id: userIdToUse,
          action_type: 'openai_api_call', // Changed from 'api_call' to 'openai_api_call'
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

    // Get user usage statistics - using admin client
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get OpenAI API call count for the current month
    let apiCallCount = 0;
    try {
      const { count, error: apiError } = await adminClient
        .from('user_usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userIdToUse)
        .eq('action_type', 'openai_api_call') // Changed from 'api_call' to 'openai_api_call'
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
      const { count, error: projectsError } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userIdToUse)
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
