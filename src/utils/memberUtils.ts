
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

/**
 * Find a membership tier by name
 * Performs a case-insensitive partial match on tier names
 */
export const findTierByName = async (tierName: string): Promise<string | null> => {
  console.log('Looking up tier by name:', tierName);
  
  try {
    // Look for partial matches (case insensitive)
    const { data: tiers, error } = await supabase
      .from('membership_tiers')
      .select('id, name')
      .ilike('name', `%${tierName}%`);
      
    if (error) {
      console.error('Error querying tiers:', error);
      throw error;
    }
    
    console.log('Tiers search results:', tiers);
    
    if (tiers && tiers.length > 0) {
      // Sort by exact match first
      const exactMatch = tiers.find(tier => 
        tier.name.toLowerCase() === tierName.toLowerCase()
      );
      
      if (exactMatch) {
        console.log('Found exact tier match:', exactMatch);
        return exactMatch.id;
      }
      
      // Then try contains match
      const containsMatch = tiers.find(tier => 
        tier.name.toLowerCase().includes(tierName.toLowerCase())
      );
      
      if (containsMatch) {
        console.log('Found tier contains match:', containsMatch);
        return containsMatch.id;
      }
      
      // Finally just return the first one
      console.log('Using first tier match:', tiers[0]);
      return tiers[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding tier:', error);
    return null;
  }
};

/**
 * Get the tier ID for a paid plan (non-free)
 * Used as a fallback when the specific tier can't be found
 */
export const getFirstPaidTier = async (): Promise<string | null> => {
  try {
    const { data: tiers, error } = await supabase
      .from('membership_tiers')
      .select('id, name, monthly_price')
      .not('monthly_price', 'eq', 0)
      .order('monthly_price', { ascending: true })
      .limit(1);
      
    if (error) {
      console.error('Error querying paid tiers:', error);
      throw error;
    }
    
    if (tiers && tiers.length > 0) {
      console.log('Found paid tier:', tiers[0]);
      return tiers[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding paid tier:', error);
    return null;
  }
};
