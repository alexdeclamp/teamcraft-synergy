
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check, Upload, Brain, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeatureCard from '@/components/landing/FeatureCard';
import TestimonialCard from '@/components/landing/TestimonialCard';

const Landing = () => {
  const navigate = useNavigate();

  const howItWorks = [
    {
      icon: <Upload className="h-10 w-10 text-primary" />,
      title: "1️⃣ Upload Your Knowledge",
      description: "📂 Add notes, PDFs, images, and updates into your Brain.",
      imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
      imagePosition: "right" as const
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "2️⃣ AI Summarizes for You",
      description: "🧠 Bra3n instantly organizes and summarizes your content.",
      imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
      imagePosition: "left" as const
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "3️⃣ Ask Anything, Get Answers",
      description: "💬 Use our AI-powered chat to retrieve insights instantly. 👉 No more digging through messy docs – just ask and get what you need!",
      imageUrl: "https://images.unsplash.com/photo-1565616424931-f04411bde104",
      imagePosition: "right" as const
    }
  ];

  const audiences = [
    {
      name: "Consultants & Analysts",
      description: "Keep research organized."
    },
    {
      name: "Product Teams",
      description: "Centralize insights & findings."
    },
    {
      name: "Startups & Creators",
      description: "Manage ideas & notes easily."
    },
    {
      name: "Anyone who hates losing information",
      description: "Find what you need when you need it."
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
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        
        {/* Hero Image */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-4xl">
            <div className="apple-glass rounded-xl shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" 
                alt="Bra3n Platform Preview" 
                className="w-full h-auto rounded-lg"
                width={1200}
                height={675}
              />
              <div className="absolute inset-0 bg-primary/10 rounded-xl"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 -z-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-6 -left-6 -z-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        {/* Hero Text - Centered */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Knowledge Hub
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
            Bra<span className="text-primary">3</span>n
          </h1>
          <p className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
            Stop Searching. Start Knowing.
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Bra3n organizes your notes, PDFs, and documents into an AI-powered knowledge hub, where you can retrieve insights instantly.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm">
            Try Bra3n for Free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">🔍 How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to transform how you manage information
          </p>
        </div>
        
        <div className="space-y-16">
          {howItWorks.map((feature, index) => (
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

      {/* Why Choose Bra3n Section */}
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
            <h2 className="text-3xl sm:text-4xl font-semibold">🎯 Why Choose Bra3n?</h2>
            <div className="space-y-4">
              {[
                "AI-Powered Search – Retrieve any info in seconds.",
                "Smart Summaries – No more reading endless PDFs.",
                "Team Collaboration – Share & work together seamlessly.",
                "Secure & Private – Your data stays yours."
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 rounded-full p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-lg font-medium">🔹 "Like Notion, but with an AI brain."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who is Bra3n for Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">👀 Who is Bra3n for?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Perfect for teams and individuals who value their time and information
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <Card key={index} className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 space-y-2">
                <div className="p-3 bg-primary/10 inline-flex rounded-lg">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{audience.name}</h3>
                <p className="text-muted-foreground">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">📢 What Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don't take our word for it - hear from our users
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
            <h2 className="text-3xl sm:text-4xl font-semibold">🚀 Ready to Try?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              💡 Start organizing your knowledge with AI today.
            </p>
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm w-full sm:w-auto">
                Try for Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground">No credit card required.</p>
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
              AI-powered knowledge hub for your projects. Organize, search, and retrieve insights instantly.
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
