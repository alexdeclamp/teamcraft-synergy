
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Configuration
export const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
export const supabaseUrl = Deno.env.get('SUPABASE_URL');
export const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Define subscription type without importing from read-only file
type UserSubscription = {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  is_active: boolean;
};

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

// Check if user has reached API limits
export const checkApiLimits = async (userId: string) => {
  const supabase = getSupabaseClient();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  try {
    // Check for pro subscription 
    const { data: subscriptionData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('plan_type', 'pro')
      .single();
    
    // Pro users have unlimited API calls
    if (subscriptionData && !subError) {
      return { limitReached: false };
    }
    
    // Count API calls for free users
    const { count, error: countError } = await supabase
      .from('user_usage_stats')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action_type', 'openai_api_call')
      .gte('created_at', firstDayOfMonth.toISOString());
    
    if (countError) {
      console.error('Error counting API calls:', countError);
      return { limitReached: false }; // Default to allowing the call in case of error
    }
    
    return { 
      limitReached: (count || 0) >= 50,
      currentCount: count || 0 
    };
  } catch (error) {
    console.error('Error checking API limits:', error);
    return { limitReached: false }; // Default to allowing the call in case of error
  }
};

// Log API usage
export const logApiUsage = async (userId: string) => {
  const supabase = getSupabaseClient();
  
  try {
    // First check if the user has reached their limit
    const { limitReached } = await checkApiLimits(userId);
    
    if (limitReached) {
      return { error: 'API call limit reached', limitReached: true };
    }
    
    const { error: logError } = await supabase
      .from('user_usage_stats')
      .insert({
        user_id: userId,
        action_type: 'openai_api_call',
      });
    
    if (logError) {
      console.error('Error logging OpenAI API call:', logError);
      return { error: logError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inserting OpenAI API call record:', error);
    return { error: error.message };
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
