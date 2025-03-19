
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

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
    // Get the Stripe signature from the request headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('No Stripe signature found in the request');
    }

    // Get the raw request body
    const rawBody = await req.text();
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    // Construct the event from the raw body and signature using the webhook secret
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object;
        
        // Make sure it's a successful payment
        if (checkoutSession.payment_status === 'paid') {
          // Get the user ID from the client_reference_id or metadata
          const userId = checkoutSession.client_reference_id || 
                       checkoutSession.metadata?.userId;
          
          if (!userId) {
            throw new Error('No user ID found in the checkout session');
          }

          // Determine which plan was purchased - in this case we only have 'pro'
          const planType = 'pro';
          
          // Update the user's subscription in the database
          const { data, error } = await supabase.rpc('create_user_subscription', {
            p_user_id: userId,
            p_plan_type: planType
          });
          
          if (error) {
            console.error('Error updating user subscription:', error.message);
            throw new Error(`Failed to update user subscription: ${error.message}`);
          }
          
          console.log(`Successfully upgraded user ${userId} to ${planType} plan`);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Extract customer ID and metadata
        const customerId = subscription.customer;
        const status = subscription.status;
        
        console.log(`Subscription ${subscription.id} status updated to ${status} for customer ${customerId}`);
        
        // If subscription is active, ensure user's subscription is active in our database
        if (status === 'active') {
          // We need to look up the user based on the Stripe customer ID
          // This would require having the Stripe customer ID stored in our user's metadata
          // For now, log that we would need to implement this
          console.log(`Would update subscription status to active for customer ${customerId}`);
        } else if (status === 'canceled' || status === 'unpaid') {
          console.log(`Would downgrade subscription for customer ${customerId}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log(`Subscription ${subscription.id} deleted for customer ${customerId}`);
        
        // For now, just log that a subscription was cancelled
        // In a real implementation, we would look up the user by Stripe customer ID
        // and downgrade their account
        console.log(`Would downgrade subscription for customer ${customerId}`);
        break;
      }
      
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
