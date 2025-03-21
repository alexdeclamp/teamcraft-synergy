
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = 'Loading subscription details...' }: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingState;
