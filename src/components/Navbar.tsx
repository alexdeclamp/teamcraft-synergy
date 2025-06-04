
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useUserFeatures } from '@/hooks/useUserFeatures';

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
  const { userFeatures, isLoading } = useUserFeatures();

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
        scrolled ? "bg-white/95 backdrop-blur-md border-b shadow-lg" : "bg-white/90 backdrop-blur-sm border-b border-border/50"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-shrink-0">
          <Logo />
        </div>

        <div className="flex items-center space-x-6">
          <NavLinks />
          <div className="hidden md:block">
            <ProfileButton 
              onClick={() => setProfileDialogOpen(true)} 
              remainingDailyApiCalls={!isLoading ? userFeatures.remainingDailyApiCalls : undefined}
            />
          </div>
          
          <button 
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? 
              <X className="h-5 w-5" /> : 
              <Menu className="h-5 w-5" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onProfileClick={() => {
          setMobileMenuOpen(false);
          setProfileDialogOpen(true);
        }}
        onSignOutClick={signOut}
      />

      {/* Dialogs */}
      <ProfileDialog 
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onOpenSettings={handleOpenSettings}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </header>
  );
};

export default Navbar;
