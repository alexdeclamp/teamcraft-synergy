
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/navbar/Logo';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
            >
              Log in
            </Button>
            <Button 
              onClick={() => navigate('/auth?signup=true')}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col md:flex-row">
        {/* Left column - Text */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 md:pl-12 lg:pl-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your projects.<br />
            <span className="text-primary">Smarter.</span> Faster.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            Bra<span className="text-primary">3</span>n is an AI-powered workspace that helps teams manage projects by turning your scattered documents into knowledge you can actually use.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth?signup=true')}
              className="gap-2"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              See demo
            </Button>
          </div>
          
          {/* Stats or proof */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-3xl font-bold">90%</p>
              <p className="text-muted-foreground">Less time searching for information</p>
            </div>
            <div>
              <p className="text-3xl font-bold">2x</p>
              <p className="text-muted-foreground">Faster project completion</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-muted-foreground">AI assistance</p>
            </div>
          </div>
        </div>
        
        {/* Right column - Image */}
        <div className="flex-1 bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl rounded-lg overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" 
              alt="Team members collaborating on Bra3n platform" 
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Problem/Solution section */}
      <section className="bg-muted py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">The problems we solve</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Information overload</h3>
              <p className="text-muted-foreground mb-4">Your team drowns in docs, files, and messages. Finding what you need is a struggle.</p>
              <p className="font-medium">
                <CheckCircle className="h-4 w-4 inline-block mr-2 text-primary" />
                Our AI instantly surfaces relevant information
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Knowledge silos</h3>
              <p className="text-muted-foreground mb-4">Critical information stays trapped with individuals, causing delays and duplicate work.</p>
              <p className="font-medium">
                <CheckCircle className="h-4 w-4 inline-block mr-2 text-primary" />
                Centralized, searchable knowledge base for the entire team
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Context switching</h3>
              <p className="text-muted-foreground mb-4">Jumping between tools wastes time and breaks concentration, slowing down your team.</p>
              <p className="font-medium">
                <CheckCircle className="h-4 w-4 inline-block mr-2 text-primary" />
                All-in-one workspace that connects your tools and content
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make your team more effective?</h2>
          <p className="text-xl mb-8 text-primary-foreground/80">Start using Bra3n today and transform how your team works.</p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth?signup=true')}
            className="bg-white text-primary hover:bg-white/90"
          >
            Get started for free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background px-6 py-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
              <p className="text-sm text-muted-foreground mt-2">Empowering teams to work smarter.</p>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2023 Bra3n. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
