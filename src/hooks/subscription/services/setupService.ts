
import { supabase } from '@/integrations/supabase/client';

// Import setupSubscriptionTables function
import { setupSubscriptionTables } from '@/pages/api/setup-subscription-tables';

// Helper to ensure subscription tables and data are set up
export const setupSubscriptionData = async (): Promise<void> => {
  try {
    await setupSubscriptionTables();
  } catch (setupError) {
    console.error('Error calling subscription setup function:', setupError);
    // Continue anyway as tables might already be set up
  }
};
