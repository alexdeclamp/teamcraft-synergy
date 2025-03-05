
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Plus, 
  User, 
  LogOut, 
  Menu, 
  X
} from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          
          <Button variant="outline" size="sm" className="ml-2">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground">
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
              <Link 
                to="/profile" 
                className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              <button 
                className="w-full flex items-center px-3 py-2 rounded-md hover:bg-accent text-muted-foreground"
                onClick={() => console.log("Sign out")}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
