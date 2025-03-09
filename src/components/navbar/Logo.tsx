
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <span className="font-semibold text-lg tracking-tight">
        Integer<span className="text-primary">.</span>AI
      </span>
    </Link>
  );
};

export default Logo;
