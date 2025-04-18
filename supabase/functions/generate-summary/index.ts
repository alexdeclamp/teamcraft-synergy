
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleRequest } from "./handlers.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request:', req.method, new URL(req.url).pathname);
    
    // Add a simple try/catch to capture and log unhandled errors
    try {
      const response = await handleRequest(req);
      console.log('Successfully processed request with status:', response.status);
      return response;
    } catch (handlerError) {
      console.error('Unhandled error in request handler:', handlerError);
      return new Response(JSON.stringify({ 
        error: handlerError?.message || 'Unhandled error in request handler' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unhandled error in generate-summary function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
