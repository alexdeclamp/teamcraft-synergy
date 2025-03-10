
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

const WelcomeDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { startOnboarding } = useOnboarding();
  
  useEffect(() => {
    // Show welcome dialog only for first-time users who haven't seen it
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // Wait a moment after page load to show the dialog
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleStartTutorial = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsOpen(false);
    startOnboarding();
  };
  
  const handleSkipTutorial = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Welcome to Bra<span className="text-primary">3</span>n
            <Sparkles className="h-5 w-5 text-primary" />
          </DialogTitle>
          <DialogDescription>
            Your intelligent analysis platform for seamless project organization and collaboration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-4">
            Would you like to take a quick tour to learn how to make the most of Bra3n?
          </p>
          <p className="text-sm text-muted-foreground">
            We'll guide you through the key features and help you get started.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleSkipTutorial}>
            Skip Tutorial
          </Button>
          <Button onClick={handleStartTutorial}>
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
