
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  fullName?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  fullName, 
  email, 
  size = 'md' 
}) => {
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  const sizeClass = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  }[size];

  return (
    <Avatar className={sizeClass}>
      <AvatarFallback className={size === 'lg' ? 'text-xl' : 'text-base'}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
