
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Check, X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';

type Subscription = {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  is_active: boolean;
};

type SubscriptionManagerProps = {
  userId: string;
  accountType: 'Free' | 'Pro';
  onSubscriptionUpdated: () => void;
};

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  userId, 
  accountType,
  onSubscriptionUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [action, setAction] = useState<'upgrade' | 'downgrade' | null>(null);

  const handleUpgrade = async () => {
    setAction('upgrade');
    setConfirmDialogOpen(true);
  };

  const handleDowngrade = async () => {
    setAction('downgrade');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!action) return;
    
    setLoading(true);
    try {
      const apiAction = action === 'upgrade' ? 'upgrade_to_pro' : 'downgrade_to_free';
      
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: apiAction }
      });
      
      if (error) {
        console.error('Error managing subscription:', error);
        toast.error(`Failed to ${action} your subscription`);
        return;
      }
      
      if (data.status === 'success') {
        toast.success(data.message);
        onSubscriptionUpdated();
      } else {
        toast.error(data.message || `Failed to ${action} your subscription`);
      }
    } catch (error) {
      console.error('Error in subscription management:', error);
      toast.error(`An error occurred while trying to ${action} your subscription`);
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <div className="mt-4 space-y-4">
        <h4 className="font-medium text-sm">Subscription</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Free Plan Card */}
          <div className={`border rounded-lg p-4 ${accountType === 'Free' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-semibold">Free</h5>
              {accountType === 'Free' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <ul className="text-xs space-y-2 mb-4">
              <li className="flex items-center">
                <span className="mr-1">•</span> 5 Brains
              </li>
              <li className="flex items-center">
                <span className="mr-1">•</span> 50 API calls/month
              </li>
            </ul>
            {accountType === 'Pro' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={handleDowngrade}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Downgrade
              </Button>
            )}
          </div>
          
          {/* Pro Plan Card */}
          <div className={`border rounded-lg p-4 ${accountType === 'Pro' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-semibold flex items-center">
                  Pro <Sparkles className="h-3 w-3 ml-1 text-yellow-500" />
                </h5>
              </div>
              {accountType === 'Pro' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <ul className="text-xs space-y-2 mb-4">
              <li className="flex items-center">
                <span className="mr-1">•</span> Unlimited Brains
              </li>
              <li className="flex items-center">
                <span className="mr-1">•</span> Unlimited API calls
              </li>
            </ul>
            {accountType === 'Free' && (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full text-xs"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === 'upgrade' ? 'Upgrade to Pro' : 'Downgrade to Free'}
            </DialogTitle>
            <DialogDescription>
              {action === 'upgrade' 
                ? 'You are about to upgrade to the Pro plan with unlimited brains and API calls.'
                : 'You are about to downgrade to the Free plan with limited brains and API calls.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {action === 'downgrade' && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm mb-4">
                <p className="font-medium mb-1">Warning:</p>
                <p>If you have more than 5 brains, you won't be able to create new ones until you're below the limit.</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {action === 'upgrade' 
                ? 'Are you sure you want to upgrade your account?'
                : 'Are you sure you want to downgrade your account?'
              }
            </p>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant={action === 'upgrade' ? 'default' : 'outline'}
              className={action === 'downgrade' ? 'text-destructive hover:bg-destructive/10 hover:text-destructive' : ''}
              onClick={handleConfirmAction}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {action === 'upgrade' ? 'Upgrade' : 'Downgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionManager;
