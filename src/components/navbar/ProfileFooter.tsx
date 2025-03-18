
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";

interface ProfileFooterProps {
  onSignOut: () => Promise<void>;
  onOpenSettings: () => void;
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({ onSignOut, onOpenSettings }) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1 text-destructive hover:bg-destructive/10" 
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="gap-1" 
        onClick={onOpenSettings}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </div>
  );
};

export default ProfileFooter;
