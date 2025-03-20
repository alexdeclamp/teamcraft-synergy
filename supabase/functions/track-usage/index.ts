
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
          status: "error",
          message: "User ID is required"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get user subscription info to check limits
    let userSubscription = null;
    let planDetails = null;
    let canMakeApiCall = true;
    let canCreateBrain = true;
    let limitMessage = null;
    
    try {
      // First get the user's subscription
      const { data: subscriptionData, error: subError } = await adminClient.rpc(
        'get_user_subscription',
        { p_user_id: userIdToUse }
      );
      
      if (!subError && subscriptionData) {
        userSubscription = subscriptionData;
        
        // Then get the plan details to check limits
        const { data: planData, error: planError } = await adminClient
          .from('subscription_tiers')
          .select('*')
          .eq('plan_type', subscriptionData.plan_type)
          .eq('is_default', true)
          .maybeSingle();
        
        if (!planError && planData) {
          planDetails = planData;
          
          // Early return for pro users - they don't have limits
          if (planData.plan_type === 'pro') {
            // Pro users can always proceed
            if (action === 'check_brain_limit') {
              return new Response(
                JSON.stringify({
                  status: "success",
                  canProceed: true,
                  message: "Pro users have unlimited brains"
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
              );
            }
          }
          
          // Check limits based on action type
          if (planData.plan_type === 'starter') {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // Check API call limits
            if (action === 'log_api_call') {
              // Count current API calls this month
              const { count, error: countError } = await adminClient
                .from('user_usage_stats')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userIdToUse)
                .eq('action_type', 'openai_api_call')
                .gte('created_at', firstDayOfMonth.toISOString());
              
              if (!countError) {
                const currentCount = count || 0;
                console.log(`Current API call count: ${currentCount}/${planData.max_api_calls}`);
                // If user is at or above their limit, they can't make more API calls
                if (currentCount >= planData.max_api_calls) {
                  canMakeApiCall = false;
                  limitMessage = `You've reached your monthly limit of ${planData.max_api_calls} AI API calls. Please upgrade to Pro for unlimited usage.`;
                }
              }
            }
            
            // Check brain creation limits
            if (action === 'check_brain_limit') {
              // Count current brains
              const { count, error: brainCountError } = await adminClient
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', userIdToUse)
                .eq('is_archived', false);
              
              if (!brainCountError) {
                const currentBrainCount = count || 0;
                console.log(`Current brain count: ${currentBrainCount}/${planData.max_brains}`);
                // If user is at or above their limit, they can't create more brains
                if (currentBrainCount >= planData.max_brains) {
                  canCreateBrain = false;
                  limitMessage = `You've reached your limit of ${planData.max_brains} brains. Please upgrade to Pro for unlimited brains.`;
                  
                  return new Response(
                    JSON.stringify({
                      status: "limit_exceeded",
                      message: limitMessage,
                      canProceed: false,
                      currentCount: currentBrainCount,
                      maxBrains: planData.max_brains
                    }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
                  );
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      // On error, we'll still allow the call but log the issue
    }

    // Log the OpenAI API call if requested and user is not at their limit
    if (action === 'log_api_call') {
      if (canMakeApiCall) {
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
      } else {
        // If user is at their limit, return error response
        return new Response(
          JSON.stringify({
            status: "limit_exceeded",
            message: limitMessage || "You've reached your plan limits. Please upgrade to continue.",
            apiCalls: planDetails?.max_api_calls || 0,
            canProceed: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Handle brain limit checking - respond with detailed status
    if (action === 'check_brain_limit') {
      // Get current brain count for response
      const { count: brainCount, error: countError } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userIdToUse)
        .eq('is_archived', false);
      
      const currentBrainCount = countError ? 0 : (brainCount || 0);
      const maxBrains = planDetails?.max_brains || 3; // Default to 3 if plan details not available
      
      if (!canCreateBrain) {
        return new Response(
          JSON.stringify({
            status: "limit_exceeded",
            message: limitMessage || "You've reached your brain limit. Please upgrade to create more brains.",
            canProceed: false,
            currentCount: currentBrainCount,
            maxBrains: maxBrains
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        return new Response(
          JSON.stringify({
            status: "success",
            canProceed: true,
            currentCount: currentBrainCount,
            maxBrains: maxBrains
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Get user usage statistics - using admin client
    // Only count rows where action_type is 'openai_api_call'
    const now = new Date();
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
    
    return new Response(
      JSON.stringify({ 
        apiCalls: apiCallCount,
        status: "success",
        planType: userSubscription?.plan_type || 'starter',
        maxApiCalls: planDetails?.max_api_calls || 0,
        canProceed: canMakeApiCall
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        apiCalls: 0,
        status: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
