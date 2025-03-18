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
const PRODUCT_TO_TIER_MAP = {
  // Production products
  "prod_Rxy6Y9WaxBQYC7": "pro", // Pro tier
  "prod_Rxy7KmZSQH2riU": "team", // Team tier
  
  // Test products - Updated with the correct test product ID
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
      
      // Retrieve the user's email from the session
      const customerEmail = session.customer_details?.email;

      if (!customerEmail) {
        console.error("No customer email found in session");
        return new Response("No customer email", { status: 400 });
      }

      // Log information about the subscription for debugging
      console.log("Processing subscription for:", customerEmail);
      console.log("Product ID:", productId);
      console.log("Tier mapping:", PRODUCT_TO_TIER_MAP[productId]);

      // Find the user by email
      let userId;
      
      // Try multiple approaches to find the user
      // First, try direct lookup in auth.users
      const { data: authData, error: authError } = await supabase
        .from('auth')
        .select('users.id')
        .eq('users.email', customerEmail)
        .single();
      
      if (authError || !authData) {
        console.log("Auth lookup failed, trying profiles table...");
        
        // Try direct lookup in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .ilike('email', customerEmail)
          .single();
        
        if (profileError || !profileData) {
          console.log("Profile lookup failed, trying case-insensitive search...");
          
          // Try case-insensitive search
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email');
          
          if (profilesError) {
            console.error("Failed to query profiles table:", profilesError);
            return new Response("Error finding user", { status: 500 });
          }
          
          // Manual case-insensitive search
          const matchingProfile = profiles.find(p => 
            p.email && p.email.toLowerCase() === customerEmail.toLowerCase()
          );
          
          if (matchingProfile) {
            userId = matchingProfile.id;
            console.log("Found user via case-insensitive search:", userId);
          } else {
            console.error("No user found with email:", customerEmail);
            return new Response("User not found", { status: 404 });
          }
        } else {
          userId = profileData.id;
          console.log("Found user in profiles:", userId);
        }
      } else {
        userId = authData.users?.id;
        console.log("Found user in auth.users:", userId);
      }
      
      if (!userId) {
        console.error("Failed to find user ID for email:", customerEmail);
        return new Response("User ID not found", { status: 404 });
      }

      // Map product ID to tier name
      let tierName = PRODUCT_TO_TIER_MAP[productId];
      
      if (!tierName) {
        console.error(`No tier mapping found for product ID: ${productId}`);
        // Default to "pro" if no mapping found (common fallback for test mode)
        tierName = "pro";
        console.log("Defaulting to pro tier as fallback");
      }
      
      console.log("Mapping product to tier name:", productId, "->", tierName);

      // Find the tier ID by name from the database
      const { data: tierData, error: tierError } = await supabase
        .from('membership_tiers')
        .select('id')
        .ilike('name', `%${tierName}%`)
        .single();
      
      let tierId;
      
      if (tierError || !tierData) {
        console.log("Tier not found by name, looking up any paid tier as fallback");
        
        // Last resort: get any paid tier
        const { data: fallbackTier, error: fallbackError } = await supabase
          .from('membership_tiers')
          .select('id')
          .not('monthly_price', 'eq', 0)  // Not the free tier
          .order('monthly_price', { ascending: true })
          .limit(1);
          
        if (fallbackError || !fallbackTier || fallbackTier.length === 0) {
          console.error("Failed to find any paid tier:", fallbackError);
          return new Response("No paid tier found", { status: 404 });
        }
        
        tierId = fallbackTier[0].id;
        console.log("Using fallback paid tier:", tierId);
      } else {
        tierId = tierData.id;
        console.log("Found tier by name:", tierId);
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
        tier_id: tierId,
        tier_name: tierName
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
