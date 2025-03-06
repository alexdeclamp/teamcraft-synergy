
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <BrainCircuit className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Bra<span className="text-primary">3</span>n
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your intelligent project management workspace
        </p>
        <Button onClick={() => navigate('/auth')} size="lg">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
