
import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center">
        <BrainCircuit className="h-8 w-8 text-primary" />
      </div>
      <span className="font-bold text-lg tracking-tight">
        Bra<span className="text-primary">3</span>n
      </span>
    </Link>
  );
};

export default Logo;
