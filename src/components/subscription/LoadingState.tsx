
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      <span>Loading subscription details...</span>
    </div>
  );
};

export default LoadingState;
