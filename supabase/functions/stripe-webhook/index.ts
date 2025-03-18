import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get the webhook secret from environment variables, fallback to the provided test webhook secret
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "whsec_2Au2bLfMry4948i1wH6UhFN97ADIW1d0";

// Map Stripe product IDs to membership tier IDs in your database
const PRODUCT_TO_TIER_MAP: Record<string, string> = {
  // Production products
  "prod_Rxy6Y9WaxBQYC7": "pro", // Pro tier
  "prod_Rxy7KmZSQH2riU": "team", // Team tier
  
  // Test products
  "prod_RxylNpQGg7B0W2": "pro", // Test Pro tier
};

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      console.error("No Stripe signature found");
      return new Response("No signature", { status: 400 });
    }

    // Get the raw body as text
    const body = await req.text();
    
    // Log the received webhook data (careful with sensitive data in production)
    console.log("Received webhook payload:", body.substring(0, 500) + "...");
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Make sure it's a payment for a subscription
      if (session.mode !== 'subscription') {
        return new Response("Not a subscription", { status: 200 });
      }

      // Extract the customer and subscription information
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      console.log("Customer ID:", customerId);
      console.log("Subscription ID:", subscriptionId);

      // Retrieve the subscription details to get the product information
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      const productId = subscription.items.data[0].price.product;

      console.log("Price ID:", priceId);
      console.log("Product ID:", productId);
      
      // Get the user ID from customer metadata or find the user by Stripe customer ID
      // Retrieve the user's email from the session
      const customerEmail = session.customer_details.email;

      if (!customerEmail) {
        console.error("No customer email found in session");
        return new Response("No customer email", { status: 400 });
      }

      // Log information about the subscription for debugging
      console.log("Processing subscription for:", customerEmail);
      console.log("Product ID:", productId);
      console.log("Tier mapping:", PRODUCT_TO_TIER_MAP[productId as string]);

      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { lookup_email: customerEmail });

      if (userError) {
        console.error("Error finding user by email:", userError);
        return new Response(`Error finding user: ${userError.message}`, { status: 500 });
      }

      let userId;
      if (!userData || userData.length === 0) {
        console.error("No user found with email:", customerEmail);
        
        // Try alternative lookup by email directly in auth.users
        const { data: authData, error: authError } = await supabase
          .from('auth')
          .select('users.id')
          .eq('users.email', customerEmail)
          .single();
          
        if (authError) {
          console.error("Failed to find user in auth.users:", authError);
          
          // Try another approach - look directly in profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', customerEmail)
            .single();
            
          if (profileError || !profileData) {
            console.error("Failed to find user in profiles:", profileError);
            return new Response("User not found", { status: 404 });
          }
          
          userId = profileData.id;
          console.log("Found user in profiles:", userId);
        } else {
          userId = authData.users.id;
          console.log("Found user in auth.users:", userId);
        }
      } else {
        userId = userData[0].id;
        console.log("Found user via RPC:", userId);
      }

      // Find the membership tier ID that corresponds to the product
      const tierId = PRODUCT_TO_TIER_MAP[productId as string];
      
      if (!tierId) {
        console.error(`No tier mapping found for product ID: ${productId}`);
        return new Response("Product not mapped to tier", { status: 400 });
      }
      
      console.log("Mapping product to tier:", productId, "->", tierId);

      // Find the actual tier ID from the database
      const { data: tierData, error: tierError } = await supabase
        .from('membership_tiers')
        .select('id')
        .eq('id', tierId)
        .single();
        
      if (tierError) {
        // If we can't find it by ID, try looking up by name
        const { data: tierByNameData, error: tierByNameError } = await supabase
          .from('membership_tiers')
          .select('id')
          .ilike('name', '%pro%')
          .single();
          
        if (tierByNameError || !tierByNameData) {
          console.error("Error finding tier:", tierError);
          console.error("Also failed by name:", tierByNameError);
          return new Response("Tier not found", { status: 404 });
        }
        
        console.log("Found tier by name:", tierByNameData.id);
        tierId = tierByNameData.id;
      } else {
        console.log("Found tier by ID:", tierData.id);
      }

      // Update user's profile with the membership tier ID
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ membership_tier_id: tierId })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        return new Response("Error updating profile", { status: 500 });
      }
      
      console.log(`Successfully updated profile for user ${userId} to tier ${tierId}`);

      // Create or update a user membership record
      const { error: membershipError } = await supabase
        .from('user_memberships')
        .upsert({
          user_id: userId,
          tier_id: tierId,
          is_active: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });

      if (membershipError) {
        console.error("Error updating user membership:", membershipError);
        return new Response("Error updating user membership", { status: 500 });
      }

      console.log(`Successfully updated membership for user ${userId} to tier ${tierId}`);
      console.log("Webhook processing completed successfully");
      
      return new Response(JSON.stringify({ 
        status: "success", 
        user_id: userId,
        tier_id: tierId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } 
    else if (event.type === 'customer.subscription.updated') {
      // Handle subscription updates
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      // Find the user membership by subscription ID
      const { data: membershipData, error: membershipError } = await supabase
        .from('user_memberships')
        .select('user_id, tier_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (membershipError || !membershipData) {
        console.error("Error finding user membership:", membershipError || "No membership found");
        return new Response("Membership not found", { status: 404 });
      }

      // Update the subscription period dates
      const { error: updateError } = await supabase
        .from('user_memberships')
        .update({
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          is_active: subscription.status === 'active',
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (updateError) {
        console.error("Error updating user membership:", updateError);
        return new Response("Error updating user membership", { status: 500 });
      }

      console.log(`Successfully updated subscription for user ${membershipData.user_id}`);
    } 
    else if (event.type === 'customer.subscription.deleted') {
      // Handle subscription cancellation
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      // Find the user membership by subscription ID
      const { data: membershipData, error: membershipError } = await supabase
        .from('user_memberships')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (membershipError || !membershipData) {
        console.error("Error finding user membership:", membershipError || "No membership found");
        return new Response("Membership not found", { status: 404 });
      }

      // Get the free tier ID
      const { data: freeTierData, error: freeTierError } = await supabase
        .from('membership_tiers')
        .select('id')
        .eq('monthly_price', 0)
        .single();

      if (freeTierError || !freeTierData) {
        console.error("Error finding free tier:", freeTierError || "No free tier found");
        return new Response("Free tier not found", { status: 404 });
      }

      const freeTierId = freeTierData.id;

      // Update the user's profile to the free tier
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ membership_tier_id: freeTierId })
        .eq('id', membershipData.user_id);

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        return new Response("Error updating profile", { status: 500 });
      }

      // Update the user membership to inactive
      const { error: updateError } = await supabase
        .from('user_memberships')
        .update({
          is_active: false,
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (updateError) {
        console.error("Error updating user membership:", updateError);
        return new Response("Error updating user membership", { status: 500 });
      }

      console.log(`Successfully handled subscription cancellation for user ${membershipData.user_id}`);
    }

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
