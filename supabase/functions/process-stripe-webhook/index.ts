
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
    // Log request information for debugging
    console.log('Received webhook request:', req.method, req.url);
    console.log('Request headers:', JSON.stringify(Object.fromEntries([...req.headers]), null, 2));
    
    if (req.method !== 'POST') {
      console.error(`Method not allowed: ${req.method}`);
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
    console.log('Webhook body length:', body.length);
    let event;

    // Verify the webhook signature
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log('Webhook signature verified successfully');
      } else {
        console.warn('No webhook secret configured, skipping signature verification');
        event = JSON.parse(body);
      }
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
      console.log('Session details:', JSON.stringify(session, null, 2));
      
      if (!userId) {
        console.error('No user ID found in session');
        return new Response(JSON.stringify({ error: 'No user ID provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Directly update the subscription in the database
        const { data: existingSubscription, error: fetchError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
          console.error('Error fetching subscription:', fetchError);
          throw fetchError;
        }

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ 
              plan_type: 'pro',
              subscription_id: session.subscription,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Error updating subscription:', updateError);
            throw updateError;
          }
          
          console.log('Subscription updated for user:', userId);
        } else {
          // Create new subscription
          const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({ 
              user_id: userId,
              plan_type: 'pro',
              subscription_id: session.subscription,
              is_active: true
            });

          if (insertError) {
            console.error('Error creating subscription:', insertError);
            throw insertError;
          }
          
          console.log('New subscription created for user:', userId);
        }
      } catch (error) {
        console.error('Subscription update failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
      const { error: downgradeError } = await supabase
        .from('user_subscriptions')
        .update({ 
          plan_type: 'starter',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.user_id);
      
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
