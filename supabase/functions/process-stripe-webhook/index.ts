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

  // Test webhook endpoint - NO signature verification (for troubleshooting only)
  if (req.url.endsWith('/test-webhook')) {
    console.log('Test webhook endpoint called - NO SIGNATURE VERIFICATION');
    
    try {
      const body = await req.text();
      console.log('Test webhook body received, length:', body.length);
      
      let eventData;
      try {
        eventData = JSON.parse(body);
      } catch (parseError) {
        console.error('Failed to parse test webhook body:', parseError);
        return new Response(JSON.stringify({ error: 'Invalid JSON in test webhook body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Test webhook event type:', eventData.type);
      
      // Try a test query to Supabase to verify connection
      if (supabase) {
        try {
          console.log('Testing Supabase connection from test webhook...');
          const { data, error } = await supabase.from('user_subscriptions').select('count(*)', { count: 'exact', head: true });
          
          if (error) {
            console.error('Supabase test query failed:', error);
            return new Response(JSON.stringify({ 
              error: 'Supabase connection test failed',
              details: error.message,
              code: error.code
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          console.log('Supabase test query succeeded');
        } catch (dbError) {
          console.error('Unexpected error testing Supabase:', dbError);
          return new Response(JSON.stringify({ 
            error: 'Unexpected error testing Supabase',
            details: dbError.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        received: true,
        message: 'Test webhook processed without signature verification',
        eventType: eventData.type || 'unknown'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error in test webhook endpoint:', error);
      return new Response(JSON.stringify({ 
        error: 'Test webhook processing error',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      // ... keep existing code (subscription cancellation and payment failure handling)
    }

    console.log('Webhook processed successfully');
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error occurred', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
