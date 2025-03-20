import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.4.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

// Initialize environment variables
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Log configuration status
console.log('==== WEBHOOK FUNCTION STARTUP ====');
console.log('- Supabase URL configured:', !!supabaseUrl);
console.log('- Supabase service key configured:', !!supabaseServiceKey);
console.log('- Stripe secret key configured:', !!stripeSecretKey);
console.log('- Webhook secret configured:', !!webhookSecret);

// Initialize Stripe client
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
let supabase;
try {
  console.log('Initializing Supabase client');
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// New function to manually check and update subscription status
async function checkAndUpdateSubscription(userId, subscriptionId) {
  if (!userId || !subscriptionId) {
    console.error('Missing user ID or subscription ID');
    return { success: false, error: 'Missing user ID or subscription ID' };
  }

  try {
    console.log(`Checking subscription status for user ${userId}, subscription ${subscriptionId}`);
    
    // Fetch subscription data from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(`Subscription status: ${subscription.status}`);
    
    // Determine if subscription is active
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    // Update subscription in database
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ 
        is_active: isActive, 
        plan_type: isActive ? 'pro' : 'starter',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Successfully updated subscription for user ${userId}`);
    return { success: true, isActive };
  } catch (err) {
    console.error('Error checking subscription:', err);
    return { success: false, error: err.message };
  }
}

// Function to create a default subscription when user upgrades
async function createOrUpdateSubscription(userId, subscriptionId) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return { success: false, error: 'Supabase client not initialized' };
  }
  
  try {
    console.log(`Creating/updating subscription for user ${userId} with subscription ID ${subscriptionId}`);
    
    // Check if user already has a subscription
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching subscription:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (existingSubscription) {
      // Update existing subscription
      console.log(`Updating existing subscription for user ${userId}`);
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          plan_type: 'pro',
          subscription_id: subscriptionId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Create new subscription
      console.log(`Creating new subscription for user ${userId}`);
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({ 
          user_id: userId,
          plan_type: 'pro',
          subscription_id: subscriptionId,
          is_active: true
        });
        
      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return { success: false, error: insertError.message };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    return { success: false, error: error.message };
  }
}

// New function to get subscription ID from session ID
async function getSubscriptionIdFromSession(sessionId) {
  if (!sessionId) {
    console.error('Missing session ID');
    return { subscriptionId: null, error: 'Missing session ID' };
  }
  
  try {
    console.log(`Fetching subscription info from checkout session ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || !session.subscription) {
      console.error('No subscription found in session:', sessionId);
      return { subscriptionId: null, error: 'No subscription found in session' };
    }
    
    const subscriptionId = session.subscription.toString();
    console.log(`Got subscription ID ${subscriptionId} from session`);
    return { subscriptionId, error: null };
  } catch (err) {
    console.error('Error fetching session:', err);
    return { subscriptionId: null, error: err.message };
  }
}

