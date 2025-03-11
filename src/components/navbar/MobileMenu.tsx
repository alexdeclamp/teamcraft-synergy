
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { User, LogOut, LayoutDashboard, GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

type MobileMenuProps = {
  isOpen: boolean;
  onProfileClick: () => void;
  onSignOutClick: () => void;
};

const MobileMenu = ({ isOpen, onProfileClick, onSignOutClick }: MobileMenuProps) => {
  const location = useLocation();
  const { startOnboarding } = useOnboarding();
  
  const handleTutorialClick = () => {
    // Dispatch a custom event to trigger tutorial
    const event = new CustomEvent('start-dashboard-tutorial');
    window.dispatchEvent(event);
  };
  
  const navLinks = [
    { 
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white/95 backdrop-blur-sm animate-fade-in border-t mt-3 rounded-b-lg shadow-sm">
      <div className="py-3 px-4 space-y-3">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path}
            className={cn(
              "flex items-center px-3 py-2 rounded-md transition-colors",
              location.pathname === link.path ? 
                "bg-primary/10 text-primary" : 
                "hover:bg-accent"
            )}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
        
        {/* Tutorial Link */}
        <button
          onClick={handleTutorialClick}
          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-left"
        >
          <GraduationCap className="h-4 w-4 mr-2" />
          Tutorial
        </button>
        
        {/* Onboarding Link */}
        <button
          onClick={startOnboarding}
          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-left"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Onboarding
        </button>
        
        <div className="border-t my-2 pt-2">
          <button
            onClick={onProfileClick}
            className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-left"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>
          <button 
            className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-muted-foreground text-left"
            onClick={onSignOutClick}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
