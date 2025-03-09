
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="h-14 w-14 text-primary" />
        </div>
        <h1 className="text-5xl font-semibold tracking-tight mb-5">
          Bra<span className="text-primary">3</span>n
        </h1>
        <p className="text-muted-foreground text-xl max-w-xl mx-auto leading-relaxed mb-10">
          Intelligent analysis for your projects. Seamlessly organize documents, generate insights, and collaborate with your team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm">
            Get Started
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => window.open('https://docs.example.com', '_blank')} 
            variant="outline" 
            size="lg"
            className="rounded-full px-8 text-base"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
