
import React from 'react';
import { ArrowRight, Sparkles, Layers, Zap, Shield, CheckCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '@/components/landing/FeatureCard';
import Navbar from '@/components/Navbar';

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Powerful Features for Your Projects
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover how our intelligent tools can help you organize, analyze, and collaborate on your projects.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="space-y-16">
          <FeatureCard
            icon={<Layers className="h-6 w-6 text-primary" />}
            title="Intelligent Document Organization"
            description="Upload and categorize project documents with our AI-powered system that automatically extracts key information and organizes your files for easy access."
            imageUrl="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
            imagePosition="right"
          />
          
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-primary" />}
            title="Instant Insights Generation"
            description="Generate comprehensive summaries and insights from your documents in seconds. Our AI analyzes content across multiple files to give you a clear overview of your projects."
            imageUrl="https://images.unsplash.com/photo-1461749280684-dccba630e2f6"
            imagePosition="left"
          />
          
          <FeatureCard
            icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
            title="Collaborative Workspace"
            description="Work together with your team in real-time. Share documents, collaborate on notes, and discuss project details all in one unified platform."
            imageUrl="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
            imagePosition="right"
          />
        </div>
      </section>

      {/* Secondary Features */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto bg-accent/30 rounded-lg my-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Additional Capabilities</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-6 space-y-4">
            <div className="p-3 bg-primary/10 inline-flex rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Enterprise Security</h3>
            <p className="text-muted-foreground">Advanced encryption and security protocols to keep your data safe and protected.</p>
          </div>
          
          <div className="glass-card p-6 space-y-4">
            <div className="p-3 bg-primary/10 inline-flex rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Smart Automation</h3>
            <p className="text-muted-foreground">Automate repetitive tasks and workflows to save time and improve productivity.</p>
          </div>
          
          <div className="glass-card p-6 space-y-4">
            <div className="p-3 bg-primary/10 inline-flex rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Chat</h3>
            <p className="text-muted-foreground">Ask questions about your project data and get intelligent answers based on your documents.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Ready to transform your projects?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of teams who are already using our platform to work smarter and achieve more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/auth')} size="lg" className="rounded-md px-8 text-base">
            Get Started
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => window.open('https://docs.example.com', '_blank')} 
            variant="outline" 
            size="lg"
            className="rounded-md px-8 text-base"
          >
            Learn More
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Features;
