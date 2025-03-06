
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

type SignOutButtonProps = {
  onClick?: () => void;
};

const SignOutButton = ({ onClick }: SignOutButtonProps) => {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    if (onClick) onClick();
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