serve(async (req: Request) => {
  // Service health check endpoint
  if (req.url.endsWith('/health')) {
    console.log('Health check endpoint called');
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      config: {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseServiceKey,
        stripeKey: !!stripeSecretKey,
        webhookSecret: !!webhookSecret
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  // New endpoint to register a subscription after checkout completion
  if (req.method === 'POST') {
    console.log(`Request URL: ${req.url}`);
    
    // Process the main request - we'll handle both the webhook endpoint and the manual subscription registration
    try {
      const contentType = req.headers.get('content-type') || '';
      
      // If this is a JSON request, it's likely our manual registration endpoint
      if (contentType.includes('application/json')) {
        const requestData = await req.json();
        console.log('Request data:', JSON.stringify(requestData));
        
        const { userId, sessionId } = requestData;
        
        if (!userId) {
          console.error('Missing required parameter: userId');
          return new Response(JSON.stringify({ error: 'Missing required parameter: userId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!sessionId) {
          console.error('Missing required parameter: sessionId');
          return new Response(JSON.stringify({ error: 'Missing required parameter: sessionId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Get subscription ID from session
        const { subscriptionId, error: sessionError } = await getSubscriptionIdFromSession(sessionId);
        
        if (!subscriptionId) {
          console.error('Failed to get subscription from session:', sessionError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to get subscription from session: ' + sessionError 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Create or update the subscription
        const result = await createOrUpdateSubscription(userId, subscriptionId);
        
        if (result.success) {
          console.log('Subscription registered successfully for user:', userId);
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Subscription registered successfully' 
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.error('Failed to register subscription:', result.error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to register subscription: ' + result.error 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      // Otherwise, assume it's a webhook from Stripe
      console.log('Processing as webhook from Stripe');
      // Basic request logging
      console.log(`==== NEW WEBHOOK REQUEST ====`);
      console.log(`Request method: ${req.method}`);
      console.log(`Request URL: ${req.url}`);
      
      // Extract and log headers (safely)
      const headersObj = Object.fromEntries([...req.headers]);
      console.log('Request headers:', JSON.stringify({
        'content-type': headersObj['content-type'],
        'stripe-signature': headersObj['stripe-signature'] ? 'Present' : 'Missing',
        'content-length': headersObj['content-length'],
        'user-agent': headersObj['user-agent'],
      }));
      
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
        console.error('Missing Stripe signature in header');
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the raw body
      const body = await req.text();
      console.log('Webhook body received, length:', body.length);
      
      // Validate request body
      if (!body || body.length === 0) {
        console.error('Empty request body received');
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let event;

      // Verify the webhook signature
      try {
        if (webhookSecret) {
          console.log('Attempting to verify webhook signature...');
          event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
          console.log('Webhook signature verified successfully');
        } else {
          console.warn('No webhook secret configured, skipping signature verification');
          try {
            event = JSON.parse(body);
            console.log('Request body parsed successfully without verification');
          } catch (parseError) {
            console.error('Failed to parse request body:', parseError);
            return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(JSON.stringify({ error: `Webhook verification error: ${err.message}` }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Event received: ${event.type}`);
      console.log('Event ID:', event.id);

      // Handle different event types
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        console.log(`Processing completed checkout for user: ${userId}`);
        console.log('Session details:', JSON.stringify({
          id: session.id,
          subscription: session.subscription,
          client_reference_id: session.client_reference_id,
          metadata: session.metadata,
          customer: session.customer,
          status: session.status
        }));
        
        if (!userId) {
          console.error('No user ID found in session');
          return new Response(JSON.stringify({ error: 'No user ID provided in session' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          // Validate Supabase client
          if (!supabase) {
            throw new Error('Supabase client not initialized');
          }

          // Test Supabase connection first to verify credentials
          console.log('Testing Supabase connection...');
          const { data: testData, error: testError } = await supabase.from('user_subscriptions').select('count(*)', { count: 'exact', head: true });
          
          if (testError) {
            console.error('Supabase connection test failed:', testError);
            throw new Error(`Supabase authentication failed: ${testError.message}`);
          }
          console.log('Supabase connection successful');
          
          // Directly update the subscription in the database
          console.log(`Checking for existing subscription for user ${userId}...`);
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
            console.log(`Updating existing subscription for user ${userId}`);
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
            
            console.log('Subscription updated successfully for user:', userId);
          } else {
            // Create new subscription
            console.log(`Creating new subscription for user ${userId}`);
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
            
            console.log('New subscription created successfully for user:', userId);
          }
        } catch (error) {
          console.error('Subscription update failed:', error);
          return new Response(JSON.stringify({ error: 'Failed to update subscription', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      // Handle subscription cancellation or payment failure events
      if (event.type === 'customer.subscription.deleted' || 
          event.type === 'invoice.payment_failed') {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const subscriptionId = subscription.id;

        console.log(`Processing subscription event ${event.type} for user: ${userId}, subscription: ${subscriptionId}`);

        if (!userId) {
          console.warn('No user ID found in subscription metadata');
          return new Response(JSON.stringify({ error: 'No user ID provided in subscription metadata' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          // Validate Supabase client
          if (!supabase) {
            throw new Error('Supabase client not initialized');
          }

          // Update the subscription status in the database
          console.log(`Updating subscription status to inactive for user ${userId}`);
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              is_active: false,
              plan_type: 'starter',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('subscription_id', subscriptionId);

          if (updateError) {
            console.error('Error updating subscription status:', updateError);
            throw updateError;
          }

          console.log('Subscription status updated successfully for user:', userId);
        } catch (error) {
          console.error('Subscription status update failed:', error);
          return new Response(JSON.stringify({ error: 'Failed to update subscription status', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      console.log('Webhook processed successfully');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Unexpected error processing request:', error);
      return new Response(JSON.stringify({ 
        error: 'Unexpected error occurred', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
