
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
    
    // Check if the user_subscriptions table exists
    const { data: tableExists, error: tableCheckError } = await adminClient.rpc(
      'check_table_exists',
      { table_name: 'user_subscriptions' }
    );
    
    if (tableCheckError) {
      // If the RPC function doesn't exist, we'll create it first
      const createRpcFunctionSQL = `
        CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
        RETURNS boolean AS $$
        DECLARE
          exists_check boolean;
        BEGIN
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = check_table_exists.table_name
          ) INTO exists_check;
          
          RETURN exists_check;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      await adminClient.rpc('check_table_exists', { table_name: 'user_subscriptions' }).catch(async () => {
        // Create the function if it doesn't exist
        const { error: createFunctionError } = await adminClient.sql(createRpcFunctionSQL);
        if (createFunctionError) {
          throw new Error(`Failed to create check_table_exists function: ${createFunctionError.message}`);
        }
      });
      
      // Try again after creating the function
      const { data: retryTableExists, error: retryError } = await adminClient.rpc(
        'check_table_exists',
        { table_name: 'user_subscriptions' }
      );
      
      if (retryError) {
        throw new Error(`Failed to check if table exists: ${retryError.message}`);
      }
      
      if (!retryTableExists) {
        // Table doesn't exist, create it
        await createSubscriptionsTable(adminClient);
      }
    } else if (!tableExists) {
      // Table doesn't exist, create it
      await createSubscriptionsTable(adminClient);
    }
    
    // Verify the table exists after attempted creation
    const { data: finalCheck, error: finalCheckError } = await adminClient.from('user_subscriptions').select('*', { count: 'exact', head: true });
    
    if (finalCheckError) {
      throw new Error(`Table verification failed: ${finalCheckError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Subscriptions table exists and is ready to use",
        tableExists: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in check-db-schema function:', error);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error.message || 'Unknown error occurred',
        tableExists: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to create the subscriptions table
async function createSubscriptionsTable(adminClient: any) {
  const createTableSQL = `
    -- Create subscriptions table to track user subscription plans
    CREATE TABLE IF NOT EXISTS public.user_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      trial_ends_at TIMESTAMPTZ,
      current_period_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      current_period_ends_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add RLS policies for the subscriptions table
    ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow users to read only their own subscriptions
    CREATE POLICY "Users can view their own subscriptions"
      ON public.user_subscriptions
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Create function to update updated_at column
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create trigger to update updated_at on subscriptions table
    CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

    -- Create index for faster queries
    CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
  `;
  
  const { error: createTableError } = await adminClient.sql(createTableSQL);
  
  if (createTableError) {
    throw new Error(`Failed to create subscriptions table: ${createTableError.message}`);
  }
  
  console.log('Subscriptions table created successfully');
}
