
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { useOnboarding } from '@/contexts/OnboardingContext';

const NavLinks = () => {
  const location = useLocation();
  const { startOnboarding } = useOnboarding();

  const navLinks = [
    { 
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />
    }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-4">
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
      
      {/* Onboarding Button */}
      <Button
        variant="ghost"
        size="sm"
        className="subtle-ring-focus"
        onClick={startOnboarding}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Onboarding
      </Button>
    </nav>
  );
};

export default NavLinks;
