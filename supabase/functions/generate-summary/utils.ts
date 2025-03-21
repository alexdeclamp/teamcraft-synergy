
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Configuration
export const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
export const supabaseUrl = Deno.env.get('SUPABASE_URL');
export const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Check daily API usage limit
export const checkDailyApiLimit = async (userId: string) => {
  const supabase = getSupabaseClient();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  try {
    // Get the user's subscription plan
    const { data: subscriptionData, error: subscriptionError } = await supabase.rpc(
      'get_user_subscription',
      { p_user_id: userId }
    );
    
    if (subscriptionError) {
      console.error('Error fetching user subscription:', subscriptionError);
      throw new Error('Could not verify user subscription');
    }
    
    // If user is on pro plan, they have unlimited usage
    if (subscriptionData && subscriptionData.plan_type === 'pro') {
      return { allowed: true };
    }
    
    // For starter plan, check daily usage
    const { count, error: countError } = await supabase
      .from('user_usage_stats')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action_type', 'openai_api_call')
      .gte('created_at', startOfDay.toISOString());
    
    if (countError) {
      console.error('Error checking daily API usage:', countError);
      throw new Error('Could not verify API usage');
    }
    
    // Starter plan: 10 calls per day limit
    const dailyLimit = 10;
    const dailyUsage = count || 0;
    
    return {
      allowed: dailyUsage < dailyLimit,
      dailyUsage,
      dailyLimit,
      remainingCalls: Math.max(0, dailyLimit - dailyUsage)
    };
  } catch (error) {
    console.error('Error in checkDailyApiLimit:', error);
    throw error;
  }
};

// Log API usage
export const logApiUsage = async (userId: string) => {
  const supabase = getSupabaseClient();
  
  try {
    // First check if the user is allowed to make this call
    const usageCheck = await checkDailyApiLimit(userId);
    
    if (!usageCheck.allowed) {
      return {
        allowed: false,
        error: `Daily API limit reached. You have used ${usageCheck.dailyUsage} out of ${usageCheck.dailyLimit} allowed calls.`
      };
    }
    
    // If allowed, log the API call
    const { error: logError } = await supabase
      .from('user_usage_stats')
      .insert({
        user_id: userId,
        action_type: 'openai_api_call',
      });
    
    if (logError) {
      console.error('Error logging OpenAI API call:', logError);
      return { allowed: true, warning: 'API call usage could not be logged' };
    }
    
    return { 
      allowed: true,
      remainingCalls: usageCheck.remainingCalls - 1
    };
  } catch (error) {
    console.error('Error in logApiUsage:', error);
    return { allowed: true, warning: 'API usage check failed, proceeding anyway' };
  }
};

// Validate required parameters
export const validateRequestParams = (params: any) => {
  const { type, content, projectId, userId, noteId, imageUrl } = params;
  
  if (!content) {
    throw new Error('Content is required');
  }
  
  if (!projectId) {
    throw new Error('Project ID is required');
  }
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  if (type === 'note' && !noteId) {
    throw new Error('Note ID is required for note summaries');
  }
  
  if (type === 'image' && !imageUrl) {
    throw new Error('Image URL is required for image summaries');
  }
  
  return { type, content, projectId, userId, noteId, imageUrl };
};
