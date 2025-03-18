
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SetupSubscriptionButtonProps {
  onSetupComplete?: () => void;
}

const SetupSubscriptionButton = ({ onSetupComplete }: SetupSubscriptionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-subscription-tables');
      
      if (error) {
        console.error('Error setting up subscription tables:', error);
        toast.error('Failed to set up subscription system');
        return;
      }
      
      if (data?.success) {
        toast.success('Subscription system set up successfully!');
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        toast.error(data?.message || 'Failed to set up subscription system');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSetup} 
      disabled={isLoading}
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Setting up...
        </>
      ) : (
        'Set Up Subscription System'
      )}
    </Button>
  );
};

export default SetupSubscriptionButton;
