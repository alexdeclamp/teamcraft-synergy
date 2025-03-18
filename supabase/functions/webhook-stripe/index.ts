
// Follow Supabase Edge Function Conventions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import Stripe from 'https://esm.sh/stripe@14.20.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Get the stripe signature from the request headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No stripe signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the request body as text
    const body = await req.text()

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Verify the webhook signature
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret!)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: { persistSession: false },
      }
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata.user_id
        const tierId = session.metadata.tier_id
        const subscriptionId = session.subscription

        if (userId && tierId && subscriptionId) {
          // Update the user's membership
          await supabaseAdmin
            .from('user_memberships')
            .upsert({
              user_id: userId,
              tier_id: tierId,
              stripe_subscription_id: subscriptionId,
              is_active: true,
            }, {
              onConflict: 'user_id',
            })
          
          // Update the user's profile with the membership tier ID
          await supabaseAdmin
            .from('profiles')
            .update({ membership_tier_id: tierId })
            .eq('id', userId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Get the subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.id,
          { expand: ['customer'] }
        )
        
        // Update the subscription status
        if (stripeSubscription.customer && typeof stripeSubscription.customer !== 'string') {
          const customerId = stripeSubscription.customer.id
          
          // Find the user with this customer ID
          const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, stripe_customer_id')
            .eq('stripe_customer_id', customerId)
          
          if (profiles && profiles.length > 0) {
            const userId = profiles[0].id
            
            // Update the subscription status
            await supabaseAdmin
              .from('user_memberships')
              .update({
                is_active: subscription.status === 'active',
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('stripe_subscription_id', subscription.id)
          }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Mark the subscription as inactive
        await supabaseAdmin
          .from('user_memberships')
          .update({ is_active: false })
          .eq('stripe_subscription_id', subscription.id)
        
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}
