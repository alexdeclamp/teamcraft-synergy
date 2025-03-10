
import React from 'react';
import { Lock } from 'lucide-react';

const PrivateBetaNotice = () => {
  return (
    <div className="bg-primary/5 rounded-lg p-3 flex items-start mb-4 border border-primary/20">
      <Lock className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-primary mb-1">Private Beta Access</p>
        <p className="text-muted-foreground">Bra3n is currently in private beta. An invitation code is required to join our exclusive early access program.</p>
      </div>
    </div>
  );
};

export default PrivateBetaNotice;
