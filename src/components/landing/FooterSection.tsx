
import React from 'react';
import { Sparkles } from 'lucide-react';

const FooterSection: React.FC = () => {
  return (
    <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">
              Bra<span className="text-primary">3</span>n
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            AI-powered knowledge hub for your projects. Organize, search, and retrieve insights instantly.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Product</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Case Studies</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
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
