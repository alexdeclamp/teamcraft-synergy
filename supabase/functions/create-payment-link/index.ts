
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";

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
    // Get the user ID from the request
    const requestData = await req.json();
    const userId = requestData.userId;
    
    console.log(`Creating payment link for user: ${userId}`);
    
    if (!userId) {
      console.error('User ID is missing in the request');
      throw new Error('User ID is required');
    }

    // Initialize Stripe with the secret key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set');
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    
    const stripe = new Stripe(stripeKey);
    const priceId = Deno.env.get('STRIPE_PRO_PRICE_ID');
    
    if (!priceId) {
      console.error('STRIPE_PRO_PRICE_ID is not set');
      throw new Error('STRIPE_PRO_PRICE_ID environment variable is not set');
    }

    console.log(`Using price ID: ${priceId}`);
    
    // Get origin for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    console.log(`Using origin for redirect URLs: ${origin}`);

    // Create a checkout session with the price information
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/dashboard?subscription=canceled`,
      client_reference_id: userId,
      metadata: {
        userId: userId
      }
    });

    if (!session.url) {
      console.error('Stripe did not return a checkout URL');
      throw new Error('Failed to create checkout session');
    }

    console.log(`Created payment link: ${session.url}`);

    return new Response(
      JSON.stringify({ paymentUrl: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error creating payment link:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
