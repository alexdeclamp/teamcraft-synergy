
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <span className="font-bold text-lg">
        Bra<span className="text-primary">3</span>n
      </span>
    </Link>
  );
};

export default Logo;
