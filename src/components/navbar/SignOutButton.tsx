
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type SignOutButtonProps = {
  onClick?: () => void;
};

const SignOutButton = ({ onClick }: SignOutButtonProps) => {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      // Immediately call the callback if provided to close any dialogs
      if (onClick) onClick();
      
      // Then sign out
      await signOut();
      // Toast is now handled in the AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-muted-foreground"
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
};

export default SignOutButton;
