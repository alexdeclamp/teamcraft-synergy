
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
    
    // 1. Check if subscription_tiers table exists
    const { error: tableExistsError } = await adminClient.from('subscription_tiers').select('id', { count: 'exact', head: true });
    
    // If table doesn't exist, create it
    if (tableExistsError && tableExistsError.code === 'PGRST109') {
      // PGRST109 = "relation subscription_tiers does not exist"
      console.log('Creating subscription_tiers table...');
      
      const createSubscriptionTiersQuery = `
        CREATE TABLE public.subscription_tiers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'pro')),
          price DECIMAL(10, 2) NOT NULL DEFAULT 0,
          max_api_calls INTEGER NOT NULL DEFAULT 100,
          max_brains INTEGER NOT NULL DEFAULT 3,
          max_documents INTEGER NOT NULL DEFAULT 50,
          features JSONB DEFAULT '[]'::jsonb,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow anonymous read access to subscription_tiers" 
        ON public.subscription_tiers 
        FOR SELECT 
        TO authenticated
        USING (true);
        
        CREATE POLICY "Allow service role full access to subscription_tiers" 
        ON public.subscription_tiers 
        USING (auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid);
      `;
      
      await adminClient.rpc('execute_sql', { query: createSubscriptionTiersQuery });
      
      // Insert default subscription tiers
      await adminClient.from('subscription_tiers').insert([
        {
          name: 'Starter',
          plan_type: 'starter',
          price: 0,
          max_api_calls: 50,
          max_brains: 3,
          max_documents: 20,
          features: ['Basic AI assistance', 'Document uploads', 'Image analysis'],
          is_default: true,
        },
        {
          name: 'Pro',
          plan_type: 'pro',
          price: 19.99,
          max_api_calls: 500,
          max_brains: 20,
          max_documents: 100,
          features: [
            'Advanced AI assistance', 
            'Unlimited document uploads', 
            'Image analysis', 
            'Priority support', 
            'Batch processing',
            'Custom domain'
          ],
          is_default: false,
        }
      ]);
    }
    
    // 2. Check if user_subscriptions table exists
    const { error: userSubTableExistsError } = await adminClient.from('user_subscriptions').select('id', { count: 'exact', head: true });
    
    // If table doesn't exist, create it
    if (userSubTableExistsError && userSubTableExistsError.code === 'PGRST109') {
      console.log('Creating user_subscriptions table...');
      
      const createUserSubscriptionsQuery = `
        CREATE TABLE public.user_subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'pro')),
          is_active BOOLEAN NOT NULL DEFAULT true,
          trial_ends_at TIMESTAMP WITH TIME ZONE,
          subscription_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id)
        );
        
        ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own subscriptions" 
        ON public.user_subscriptions 
        FOR SELECT 
        TO authenticated
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Service role can manage all subscriptions" 
        ON public.user_subscriptions 
        USING (auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid);
      `;
      
      await adminClient.rpc('execute_sql', { query: createUserSubscriptionsQuery });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Subscription tables created successfully"
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
