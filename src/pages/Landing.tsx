import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check, Upload, Brain, MessageSquare, UserPlus, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FeatureCard from '@/components/landing/FeatureCard';
import TestimonialCard from '@/components/landing/TestimonialCard';
import UseCaseGallery from '@/components/landing/UseCaseGallery';
import { Progress } from '@/components/ui/progress';

const Landing = () => {
  const navigate = useNavigate();
  
  const timelineSteps = [{
    icon: <Upload className="h-10 w-10 text-white" />,
    title: "Upload Your Knowledge",
    description: "Add notes, PDFs, images, and more to build your knowledge base.",
    color: "bg-primary",
    progress: 25
  }, {
    icon: <Brain className="h-10 w-10 text-white" />,
    title: "Generate Notes",
    description: "AI automatically organizes and summarizes your content.",
    color: "bg-blue-500",
    progress: 50
  }, {
    icon: <UserPlus className="h-10 w-10 text-white" />,
    title: "Invite People",
    description: "Share your Brain with team members and collaborators.",
    color: "bg-purple-500",
    progress: 75
  }, {
    icon: <MessageSquare className="h-10 w-10 text-white" />,
    title: "Chat With Your Project",
    description: "Ask questions and get instant answers from your knowledge base.",
    color: "bg-indigo-500",
    progress: 100
  }];

  const howItWorks = [{
    icon: <Upload className="h-10 w-10 text-primary" />,
    title: "1️⃣ Upload Your Knowledge",
    description: "📂 Add notes, PDFs, images, and updates into your Brain.",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
    imagePosition: "right" as const
  }, {
    icon: <Brain className="h-10 w-10 text-primary" />,
    title: "2️⃣ AI Summarizes for You",
    description: "🧠 Bra3n instantly organizes and summarizes your content.",
    imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
    imagePosition: "left" as const
  }, {
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: "3️⃣ Ask Anything, Get Answers",
    description: "💬 Use our AI-powered chat to retrieve insights instantly. 👉 No more digging through messy docs – just ask and get what you need!",
    imageUrl: "https://images.unsplash.com/photo-1565616424931-f04411bde104",
    imagePosition: "right" as const
  }];

  const audiences = [{
    name: "Consultants & Analysts",
    description: "Keep research organized."
  }, {
    name: "Product Teams",
    description: "Centralize insights & findings."
  }, {
    name: "Startups & Creators",
    description: "Manage ideas & notes easily."
  }, {
    name: "Anyone who hates losing information",
    description: "Find what you need when you need it."
  }];

  const testimonials = [{
    name: "John D.",
    role: "Product Manager",
    content: "Bra3n changed how my team works! Finding past notes is now instant.",
    avatar: "JD"
  }, {
    name: "Marie L.",
    role: "Consultant",
    content: "It's like having an AI assistant that actually knows my work.",
    avatar: "ML"
  }];

  return <div className="min-h-screen bg-background overflow-hidden">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        
        {/* Hero Text - Centered */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Knowledge Hub
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
            Bra<span className="text-primary">3</span>n
          </h1>
          <p className="text-2xl sm:text-3xl font-medium text-foreground mb-4">Stop Searching. Start Knowing. Take actions.</p>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Bra3n organizes your notes, PDFs, and documents into an AI-powered knowledge hub, where you can retrieve insights instantly.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="rounded-full px-8 text-base shadow-sm">
            Try Bra3n for Free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {/* Platform Interface Representation */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-5xl">
            <div className="apple-glass rounded-xl shadow-xl overflow-hidden">
              {/* Platform Interface Mockup */}
              <div className="bg-background p-4 rounded-t-lg border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="w-64 h-6 bg-muted rounded-full"></div>
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Platform Content */}
              <div className="grid grid-cols-12 gap-4 p-6 bg-background/80">
                {/* Sidebar */}
                <div className="col-span-3 bg-muted/50 rounded-lg p-4 h-[400px]">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="font-medium">Bra3n</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-8 rounded-md bg-primary/10 flex items-center px-3">
                      <span className="text-sm font-medium">Dashboard</span>
                    </div>
                    {['Projects', 'Documents', 'Images', 'Settings'].map((item, i) => (
                      <div key={i} className="h-8 rounded-md bg-muted/70 flex items-center px-3">
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-xs font-medium mb-2 text-muted-foreground">RECENT PROJECTS</div>
                    {['Marketing Strategy', 'Product Research', 'Client Presentations'].map((project, i) => (
                      <div key={i} className="h-8 flex items-center text-sm text-muted-foreground">
                        {project}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="col-span-9 space-y-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {['Documents', 'Images', 'Notes'].map((stat, i) => (
                      <div key={i} className="bg-background rounded-lg p-3 border border-border/30">
                        <div className="text-sm text-muted-foreground">{stat}</div>
                        <div className="text-2xl font-semibold">{Math.floor(Math.random() * 50) + 10}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Search and Chat */}
                  <div className="bg-background border border-border/30 rounded-lg p-4">
                    <div className="flex items-center bg-muted/50 rounded-full pl-4 pr-2 py-2 mb-4">
                      <input type="text" placeholder="Ask anything about your projects..." className="bg-transparent border-none flex-1 text-sm focus:outline-none" />
                      <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div className="ml-3 bg-muted/30 py-2 px-3 rounded-lg rounded-tl-none">
                          <p className="text-sm">Here's a summary of your latest project updates:</p>
                          <p className="text-sm mt-2">- 3 new documents added to Marketing Strategy</p>
                          <p className="text-sm">- Product Research updated yesterday</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-end">
                        <div className="mr-3 bg-primary/10 py-2 px-3 rounded-lg rounded-tr-none">
                          <p className="text-sm">Show me the key insights from the Product Research project</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-foreground/10 flex-shrink-0 flex items-center justify-center">
                          <div className="text-sm font-medium">U</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {['Marketing Strategy', 'Product Research'].map((project, i) => (
                      <div key={i} className="bg-background border border-border/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-medium">{project}</div>
                          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Active</div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{width: `${Math.floor(Math.random() * 60) + 30}%`}}></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Updated 2 days ago</span>
                            <span>{Math.floor(Math.random() * 5) + 3} contributors</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 -z-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-6 -left-6 -z-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">🔍 How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to transform how you manage information
          </p>
        </div>
        
        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto mb-16">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-muted"></div>
          
          {/* Timeline Steps */}
          <div className="space-y-24">
            {timelineSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Timeline Connector */}
                {index < timelineSteps.length - 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-24 w-1 bg-gradient-to-b from-muted to-transparent top-20"></div>
                )}
                
                {/* Timeline Content */}
                <div className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Step Content */}
                  <div className={`md:w-1/2 px-6 text-center md:text-${index % 2 === 0 ? 'left' : 'right'} mb-8 md:mb-0`}>
                    <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {/* Step Icon and Circle */}
                  <div className="flex items-center justify-center">
                    <div className={`relative z-10 w-20 h-20 rounded-full ${step.color} shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110`}>
                      {step.icon}
                      <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* Empty Space for Alignment */}
                  <div className="md:w-1/2 px-6"></div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6 max-w-md mx-auto px-4 hidden sm:block">
                  <Progress value={step.progress} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mb-12">
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            size="lg"
            className="rounded-full px-8 shadow-sm hover:bg-primary hover:text-white transition-colors"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Use Case Gallery Section */}
      <UseCaseGallery />

      {/* Why Choose Bra3n Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <img src="/placeholder.svg" alt="Bra3n Benefits" className="rounded-xl shadow-lg w-full" width={500} height={400} />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl sm:text-4xl font-semibold">🎯 Why Choose Bra3n?</h2>
            <div className="space-y-4">
              {["AI-Powered Search – Retrieve any info in seconds.", "Smart Summaries – No more reading endless PDFs.", "Team Collaboration – Share & work together seamlessly.", "Secure & Private – Your data stays yours."].map((benefit, i) => <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 rounded-full p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>{benefit}</p>
                </div>)}
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
          {audiences.map((audience, index) => <Card key={index} className="transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 space-y-2">
                <div className="p-3 bg-primary/10 inline-flex rounded-lg">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{audience.name}</h3>
                <p className="text-muted-foreground">{audience.description}</p>
              </CardContent>
            </Card>)}
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
          {testimonials.map((testimonial, index) => <TestimonialCard key={index} name={testimonial.name} role={testimonial.role} content={testimonial.content} avatarText={testimonial.avatar} />)}
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
    </div>;
};

export default Landing;
