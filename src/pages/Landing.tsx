
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check, Shield, Zap, BarChart } from 'lucide-react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeatureCard from '@/components/landing/FeatureCard';

const Landing = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Fast Implementation",
      description: "Get up and running in minutes, not days. Our platform is designed for quick deployment."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance with industry standards."
    },
    {
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Advanced Analytics",
      description: "Get insights into your business with our powerful analytics tools and dashboards."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Simplify Your Workflow
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              The Modern SaaS Platform
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              Powerful tools to help your business grow, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button onClick={() => navigate('/home')} variant="outline" size="lg" className="rounded-full px-8 text-base w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="apple-glass p-6 rounded-xl shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                alt="Dashboard Preview" 
                className="rounded-lg w-full" 
                width={600} 
                height={400} 
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Main Banner */}
      <section className="large-image-section my-16">
        <img 
          src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
          alt="Business Growth" 
          className="w-full h-full object-cover"
        />
        <div className="content-overlay">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6">Accelerate Your Business</h2>
            <p className="text-lg text-white/90 mb-8">
              Our platform provides everything you need to streamline operations, improve collaboration, and drive growth.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8">
              Get Started
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Key Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to take your business to the next level
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <FeatureCard
              title="Powerful and Intuitive Dashboard"
              description="Monitor your business performance with our easy-to-use dashboard. Get real-time insights and make data-driven decisions."
              image="https://images.unsplash.com/photo-1531297484001-80022131f5a1"
              imagePosition="background"
              fullWidth={true}
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold mb-4">Why Choose Our Platform?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Easy to Use</h3>
                  <p className="text-muted-foreground">Our intuitive interface makes it simple to get started</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Flexible Integrations</h3>
                  <p className="text-muted-foreground">Connect with your favorite tools seamlessly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">24/7 Support</h3>
                  <p className="text-muted-foreground">Our team is always available to help you succeed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-primary/5 p-12 rounded-xl">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Join thousands of businesses that trust our platform to drive growth and efficiency.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm">
            Start Free Trial
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">YourSaaS</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Helping businesses grow since 2023. Our platform provides the tools you need to succeed.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
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
          <p>© {new Date().getFullYear()} YourSaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
