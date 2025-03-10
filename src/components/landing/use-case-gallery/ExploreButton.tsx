
import React from 'react';
import { Search } from 'lucide-react';

const ExploreButton: React.FC = () => {
  return (
    <div className="flex justify-center mt-12">
      <button className="bg-foreground text-background px-6 py-3 rounded-full flex items-center gap-2 hover:bg-foreground/90 transition-colors">
        Explore more use cases
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ExploreButton;
