
import React from 'react';
import { FileText } from 'lucide-react';

const TextExtractionEmpty: React.FC = () => {
  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-center text-muted-foreground">No text could be extracted from this PDF. It may be an image-based PDF.</p>
    </div>
  );
};

export default TextExtractionEmpty;
