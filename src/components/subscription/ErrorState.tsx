
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
}

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="p-4 border rounded-lg bg-amber-50 text-amber-600">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium">Unable to load subscription information</span>
      </div>
      <p className="text-sm">
        {message || "Please try refreshing the page or contact support if the problem persists."}
      </p>
    </div>
  );
};

export default ErrorState;
