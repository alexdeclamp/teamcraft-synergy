
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, 
  Plus, 
  User, 
  LogOut, 
  Menu, 
  X,
  Settings,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

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

  const navLinks = [
    { 
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />
    },
    { 
      name: 'New Project',
      path: '/new-project',
      icon: <Plus className="h-4 w-4 mr-2" />
    },
  ];

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-3",
        scrolled ? "bg-white/80 backdrop-blur-sm border-b shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-semibold">P</span>
          </div>
          <span className="font-semibold text-lg">ProjectSync</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1">
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
          
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={() => setProfileDialogOpen(true)}
          >
            <Avatar className="h-5 w-5 mr-2">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            Profile
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
      {mobileMenuOpen && (
        <div className="md:hidden bg-white animate-fade-in border-t mt-3">
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
            <div className="border-t my-2 pt-2">
              <button
                onClick={() => setProfileDialogOpen(true)}
                className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-left"
              >
                <User className="h-4 w-4 mr-2" />
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
          </div>
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Your account information
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-medium">{profile?.full_name || 'User'}</h3>
            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
            
            <div className="w-full space-y-2 mt-2">
              <div className="flex justify-between p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">Account Type</span>
                <span className="text-sm">Free</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="mr-2" onClick={() => setProfileDialogOpen(false)}>
              Close
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={handleOpenSettings}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">{user?.email}</span>
                    <Button size="sm" variant="ghost" className="h-7">Change</Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">{profile?.full_name || 'Not set'}</span>
                    <Button size="sm" variant="ghost" className="h-7">Edit</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preferences</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates about your projects</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7">Configure</Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Account Security</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Password</p>
                  <Button size="sm" variant="ghost" className="h-7">Change</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
