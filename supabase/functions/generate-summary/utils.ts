
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

// Log API usage - now just logs without checking limits
export const logApiUsage = async (userId: string) => {
  const supabase = getSupabaseClient();
  
  try {
    // Log the API call without checking limits
    const { error: logError } = await supabase
      .from('user_usage_stats')
      .insert({
        user_id: userId,
        action_type: 'openai_api_call',
      });
    
    if (logError) {
      console.error('Error logging OpenAI API call:', logError);
      return { warning: 'API call usage could not be logged' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in logApiUsage:', error);
    return { warning: 'API usage logging failed' };
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
