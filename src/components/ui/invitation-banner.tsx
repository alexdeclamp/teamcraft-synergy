
import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvitationBannerProps {
  className?: string;
}

export function InvitationBanner({ className }: InvitationBannerProps) {
  return (
    <div className={cn(
      "w-full bg-primary/10 py-2 px-4 text-center text-sm flex items-center justify-center gap-1.5 font-medium",
      className
    )}>
      <Lock className="h-3.5 w-3.5 text-primary" />
      <span>Currently in private beta. Join our waitlist or use an invitation code to access.</span>
    </div>
  );
}
