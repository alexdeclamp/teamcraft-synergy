
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';

type ProfileButtonProps = {
  onClick: () => void;
};

const ProfileButton = ({ onClick }: ProfileButtonProps) => {
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
    <Button 
      variant="outline" 
      size="sm" 
      className="ml-2"
      onClick={onClick}
    >
      <Avatar className="h-5 w-5 mr-2">
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      Profile
    </Button>
  );
};

export default ProfileButton;
