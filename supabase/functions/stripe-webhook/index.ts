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
      console.error('[WEBHOOK] No Stripe signature found in the request');
      throw new Error('No Stripe signature found in the request');
    }

    // Get the raw request body
    const rawBody = await req.text();
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET environment variable is not set');
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    // Construct the event from the raw body and signature using the webhook secret
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`[WEBHOOK] Signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`[WEBHOOK] Received Stripe event: ${event.type}`);
    console.log(`[WEBHOOK] Event ID: ${event.id}`);
    console.log(`[WEBHOOK] Event data object: ${JSON.stringify(event.data.object).substring(0, 200)}...`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[WEBHOOK] Missing Supabase environment variables');
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
            console.error('[WEBHOOK] No user ID found in the checkout session');
            throw new Error('No user ID found in the checkout session');
          }

          // Determine which plan was purchased - in this case we only have 'pro'
          const planType = 'pro';
          
          // Store customer ID for future reference
          const customerId = checkoutSession.customer;
          const subscriptionId = checkoutSession.subscription;
          
          console.log(`[WEBHOOK] Processing checkout completion for userId: ${userId}, customerId: ${customerId}, subscriptionId: ${subscriptionId}`);
          
          // First check if we already have a subscription for this user
          const { data: existingSubscription, error: lookupError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
            
          console.log(`[WEBHOOK] Existing subscription lookup result: ${JSON.stringify(existingSubscription || 'none')}`);
          
          if (lookupError) {
            console.error(`[WEBHOOK] Error looking up existing subscription: ${lookupError.message}`);
          }
          
          // If the user already has a subscription, update it
          if (existingSubscription) {
            console.log(`[WEBHOOK] Updating existing subscription for user ${userId} to plan ${planType}`);
            
            const { error: updateError } = await supabase
              .from('user_subscriptions')
              .update({
                is_active: true,
                subscription_id: subscriptionId,
                customer_id: customerId,
                plan_type: planType,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
            
            if (updateError) {
              console.error(`[WEBHOOK] Error updating subscription: ${updateError.message}`);
              throw new Error(`Failed to update subscription: ${updateError.message}`);
            }
            
            console.log(`[WEBHOOK] Successfully updated subscription for user ${userId} to ${planType}`);
          } else {
            // Create a new subscription for the user
            console.log(`[WEBHOOK] Creating new subscription for user ${userId} with plan ${planType}`);
            
            const { error: insertError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                plan_type: planType,
                is_active: true,
                subscription_id: subscriptionId,
                customer_id: customerId
              });
            
            if (insertError) {
              console.error(`[WEBHOOK] Error creating new subscription: ${insertError.message}`);
              
              // Try RPC as fallback
              const { error: rpcError } = await supabase.rpc('create_user_subscription', {
                p_user_id: userId,
                p_plan_type: planType
              });
              
              if (rpcError) {
                console.error(`[WEBHOOK] RPC fallback also failed: ${rpcError.message}`);
                throw new Error(`Failed to create subscription: ${rpcError.message}`);
              }
            }
            
            console.log(`[WEBHOOK] Successfully created subscription for user ${userId} with plan ${planType}`);
          }
        } else {
          console.log(`[WEBHOOK] Checkout session payment status is not 'paid': ${checkoutSession.payment_status}`);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Extract customer ID and metadata
        const customerId = subscription.customer;
        const status = subscription.status;
        
        console.log(`[WEBHOOK] Subscription ${subscription.id} status updated to ${status} for customer ${customerId}`);
        
        // If subscription is active, ensure user's subscription is active in our database
        if (status === 'active') {
          // Look up the user based on the Stripe customer ID
          const { data: userData, error: userError } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('customer_id', customerId)
            .maybeSingle();
          
          if (userError) {
            console.error('Error looking up user by customer ID:', userError.message);
            throw new Error(`Failed to look up user by customer ID: ${userError.message}`);
          }
          
          if (userData) {
            // Update the subscription status to active
            const { error: updateError } = await supabase
              .from('user_subscriptions')
              .update({ 
                is_active: true,
                plan_type: 'pro', // Explicitly set to pro
                updated_at: new Date().toISOString()
              })
              .eq('customer_id', customerId);
            
            if (updateError) {
              console.error('Error updating subscription status:', updateError.message);
              throw new Error(`Failed to update subscription status: ${updateError.message}`);
            }
            
            console.log(`Updated subscription status to active for user ${userData.user_id}`);
          } else {
            console.log(`No user found for customer ${customerId}`);
          }
        } else if (status === 'canceled' || status === 'unpaid') {
          await handleCanceledSubscription(supabase, customerId);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        console.log(`[WEBHOOK] Subscription ${subscription.id} deleted for customer ${customerId}`);
        
        // Handle the cancellation
        await handleCanceledSubscription(supabase, customerId);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const customerId = paymentIntent.customer;
        
        console.log(`[WEBHOOK] Payment succeeded for customer ${customerId}`);
        
        // If this is related to a subscription, we might want to update payment status
        // For now, just log the successful payment
        if (customerId) {
          const { data: userData, error: userError } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('customer_id', customerId)
            .maybeSingle();
          
          if (userError) {
            console.error('Error looking up user by customer ID:', userError.message);
          } else if (userData) {
            console.log(`[WEBHOOK] Payment succeeded for user ${userData.user_id}`);
          }
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const customerId = paymentIntent.customer;
        
        console.log(`[WEBHOOK] Payment failed for customer ${customerId}`);
        
        // If payment fails, we might want to notify the user or update their status
        if (customerId) {
          const { data: userData, error: userError } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('customer_id', customerId)
            .maybeSingle();
          
          if (userError) {
            console.error('Error looking up user by customer ID:', userError.message);
          } else if (userData) {
            console.log(`[WEBHOOK] Payment failed for user ${userData.user_id}`);
            // For now, just log that the payment failed
            // In a real implementation, we might want to send a notification
          }
        }
        break;
      }
      
      default: {
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
      }
    }

    // Helper function to handle canceled or deleted subscriptions
    async function handleCanceledSubscription(supabase, customerId) {
      // Look up the user based on the Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (userError) {
        console.error('Error looking up user by customer ID:', userError.message);
        throw new Error(`Failed to look up user by customer ID: ${userError.message}`);
      }
      
      if (userData) {
        // Downgrade the user to the free plan
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: 'starter',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.user_id);
        
        if (updateError) {
          console.error('Error downgrading subscription:', updateError.message);
          
          // Try RPC as fallback
          const { error: rpcError } = await supabase.rpc('create_user_subscription', {
            p_user_id: userData.user_id,
            p_plan_type: 'starter'
          });
          
          if (rpcError) {
            console.error('RPC fallback also failed:', rpcError.message);
            throw new Error(`Failed to downgrade subscription: ${rpcError.message}`);
          }
        }
        
        console.log(`Downgraded subscription for user ${userData.user_id} to starter plan`);
      } else {
        console.log(`No user found for customer ${customerId}`);
      }
    }

    console.log(`[WEBHOOK] Successfully processed webhook event: ${event.type}`);
    
    return new Response(
      JSON.stringify({ 
        received: true,
        processed: true,
        event_type: event.type,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error(`[WEBHOOK] Error processing webhook: ${error.message}`);
    console.error(error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
