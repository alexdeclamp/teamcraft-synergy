
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from '@/components/ui/button';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Use Cases", href: "#use-cases" },
    { name: "Benefits", href: "#benefits" },
    { name: "Testimonials", href: "#testimonials" }
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
          <div className="flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Bra<span className="text-primary">3</span>n
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <div className="flex items-center space-x-6 mr-6">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={() => navigate('/auth')}
            >
              Log in
            </Button>
            <Button 
              className="rounded-full"
              onClick={() => navigate('/auth')}
            >
              Sign up
            </Button>
          </div>
        </nav>

        {/* Mobile menu button */}
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

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-x-0 top-[61px] bg-white shadow-lg border-t transform transition-transform duration-300 ease-in-out md:hidden z-50",
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="px-4 py-5 space-y-5">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-sm font-medium py-2 px-3 rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="flex flex-col space-y-3 pt-3 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => { 
                navigate('/auth');
                setMobileMenuOpen(false);
              }}
            >
              Log in
            </Button>
            <Button 
              className="w-full justify-center"
              onClick={() => { 
                navigate('/auth');
                setMobileMenuOpen(false);
              }}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
