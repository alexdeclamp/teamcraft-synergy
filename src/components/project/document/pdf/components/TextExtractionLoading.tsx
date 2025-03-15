
import React from 'react';
import { Loader2 } from 'lucide-react';

interface TextExtractionLoadingProps {
  message: string;
  description?: string;
}

const TextExtractionLoading: React.FC<TextExtractionLoadingProps> = ({
  message,
  description
}) => {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-lg font-medium">{message}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};

export default TextExtractionLoading;
