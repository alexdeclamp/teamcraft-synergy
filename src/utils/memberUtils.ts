
import { supabase } from '@/integrations/supabase/client';

/**
 * Find a user by their email address
 * Searches in profiles table first, then falls back to the RPC function
 */
export const findUserByEmail = async (email: string): Promise<string | null> => {
  console.log('Looking up user by email:', email);
  
  try {
    // First check profiles table for the email
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', email.toLowerCase());

    if (profilesError) {
      console.error('Error querying profiles:', profilesError);
      throw profilesError;
    }
    
    console.log('Profiles search results:', profiles);
    
    // Find the first matching profile
    const matchingProfile = profiles?.find(profile => 
      profile.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (matchingProfile?.id) {
      console.log('User found in profiles:', matchingProfile);
      return matchingProfile.id;
    }
    
    // If we couldn't find the user in profiles, try using our RPC function
    const { data: authProfiles, error: authError } = await supabase
      .rpc('get_user_by_email', { 
        lookup_email: email.toLowerCase() 
      });
    
    if (authError) {
      console.error('Error with RPC function:', authError);
      throw authError;
    } 
    
    console.log('Auth profiles from RPC:', authProfiles);
    
    if (authProfiles && authProfiles.length > 0) {
      console.log('User found via RPC:', authProfiles[0]);
      return authProfiles[0].id;
    }
    
    throw new Error('User with this email not found. Please ensure they have created an account first.');
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
};
