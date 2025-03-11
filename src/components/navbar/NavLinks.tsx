
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, GraduationCap, Sparkles } from "lucide-react";
import { useOnboarding } from '@/contexts/OnboardingContext';
import { toast } from 'sonner';

const NavLinks = () => {
  const location = useLocation();
  const { startOnboarding } = useOnboarding();
  
  const handleTutorialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Dispatch a custom event to trigger tutorial
    const event = new CustomEvent('start-dashboard-tutorial');
    window.dispatchEvent(event);
    toast.info("Tutorial started! Follow the instructions to learn more.");
  };

  // Listen for tutorial events from other components
  useEffect(() => {
    const startTutorial = () => {
      console.log("Tutorial event received in NavLinks");
      toast.info("Tutorial started! Follow the instructions to learn more.");
    };

    window.addEventListener('start-dashboard-tutorial', startTutorial);
    return () => window.removeEventListener('start-dashboard-tutorial', startTutorial);
  }, []);

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
      
      {/* Tutorial Button */}
      <Button
        variant="ghost"
        size="sm"
        className="subtle-ring-focus"
        onClick={handleTutorialClick}
      >
        <GraduationCap className="h-4 w-4 mr-2" />
        Tutorial
      </Button>
      
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
