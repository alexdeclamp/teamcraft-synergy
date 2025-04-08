
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create error response with appropriate status code and CORS headers
export function createErrorResponse(message: string, status = 400) {
  console.error("Error in notion-import-page function:", message);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message || "Unknown error occurred",
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  );
}

// Create success response with CORS headers
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
