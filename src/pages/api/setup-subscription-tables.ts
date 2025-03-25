
import { supabase } from '@/integrations/supabase/client';

export async function setupSubscriptionTables() {
  try {
    // Call the Supabase function to set up subscription tables
    const { data, error } = await supabase.functions.invoke('setup-subscription-tables');
    
    if (error) {
      console.error('Error invoking setup-subscription-tables function:', error);
      throw new Error(error.message || 'Failed to set up subscription tables');
    }
    
    console.log('Subscription tables setup successful:', data);
    return data || { success: true };
  } catch (err) {
    console.error('Unexpected error in setup-subscription-tables API route:', err);
    throw new Error('An unexpected error occurred');
  }
}
