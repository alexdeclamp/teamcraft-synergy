
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase.functions.invoke('setup-subscription-tables');
    
    if (error) {
      console.error('Error invoking setup-subscription-tables function:', error);
      return res.status(500).json({ error: error.message || 'Failed to set up subscription tables' });
    }
    
    return res.status(200).json(data || { success: true });
  } catch (err) {
    console.error('Unexpected error in setup-subscription-tables API route:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
