
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, MessageSquare, Share2, Upload } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const FourStepsSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const steps = [
    {
      number: 1,
      title: "Describe what you want to build in natural language.",
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      number: 2,
      title: "Bra3n builds your first version instantly.",
      icon: <Upload className="h-6 w-6 text-primary" />
    },
    {
      number: 3,
      title: "Talk to the editor to design and extend your project.",
      icon: <MessageSquare className="h-6 w-6 text-primary" />
    },
    {
      number: 4,
      title: "Share your project via link or sync your code to GitHub.",
      icon: <Share2 className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground">
          Build and share your knowledge base in just four simple steps
        </p>
      </div>

      <div className="relative">
        {/* Horizontal Line for Desktop */}
        {!isMobile && (
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
        )}
        
        {/* Vertical Line for Mobile */}
        {isMobile && (
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-border -translate-x-1/2 z-0" />
        )}

        {/* Steps */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'grid-cols-4 gap-4'} relative z-10`}>
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Step Number */}
              <div className="bg-background border-2 border-primary text-primary rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg mb-4">
                {step.number}
              </div>
              
              {/* Step Content */}
              <div className="bg-background p-4 rounded-lg">
                <div className="flex justify-center mb-3">
                  {step.icon}
                </div>
                <p className="text-sm sm:text-base">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-12">
        <Button 
          onClick={() => navigate('/waitlist')} 
          size="lg" 
          className="shadow-sm"
        >
          Join the Waitlist
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FourStepsSection;
