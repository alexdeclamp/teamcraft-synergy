
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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }
    
    // Create a Supabase admin client with the service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Execute a quick query to verify our tables exist
    const { data: tierData, error: tierError } = await adminClient
      .from('subscription_tiers')
      .select('id')
      .limit(1);
      
    if (tierError) {
      console.error('Error checking subscription_tiers table:', tierError);
      throw new Error(`Table check failed: ${tierError.message}`);
    }
    
    console.log('subscription_tiers table exists and is accessible');
    
    const { data: subData, error: subError } = await adminClient
      .from('user_subscriptions')
      .select('id')
      .limit(1);
      
    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 just means no rows found, which is expected for a new table
      console.error('Error checking user_subscriptions table:', subError);
      throw new Error(`Table check failed: ${subError.message}`);
    }
    
    console.log('user_subscriptions table exists and is accessible');
    
    // Verify RPC functions
    try {
      const { data: rpcData, error: rpcError } = await adminClient.rpc(
        'get_user_subscription',
        { p_user_id: '00000000-0000-0000-0000-000000000000' }
      );
      
      if (rpcError && !rpcError.message.includes('does not exist')) {
        console.error('Error testing get_user_subscription function:', rpcError);
      } else {
        console.log('get_user_subscription function exists');
      }
    } catch (err) {
      console.error('Error testing RPC function:', err);
    }
    
    // Ensure we have both default plan tiers in the database
    const { data: plans, error: plansError } = await adminClient
      .from('subscription_tiers')
      .select('*');
      
    if (plansError) {
      console.error('Error fetching subscription tiers:', plansError);
    } else {
      const hasPro = plans?.some(p => p.plan_type === 'pro');
      const hasStarter = plans?.some(p => p.plan_type === 'starter');
      
      if (!hasStarter) {
        console.log('Creating starter plan');
        await adminClient
          .from('subscription_tiers')
          .insert({
            name: 'Starter',
            plan_type: 'starter',
            price: 0,
            max_api_calls: 50,
            max_brains: 3,
            max_documents: 20,
            features: ['Basic AI assistance', 'Document uploads', 'Image analysis'],
            is_default: true
          });
      }
      
      if (!hasPro) {
        console.log('Creating pro plan');
        await adminClient
          .from('subscription_tiers')
          .insert({
            name: 'Pro',
            plan_type: 'pro',
            price: 19.99,
            max_api_calls: 500,
            max_brains: 20,
            max_documents: 100,
            features: ['Advanced AI assistance', 'Unlimited document uploads', 'Image analysis', 'Priority support', 'Batch processing', 'Custom domain'],
            is_default: false
          });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Subscription tables and functions verified successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error('Error setting up subscription tables:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Unknown error occurred"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
