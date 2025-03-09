
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BrainCog, Sigma } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-5 gap-3">
          <BrainCog className="h-12 w-12 text-primary" />
          <Sigma className="h-10 w-10 text-primary/80" />
        </div>
        <h1 className="text-5xl font-semibold mb-4 tracking-tight">
          Integer<span className="text-primary">.</span>AI
        </h1>
        <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto leading-relaxed">
          Mathematical intelligence for your projects. Analyze documents, generate insights, and collaborate seamlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8">
            Get Started
          </Button>
          <Button 
            onClick={() => window.open('https://docs.example.com', '_blank')} 
            variant="outline" 
            size="lg"
            className="rounded-full px-8"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
