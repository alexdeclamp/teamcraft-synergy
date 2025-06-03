
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NavLinks: React.FC = () => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Button variant="ghost" asChild>
        <Link to="/dashboard">Dashboard</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/integrations">Integrations</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/vector-database">Vector Database</Link>
      </Button>
    </div>
  );
};

export default NavLinks;
