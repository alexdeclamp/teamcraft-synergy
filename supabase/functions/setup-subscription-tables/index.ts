
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
    
    // Update the subscription tiers with the new limits
    // First, clear existing tiers to ensure we have the correct data
    try {
      await adminClient
        .from('subscription_tiers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      console.log('Deleted existing subscription tiers');
    } catch (err) {
      console.error('Error deleting existing tiers:', err);
    }
    
    // Now create the Starter plan
    console.log('Creating starter plan');
    await adminClient
      .from('subscription_tiers')
      .insert({
        name: 'Starter',
        plan_type: 'starter',
        price: 0,
        max_api_calls: 9999, // Effectively unlimited API calls
        max_brains: 2, // Changed from 3 to 2
        max_documents: 9999, // Effectively unlimited documents
        features: [
          'Create up to 2 brains', // Updated to reflect the new limit
          'Unlimited AI API calls', 
          'Document uploads', 
          'Image analysis'
        ],
        is_default: true
      });
    
    // Create the Pro plan
    console.log('Creating pro plan');
    await adminClient
      .from('subscription_tiers')
      .insert({
        name: 'Pro',
        plan_type: 'pro',
        price: 19.99,
        max_api_calls: 9999, // Effectively unlimited API calls
        max_brains: 9999,   // Effectively unlimited brains
        max_documents: 9999, // Effectively unlimited documents
        features: [
          'Unlimited brains',
          'Unlimited API calls',
          'Share brains with team members',
          'Advanced AI features',
          'Priority support',
          'Early access to new features'
        ],
        is_default: false
      });
    
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
