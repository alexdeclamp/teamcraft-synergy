
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.4.0';

// Initialize Stripe with the secret key
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId, priceId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating checkout session for user:', userId);

    // Create checkout session config
    const sessionConfig: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard?subscription=canceled`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
    };

    // If a specific priceId is provided, use it directly
    if (priceId) {
      console.log('Using provided price ID:', priceId);
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else {
      // Use default product configuration
      console.log('Using default product configuration');
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro Plan Subscription',
              description: 'Monthly subscription to the Pro plan',
            },
            unit_amount: 1999, // $19.99
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', session.id);

    // Return the checkout session URL
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
