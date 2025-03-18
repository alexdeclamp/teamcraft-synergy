
import { Json } from '@/integrations/supabase/types';

// Helper function to safely convert Json[] to string[]
export const convertJsonToStringArray = (jsonValue: Json | null): string[] => {
  if (!jsonValue) return [];
  
  if (Array.isArray(jsonValue)) {
    // Convert each item to string to ensure type safety
    return jsonValue.map(item => String(item));
  }
  
  return [];
};
