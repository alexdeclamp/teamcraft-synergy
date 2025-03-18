
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import StartOnboardingButton from '@/components/onboarding/StartOnboardingButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [brainCount, setBrainCount] = useState(0);
  const [brainLimit, setBrainLimit] = useState(5);
  const [isLimited, setIsLimited] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.functions.invoke('user-statistics', {
          body: { userId: user.id },
        });
        
        if (error) {
          console.error('Error fetching user stats:', error);
          return;
        }
        
        if (data) {
          const totalBrains = (data.ownedBrains || 0) + (data.sharedBrains || 0);
          const maxBrains = data.accountLimits?.maxBrains || 5;
          
          setBrainCount(totalBrains);
          setBrainLimit(maxBrains);
          setIsLimited(maxBrains !== Infinity);
        }
      } catch (error) {
        console.error('Error checking user limits:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  const canCreateBrain = !isLimited || brainCount < brainLimit;

  return (
    <div className={`flex flex-col mb-4 sm:mb-8 gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold" id="dashboard-heading">Brains</h1>
            <Sparkles className="h-5 w-5 text-primary/70" />
          </div>
          <p className="text-muted-foreground mt-1">
            Manage and organize your intelligent workspaces
          </p>
        </div>
        
        <div className={`flex items-center ${isMobile ? 'mt-4 justify-between' : 'space-x-2'} w-full sm:w-auto`}>
          {!isMobile && <StartOnboardingButton className="mr-2" />}
          {!isMobile && <DashboardTutorial className="mr-2" />}
          
          {isLimited && !isLoading && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs mr-2 px-2 py-1 bg-muted rounded">
                    <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{brainCount} / {brainLimit} brains</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Free plan allows up to {brainLimit} brains</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <Button 
            onClick={() => navigate('/new-project')}
            className={`shadow-sm rounded-full flex-grow sm:flex-grow-0 ${!canCreateBrain ? 'opacity-50 cursor-not-allowed' : ''}`}
            id="new-brain-button"
            disabled={!canCreateBrain}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Brain
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
