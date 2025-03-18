
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.25.0";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create a Supabase admin client with the service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      body = { userId: null };
    }
    
    // Get userId from request body or auth header
    let userId = body?.userId;
    if (!userId) {
      try {
        // Create a client using the request's authorization to extract the user
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
        const clientWithAuth = createClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: { Authorization: req.headers.get('Authorization')! },
            },
          }
        );
        
        const { data: { user }, error: authError } = await clientWithAuth.auth.getUser();
        
        if (authError || !user) {
          console.error('Authentication error:', authError);
          return new Response(
            JSON.stringify({ 
              status: "error",
              message: "Authentication failed"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
          );
        }
        
        userId = user.id;
      } catch (error) {
        console.error('Error extracting user from token:', error);
        return new Response(
          JSON.stringify({ 
            status: "error",
            message: "Failed to authenticate user"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          message: "User ID is required"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 1. Get API call count for the current month
    let apiCallCount = 0;
    try {
      const { count, error: apiError } = await adminClient
        .from('user_usage_stats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', 'openai_api_call')
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (!apiError) {
        apiCallCount = count || 0;
      } else {
        console.error('Error fetching API calls:', apiError);
      }
    } catch (error) {
      console.error('Error in API call count query:', error);
    }
    
    // 2. Get projects count (brains)
    let projectsCount = 0;
    try {
      // Count projects where user is owner or member
      const { data: ownedProjects, error: ownedError } = await adminClient
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .eq('is_archived', false);
        
      const { data: memberProjects, error: memberError } = await adminClient
        .from('project_members')
        .select('project_id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!ownedError && !memberError) {
        const ownedCount = ownedProjects?.length || 0;
        const memberCount = memberProjects?.length || 0;
        projectsCount = ownedCount + memberCount;
      } else {
        console.error('Error fetching projects count:', ownedError || memberError);
      }
    } catch (error) {
      console.error('Error in projects count query:', error);
    }
    
    // 3. Get document count
    let documentsCount = 0;
    try {
      const { count, error: docsError } = await adminClient
        .from('project_documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!docsError) {
        documentsCount = count || 0;
      } else {
        console.error('Error fetching documents count:', docsError);
      }
    } catch (error) {
      console.error('Error in documents count query:', error);
    }
    
    return new Response(
      JSON.stringify({ 
        apiCalls: apiCallCount,
        brains: projectsCount,
        documents: documentsCount,
        status: "success"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in user-statistics function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        status: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
