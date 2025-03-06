
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X, Plus, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Import smaller components
import Logo from './navbar/Logo';
import ProfileDialog from './navbar/ProfileDialog';
import SettingsDialog from './navbar/SettingsDialog';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
  };

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
        {/* Left section with logo and main navigation */}
        <div className="flex items-center space-x-4">
          <Logo />
          
          {location.pathname === '/dashboard' && (
            <Button variant="default" className="flex items-center" asChild>
              <Link to="/dashboard">
                Dashboard
              </Link>
            </Button>
          )}

          {user && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/new-project" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}
        </div>

        {/* Right section with user actions */}
        {user && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setProfileDialogOpen(true)}
            >
              {user.email ? user.email.substring(0, 2).toUpperCase() : 'AS'}
              <span className="ml-2">Profile</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

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
      {mobileMenuOpen && (
        <div className="md:hidden bg-white animate-fade-in border-t mt-3">
          <div className="py-3 px-4 space-y-3">
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-accent"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/new-project"
                  className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-accent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
                <div className="border-t my-2 pt-2">
                  <button
                    onClick={() => setProfileDialogOpen(true)}
                    className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-left"
                  >
                    Profile
                  </button>
                  <button 
                    className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-muted-foreground text-left"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
