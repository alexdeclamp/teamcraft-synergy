
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

// Import the smaller components
import Logo from './navbar/Logo';
import NavLinks from './navbar/NavLinks';
import ProfileButton from './navbar/ProfileButton';
import MobileMenu from './navbar/MobileMenu';
import ProfileDialog from './navbar/ProfileDialog';
import SettingsDialog from './navbar/SettingsDialog';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleOpenSettings = () => {
    setProfileDialogOpen(false);
    setSettingsDialogOpen(true);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-3",
        scrolled ? "bg-white/80 backdrop-blur-sm border-b shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLinks />
          
          <ProfileButton onClick={() => setProfileDialogOpen(true)} />
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? 
            <X className="h-5 w-5" /> : 
            <Menu className="h-5 w-5" />
          }
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onProfileClick={() => setProfileDialogOpen(true)}
        onSignOutClick={signOut}
      />

      {/* Profile Dialog */}
      <ProfileDialog 
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onOpenSettings={handleOpenSettings}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </header>
  );
};

export default Navbar;
