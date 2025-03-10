
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative pt-28 md:pt-36 px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 max-w-5xl mx-auto">
      {/* Simple, centered hero content */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight mb-8">
          Leave it to Bra<span className="text-primary">3</span>n
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Bra3n is a general AI agent that bridges minds and knowledge: it doesn't just organize, it delivers results.
        </p>
        
        {/* Video container with rounded corners and subtle border */}
        <div className="rounded-lg overflow-hidden border border-border/20 shadow-sm mb-12 max-w-3xl mx-auto">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100">
            {/* Placeholder for video */}
            <div className="flex items-center justify-center w-full h-full bg-secondary/50">
              <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Button - simple black button with rounded corners */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-black text-white hover:bg-black/90 rounded-full px-8 py-6 h-auto text-base font-medium"
          >
            Try Bra3n
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
