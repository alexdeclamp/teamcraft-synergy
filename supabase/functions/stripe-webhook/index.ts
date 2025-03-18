
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  // This is a placeholder function since the membership feature has been removed
  console.log("Stripe webhook received but membership features are disabled");
  
  return new Response(JSON.stringify({ 
    status: "success",
    message: "Membership features have been disabled" 
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
