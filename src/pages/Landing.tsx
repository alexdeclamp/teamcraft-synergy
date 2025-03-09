
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check, LineChart, Brain, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeatureCard from '@/components/landing/FeatureCard';
import TestimonialCard from '@/components/landing/TestimonialCard';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Intelligent Analysis",
      description: "Advanced AI analyzes your projects to extract key insights and identify patterns. Our machine learning algorithms process your data in real-time, finding connections that humans might miss and delivering actionable intelligence to drive your projects forward.",
      imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      imagePosition: "right" as const
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Smart Collaboration",
      description: "Seamlessly share insights with your team and collaborate in real-time. Our platform brings your entire team together, allowing for instant feedback, collaborative decision-making, and efficient knowledge sharing across departments and time zones.",
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      imagePosition: "left" as const
    },
    {
      icon: <LineChart className="h-10 w-10 text-primary" />,
      title: "Data Visualization",
      description: "Transform complex data into clear, actionable visualizations. See your project metrics in beautiful, intuitive charts and graphs that help you understand trends, identify opportunities, and communicate progress effectively to stakeholders.",
      imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
      imagePosition: "right" as const
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "Bra3n has revolutionized how our team analyzes project data. The insights are incredible.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      content: "The intelligent analysis features save me hours of work every week. Highly recommended.",
      avatar: "MC"
    },
    {
      name: "Alex Rodriguez",
      role: "Team Lead",
      content: "Our collaboration efficiency improved by 40% after implementing Bra3n.",
      avatar: "AR"
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
              Intelligent Project Analysis
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              Meet Bra<span className="text-primary">3</span>n
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              The intelligent companion for your projects. Analyze, visualize, and collaborate with unparalleled efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline" 
                size="lg"
                className="rounded-full px-8 text-base w-full sm:w-auto"
              >
                View Demo
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

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Intelligent Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful tools designed to enhance your productivity and decision making.
          </p>
        </div>
        
        <div className="space-y-16">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description}
              imageUrl={feature.imageUrl}
              imagePosition={feature.imagePosition}
            />
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <img 
              src="/placeholder.svg" 
              alt="Bra3n Benefits" 
              className="rounded-xl shadow-lg w-full"
              width={500}
              height={400}
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl sm:text-4xl font-semibold">Why Choose Bra3n?</h2>
            <div className="space-y-4">
              {[
                "Advanced AI that learns and adapts to your projects",
                "Seamless collaboration with your entire team",
                "Beautiful visualizations that tell the story of your data",
                "Time-saving automation of repetitive analysis tasks"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 rounded-full p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/auth')} className="rounded-full mt-4">
              Start Your Journey
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how Bra3n is transforming the way teams work.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <Card className="apple-glass p-8 md:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent -z-10" />
          <CardContent className="space-y-6 p-0">
            <Sparkles className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-3xl sm:text-4xl font-semibold">Ready to experience the future?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join thousands of professionals who have already transformed their workflow with Bra3n.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
                Get Started for Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => window.open('#', '_blank')} 
                variant="outline" 
                size="lg"
                className="rounded-full px-8 text-base w-full sm:w-auto"
              >
                Schedule Demo
              </Button>
            </div>
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
              Intelligent analysis for your projects. Seamlessly organize, generate insights, and collaborate.
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
