
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

const NavLinks = () => {
  const location = useLocation();
  
  const navLinks = [
    { 
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />
    }
  ];

  return (
    <div className="hidden md:flex items-center space-x-2">
      {navLinks.map((link) => (
        <Link key={link.path} to={link.path}>
          <Button
            variant={location.pathname === link.path ? "default" : "ghost"}
            size="sm"
            className="subtle-ring-focus"
          >
            {link.icon}
            {link.name}
          </Button>
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
