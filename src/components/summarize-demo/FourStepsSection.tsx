
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, MessageSquare, Share2, Upload } from 'lucide-react';

const FourStepsSection = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      number: 1,
      title: "Describe what you want to build in natural language.",
      icon: <FileText className="h-6 w-6 text-primary" />,
      description: "Start by telling Bra3n what you want to create in simple, conversational language."
    },
    {
      number: 2,
      title: "Bra3n builds your first version instantly.",
      icon: <Upload className="h-6 w-6 text-primary" />,
      description: "Our AI will generate your project and deliver the first version in seconds."
    },
    {
      number: 3,
      title: "Talk to the editor to design and extend your project.",
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      description: "Refine your project through natural conversation with our AI editor."
    },
    {
      number: 4,
      title: "Share your project via link or sync your code to GitHub.",
      icon: <Share2 className="h-6 w-6 text-primary" />,
      description: "Distribute your creation or integrate it with your development workflow."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Build and share your knowledge base in just four simple steps
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-12">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center w-full md:w-1/4">
            <div className="relative">
              <div className="bg-primary/10 w-14 h-14 rounded-lg mb-4 flex items-center justify-center feature-icon-container">
                <div className="font-bold text-lg text-primary">{step.number}</div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-full w-full h-0.5 bg-primary/20" style={{ width: 'calc(100% - 3.5rem)' }}></div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="text-center mt-6">
        <Button 
          onClick={() => navigate('/waitlist')} 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          Join the Waitlist
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FourStepsSection;
