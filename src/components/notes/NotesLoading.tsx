
import React from 'react';
import { Loader2 } from 'lucide-react';

const NotesLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default NotesLoading;
