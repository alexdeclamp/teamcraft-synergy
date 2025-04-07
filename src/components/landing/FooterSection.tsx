
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Map, Palette, FileText, Shield } from 'lucide-react';

const FooterSection = () => {
  // Get the current year for the copyright notice
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/40 bg-background/95 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div className="md:col-span-1">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg tracking-tight">
              Bra<span className="text-primary">3</span>n
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your second brain powered by AI. Organize thoughts, boost productivity, and collaborate effortlessly.
          </p>
        </div>
        
        {/* Product Links */}
        <div>
          <h3 className="font-medium mb-4">Product</h3>
          <ul className="space-y-3">
            <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a></li>
            <li><a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</a></li>
            <li><Link to="/sitemap" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
              Sitemap
              <Map className="ml-1 h-3.5 w-3.5" />
            </Link></li>
          </ul>
        </div>
        
        {/* Company Links */}
        <div>
          <h3 className="font-medium mb-4">Company</h3>
          <ul className="space-y-3">
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
          </ul>
        </div>
        
        {/* Legal Links */}
        <div>
          <h3 className="font-medium mb-4">Legal</h3>
          <ul className="space-y-3">
            <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
              Terms
              <FileText className="ml-1 h-3.5 w-3.5" />
            </Link></li>
            <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
              Privacy
              <Shield className="ml-1 h-3.5 w-3.5" />
            </Link></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</a></li>
            <li><Link to="/brand" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center">
              Brand
              <Palette className="ml-1 h-3.5 w-3.5" />
            </Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          © {currentYear} Bra3n AI. All rights reserved.
        </div>
        
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
