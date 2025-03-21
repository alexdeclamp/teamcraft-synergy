
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
    
    // First, enable real-time for the user_usage_stats table if not already enabled
    try {
      await adminClient.rpc('supabase_functions.get_config');
      
      // Enable realtime for user_usage_stats table
      await adminClient.query(`
        ALTER TABLE user_usage_stats REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE user_usage_stats;
      `).catch(e => {
        // This might fail if already configured, which is fine
        console.log('Realtime setup note:', e.message);
      });
    } catch (error) {
      console.warn('Could not setup realtime:', error);
      // Continue execution even if this fails
    }
    
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
              dailyApiCalls: 0,
              status: "unauthenticated",
              message: "Please log in to see your usage statistics",
              limitReached: false
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
            dailyApiCalls: 0,
            status: "error",
            message: "Failed to authenticate user",
            limitReached: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }
    
    if (!userIdToUse) {
      return new Response(
        JSON.stringify({ 
          apiCalls: 0,
          dailyApiCalls: 0,
          status: "error",
          message: "User ID is required",
          limitReached: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get user's subscription plan
    const { data: subscriptionData, error: subscriptionError } = await adminClient.rpc(
      'get_user_subscription',
      { p_user_id: userIdToUse }
    );
    
    const isPro = subscriptionData && subscriptionData.plan_type === 'pro';
    
    // Get current API usage
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let dailyApiCallCount = 0;
    try {
      const { count, error: dailyApiError } = await adminClient
        .from('user_usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userIdToUse)
        .eq('action_type', 'openai_api_call')
        .gte('created_at', startOfDay.toISOString());
      
      if (!dailyApiError) {
        dailyApiCallCount = count || 0;
      } else {
        console.error('Error fetching daily API calls:', dailyApiError);
      }
    } catch (error) {
      console.error('Error in daily API call count query:', error);
    }
    
    // Check if user has reached their daily limit (if they're not on pro plan)
    const dailyLimit = 10; // Starter plan limit
    const limitReached = !isPro && dailyApiCallCount >= dailyLimit;

    // Log the OpenAI API call if requested and limit not reached
    if (action === 'log_api_call') {
      // Check if user has reached their limit before allowing the call
      if (limitReached) {
        return new Response(
          JSON.stringify({ 
            apiCalls: 0,
            dailyApiCalls: dailyApiCallCount,
            status: "error",
            message: "Daily API limit reached",
            limitReached: true,
            canMakeCall: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      
      try {
        const { error: logError } = await adminClient.from('user_usage_stats').insert({
          user_id: userIdToUse,
          action_type: 'openai_api_call',
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
    // Only count rows where action_type is 'openai_api_call'
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get OpenAI API call count for the current month
    let apiCallCount = 0;
    try {
      const { count, error: apiError } = await adminClient
        .from('user_usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userIdToUse)
        .eq('action_type', 'openai_api_call')
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (!apiError) {
        apiCallCount = count || 0;
      } else {
        console.error('Error fetching API calls:', apiError);
      }
    } catch (error) {
      console.error('Error in API call count query:', error);
    }
    
    // Now that we've possibly logged a new call, get the updated daily count
    if (action === 'log_api_call' && !limitReached) {
      try {
        const { count, error: dailyApiError } = await adminClient
          .from('user_usage_stats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userIdToUse)
          .eq('action_type', 'openai_api_call')
          .gte('created_at', startOfDay.toISOString());
        
        if (!dailyApiError) {
          dailyApiCallCount = count || 0;
        }
      } catch (error) {
        console.error('Error updating daily API call count:', error);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        apiCalls: apiCallCount,
        dailyApiCalls: dailyApiCallCount,
        status: "success",
        limitReached: limitReached,
        canMakeCall: !limitReached || isPro
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        apiCalls: 0,
        dailyApiCalls: 0,
        status: "error",
        limitReached: false,
        canMakeCall: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
