
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
        <span className="text-white font-semibold">P</span>
      </div>
      <span className="font-semibold text-lg">ProjectSync</span>
    </Link>
  );
};

export default Logo;
