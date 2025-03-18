
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
    
    // Create stored procedures for subscription operations
    const createStoredProcedures = `
      -- Function to get a user's subscription
      CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id UUID)
      RETURNS TABLE (
        id UUID,
        user_id UUID,
        plan_type TEXT,
        is_active BOOLEAN,
        trial_ends_at TIMESTAMPTZ,
        subscription_id TEXT,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          us.id,
          us.user_id,
          us.plan_type,
          us.is_active,
          us.trial_ends_at,
          us.subscription_id,
          us.created_at,
          us.updated_at
        FROM public.user_subscriptions us
        WHERE us.user_id = $1;
      END;
      $$;

      -- Function to create a user subscription
      CREATE OR REPLACE FUNCTION public.create_user_subscription(
        p_user_id UUID,
        p_plan_type TEXT
      ) RETURNS UUID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        new_id UUID;
      BEGIN
        INSERT INTO public.user_subscriptions (
          user_id,
          plan_type,
          is_active
        ) VALUES (
          p_user_id,
          p_plan_type,
          true
        )
        RETURNING id INTO new_id;
        
        RETURN new_id;
      END;
      $$;
    `;
    
    // Execute the SQL to create stored procedures
    await adminClient.rpc('execute_sql', { query: createStoredProcedures });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Subscription tables and functions created successfully"
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
