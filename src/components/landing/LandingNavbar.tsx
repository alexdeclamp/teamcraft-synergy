
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-4",
        scrolled ? "bg-white/80 backdrop-blur-sm border-b shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/landing" className="flex items-center space-x-2">
          <div className="flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Bra<span className="text-primary">3</span>n
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <div className="flex items-center space-x-8 mr-8">
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
          
          <div className="flex items-center space-x-4">
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

        {/* Mobile burger menu - using Sheet for fullscreen */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full p-0 border-none">
            <div className="flex flex-col h-full bg-background">
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/" className="flex items-center space-x-2">
                  <Sparkles className="h-7 w-7 text-primary" />
                  <span className="font-semibold text-lg tracking-tight">
                    Bra<span className="text-primary">3</span>n
                  </span>
                </Link>
                <SheetClose className="rounded-full p-2 hover:bg-accent">
                  <X className="h-5 w-5" />
                </SheetClose>
              </div>
              
              <div className="flex-1 overflow-auto py-6 px-6">
                <nav className="space-y-6">
                  <div className="space-y-5">
                    {navLinks.map((link) => (
                      <SheetClose key={link.name} asChild>
                        <a 
                          href={link.href}
                          className="block text-lg font-medium hover:text-primary py-2 transition-colors"
                        >
                          {link.name}
                        </a>
                      </SheetClose>
                    ))}
                  </div>
                </nav>
              </div>
              
              <div className="p-6 border-t space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => navigate('/auth')}
                >
                  Log in
                </Button>
                <Button 
                  className="w-full justify-center"
                  onClick={() => navigate('/auth')}
                >
                  Sign up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default LandingNavbar;
