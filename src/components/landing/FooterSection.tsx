
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterSection: React.FC = () => {
  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg tracking-tight">
              Bra<span className="text-primary">3</span>n
            </span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            AI-powered knowledge hub for your projects. Organize, search, and retrieve insights instantly.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Product</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Legal</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Bra3n. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterSection;
