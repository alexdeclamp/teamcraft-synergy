
import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      isMobile ? "mt-14 text-center" : "relative", // Changed from fixed to relative
      className
    )}>
      <Lock className="h-3.5 w-3.5 text-primary" />
      <span>
        Currently in private beta. 
        <Link to="/waitlist" className="ml-1 text-primary hover:underline">
          Join our waitlist
        </Link>
        {' '}or use an invitation code to access.
      </span>
    </div>
  );
}
