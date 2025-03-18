
import { UserSubscription } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';

// Helper to create a subscription object with default values
export const createDefaultSubscription = (userId: string): UserSubscription => ({
  id: 'default',
  user_id: userId,
  plan_type: 'starter',
  is_active: true,
  trial_ends_at: null,
  created_at: new Date().toISOString()
});

// Helper to create a default user subscription in the database
export const createDefaultUserSubscription = async (userId: string): Promise<void> => {
  const { error: createSubError } = await supabase.rpc('create_user_subscription', {
    p_user_id: userId,
    p_plan_type: 'starter'
  });
    
  if (createSubError) {
    console.error('Error creating default subscription with RPC:', createSubError);
    
    // Fall back to direct insert
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'starter',
        is_active: true
      });
      
    if (insertError) {
      console.error('Error creating default subscription:', insertError);
      throw insertError;
    }
  }
};
