
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <span className="font-semibold text-lg tracking-tight whitespace-nowrap">
        Bra<span className="text-primary">3</span>n
      </span>
    </Link>
  );
};

export default Logo;
