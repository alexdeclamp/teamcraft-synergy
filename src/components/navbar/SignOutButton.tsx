
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type SignOutButtonProps = {
  onClick: () => void;
};

const SignOutButton = ({ onClick }: SignOutButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-muted-foreground"
      onClick={onClick}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
};

export default SignOutButton;
