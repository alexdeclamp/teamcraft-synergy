
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.25.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define a type for subscription without importing from the read-only file
type UserSubscription = {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  is_active: boolean;
  trial_ends_at: string | null;
  current_period_starts_at: string;
  current_period_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Setup Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authenticated user
    let userId;
    try {
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
        return new Response(
          JSON.stringify({ 
            status: "error",
            message: "Authentication failed"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      
      userId = user.id;
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return new Response(
        JSON.stringify({ 
          status: "error",
          message: "Failed to authenticate user"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Parse the request
    const { action } = await req.json();
    
    // Function to get the current subscription
    const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
      const { data, error } = await adminClient
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is not found
        throw new Error(`Error fetching subscription: ${error.message}`);
      }
      
      return data as UserSubscription | null;
    };
    
    // Handle different actions
    switch (action) {
      case 'get_subscription': {
        const subscription = await getCurrentSubscription();
        
        return new Response(
          JSON.stringify({ 
            subscription: subscription,
            status: "success"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'upgrade_to_pro': {
        // Check if a subscription already exists
        const existingSubscription = await getCurrentSubscription();
        
        if (existingSubscription) {
          if (existingSubscription.plan_type === 'pro') {
            return new Response(
              JSON.stringify({ 
                message: "You are already on the Pro plan",
                subscription: existingSubscription,
                status: "success"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Update existing subscription to Pro
          const { data: updatedSub, error: updateError } = await adminClient
            .from('user_subscriptions')
            .update({
              plan_type: 'pro',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSubscription.id)
            .select()
            .single();
            
          if (updateError) {
            throw new Error(`Error updating subscription: ${updateError.message}`);
          }
          
          return new Response(
            JSON.stringify({ 
              message: "Successfully upgraded to Pro plan",
              subscription: updatedSub,
              status: "success"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Create new Pro subscription
        const { data: newSub, error: insertError } = await adminClient
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan_type: 'pro',
            is_active: true,
            current_period_starts_at: new Date().toISOString(),
            current_period_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          })
          .select()
          .single();
          
        if (insertError) {
          throw new Error(`Error creating subscription: ${insertError.message}`);
        }
        
        return new Response(
          JSON.stringify({ 
            message: "Successfully subscribed to Pro plan",
            subscription: newSub,
            status: "success"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'downgrade_to_free': {
        const existingSubscription = await getCurrentSubscription();
        
        if (!existingSubscription || existingSubscription.plan_type === 'free') {
          return new Response(
            JSON.stringify({ 
              message: "You are already on the Free plan",
              status: "success"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Update to Free plan
        const { data: updatedSub, error: updateError } = await adminClient
          .from('user_subscriptions')
          .update({
            plan_type: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();
          
        if (updateError) {
          throw new Error(`Error updating subscription: ${updateError.message}`);
        }
        
        return new Response(
          JSON.stringify({ 
            message: "Successfully downgraded to Free plan",
            subscription: updatedSub,
            status: "success"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ 
            status: "error",
            message: "Invalid action"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in manage-subscription function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        status: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
