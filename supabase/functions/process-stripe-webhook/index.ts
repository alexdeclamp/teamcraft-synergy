
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.4.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

// Initialize Stripe with the secret key
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature in header');
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the raw body
    const body = await req.text();
    let event;

    // Verify the webhook signature
    try {
      event = webhookSecret
        ? stripe.webhooks.constructEvent(body, signature, webhookSecret)
        : JSON.parse(body);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Event received: ${event.type}`);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      
      console.log(`Processing completed checkout for user: ${userId}`);
      
      if (!userId) {
        console.error('No user ID found in session');
        return new Response(JSON.stringify({ error: 'No user ID provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update user subscription to Pro in your database
      const { data, error } = await supabase.rpc('create_user_subscription', {
        p_user_id: userId,
        p_plan_type: 'pro'
      });

      if (error) {
        console.error('Error updating subscription:', error);
        return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Subscription updated for user:', userId);
      
      // Store the Stripe subscription ID for future management
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          subscription_id: session.subscription,
          is_active: true
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error storing subscription ID:', updateError);
      }
    }
    
    // Handle subscription cancellation or payment failure
    if (event.type === 'customer.subscription.deleted' || 
        event.type === 'invoice.payment_failed') {
      const subscription = event.data.object;
      
      // Find the user with this subscription ID
      const { data: userData, error: userError } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('subscription_id', subscription.id)
        .single();
      
      if (userError || !userData) {
        console.error('Error finding user with subscription:', userError);
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Downgrade user to starter plan
      const { error: downgradeError } = await supabase.rpc('create_user_subscription', {
        p_user_id: userData.user_id,
        p_plan_type: 'starter'
      });
      
      if (downgradeError) {
        console.error('Error downgrading subscription:', downgradeError);
      } else {
        console.log('User downgraded to starter plan:', userData.user_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
