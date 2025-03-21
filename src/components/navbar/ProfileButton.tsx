
import React, { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';

type ProfileButtonProps = {
  onClick: () => void;
  badge?: ReactNode;
};

const ProfileButton = ({ onClick, badge }: ProfileButtonProps) => {
  const { user, profile } = useAuth();
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="flex items-center gap-2">
      {badge}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onClick}
        className="flex items-center gap-2"
      >
        <Avatar className="h-5 w-5">
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <span>Profile</span>
      </Button>
    </div>
  );
};

export default ProfileButton;
