
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface InvitationBannerProps {
  className?: string;
}

export function InvitationBanner({ className }: InvitationBannerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "w-full bg-primary/10 py-2 px-4 text-sm flex items-center justify-center gap-1.5 font-medium",
      className
    )}>
      <span>
        Welcome to Bra3n - Your collaborative knowledge management system
      </span>
    </div>
  );
}
