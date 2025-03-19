
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
          
          // Store customer ID for future reference
          const customerId = checkoutSession.customer;
          const subscriptionId = checkoutSession.subscription;
          
          console.log(`Processing checkout completion for userId: ${userId}, customerId: ${customerId}, subscriptionId: ${subscriptionId}`);
          
          // First make sure we update any existing subscription to be active
          if (customerId && subscriptionId) {
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
            
            // If no subscription exists yet, create a new one
            if (updateError) {
              console.log(`No existing subscription found, creating new one for user ${userId}`);
              
              // Create a new subscription for the user
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
                console.error('Error creating new subscription:', insertError.message);
                throw new Error(`Failed to create new subscription: ${insertError.message}`);
              }
            }
          } else {
            // If for some reason we don't have customer/subscription IDs, use the RPC function as fallback
            console.log(`Using RPC fallback to update subscription for user ${userId}`);
            const { error } = await supabase.rpc('create_user_subscription', {
              p_user_id: userId,
              p_plan_type: planType
            });
            
            if (error) {
              console.error('Error updating user subscription with RPC:', error.message);
              throw new Error(`Failed to update user subscription: ${error.message}`);
            }
          }
          
          console.log(`Successfully upgraded user ${userId} to ${planType} plan with Stripe customer ${customerId}`);
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
        
        console.log(`Subscription ${subscription.id} deleted for customer ${customerId}`);
        
        // Handle the cancellation
        await handleCanceledSubscription(supabase, customerId);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const customerId = paymentIntent.customer;
        
        console.log(`Payment succeeded for customer ${customerId}`);
        
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
            console.log(`Payment succeeded for user ${userData.user_id}`);
          }
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const customerId = paymentIntent.customer;
        
        console.log(`Payment failed for customer ${customerId}`);
        
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
            console.log(`Payment failed for user ${userData.user_id}`);
            // For now, just log that the payment failed
            // In a real implementation, we might want to send a notification
          }
        }
        break;
      }
      
      default: {
        console.log(`Unhandled event type: ${event.type}`);
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
