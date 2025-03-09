
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check, Upload, Brain, MessageSquare, Search, Shield, Users, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeatureCard from '@/components/landing/FeatureCard';
import TestimonialCard from '@/components/landing/TestimonialCard';

const Landing = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Upload className="h-10 w-10 text-primary" />,
      title: "Upload Your Knowledge",
      description: "Add notes, PDFs, images, and updates into your Brain."
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "AI Summarizes for You",
      description: "Bra3n instantly organizes and summarizes your content."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Ask Anything, Get Answers",
      description: "Use our AI-powered chat to retrieve insights instantly."
    }
  ];

  const benefits = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "AI-Powered Search",
      description: "Retrieve any information in seconds."
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Smart Summaries",
      description: "No more reading endless PDFs."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Team Collaboration",
      description: "Share & work together seamlessly."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure & Private",
      description: "Your data stays yours."
    }
  ];

  const userPersonas = [
    {
      title: "Consultants & Analysts",
      description: "Keep research organized and accessible."
    },
    {
      title: "Product Teams",
      description: "Centralize insights & findings."
    },
    {
      title: "Startups & Creators",
      description: "Manage ideas & notes easily."
    },
    {
      title: "Knowledge Workers",
      description: "Anyone who hates losing information."
    }
  ];

  const testimonials = [
    {
      name: "John D.",
      role: "Product Manager",
      content: "Bra3n changed how my team works! Finding past notes is now instant.",
      avatar: "JD"
    },
    {
      name: "Marie L.",
      role: "Consultant",
      content: "It's like having an AI assistant that actually knows my work.",
      avatar: "ML"
    },
    {
      name: "Alex P.",
      role: "Team Lead",
      content: "Our productivity improved dramatically after implementing Bra3n.",
      avatar: "AP"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              Bra<span className="text-primary">3</span>n
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              Stop Searching. Start Knowing.
            </p>
            <p className="text-md sm:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
              Organize your notes, PDFs, and documents into an AI-powered knowledge hub, where you can retrieve insights instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
                Try Bra3n for Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="apple-glass p-6 rounded-xl shadow-lg transition-all animate-fade-in">
              <img 
                src="/placeholder.svg" 
                alt="Bra3n Dashboard Preview" 
                className="rounded-lg w-full"
                width={600}
                height={400}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Simple steps to organize and access your knowledge.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {index + 1}
              </div>
              <FeatureCard 
                icon={step.icon} 
                title={step.title} 
                description={step.description} 
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-md italic">
            No more digging through messy docs – just ask and get what you need!
          </p>
        </div>
      </section>

      {/* Why Choose Bra3n Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Why Choose Bra3n?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Like Notion, but with an AI brain.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <FeatureCard 
              key={index} 
              icon={benefit.icon} 
              title={benefit.title} 
              description={benefit.description} 
            />
          ))}
        </div>
      </section>

      {/* Who is Bra3n for Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Who is Bra3n for?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Designed for those who value organized knowledge.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {userPersonas.map((persona, index) => (
            <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">{persona.title}</h3>
                <p className="text-muted-foreground">{persona.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">What Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how Bra3n is transforming the way teams work.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              avatarText={testimonial.avatar}
            />
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <Card className="apple-glass p-8 md:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent -z-10" />
          <CardContent className="space-y-6 p-0">
            <Sparkles className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-3xl sm:text-4xl font-semibold">Ready to Try?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start organizing your knowledge with AI today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
                Try for Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">No credit card required.</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
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
              Your AI-Powered Knowledge Hub. Organize notes, PDFs, and documents for instant insights.
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
    </div>
  );
};

export default Landing;
