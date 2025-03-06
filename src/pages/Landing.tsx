
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Search, 
  FileText, 
  Users, 
  MessageSquare,
  PanelRight,
  Lightbulb
} from 'lucide-react';
import Logo from '@/components/navbar/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b backdrop-blur-sm bg-background/90 sticky top-0 z-10">
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
            Smart project management<br />
            <span className="text-primary">powered by AI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            Bra<span className="text-primary">3</span>n transforms scattered information into actionable knowledge. Say goodbye to information silos and hello to unified project intelligence.
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
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="gap-2">
                  Watch demo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Demo video would play here</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-3xl font-bold">90%</p>
              <p className="text-muted-foreground">Less time searching</p>
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
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1" 
              alt="Bra3n dashboard interface" 
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Key features section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">All your project intelligence in one place</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bra3n connects your team, docs, and ideas into a unified workspace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
                <p className="text-muted-foreground">
                  Find information across all your docs instantly. Our AI understands context and delivers relevant results.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Analysis</h3>
                <p className="text-muted-foreground">
                  Upload documents and our AI extracts key insights, making your information actionable.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Invite team members to projects and share knowledge seamlessly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-16 text-center">How Bra3n works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                  alt="User using Bra3n interface" 
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Upload Your Documents</h3>
                    <p className="text-muted-foreground">Share PDFs, images, notes, and any information relevant to your project.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                    <p className="text-muted-foreground">Our AI processes and indexes everything, making connections across all your content.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Instant Intelligence</h3>
                    <p className="text-muted-foreground">Ask questions, get summaries, and receive insights across all your project materials.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Collaborate & Learn</h3>
                    <p className="text-muted-foreground">Share insights with your team and keep building your knowledge base.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Real problems we solve</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Information Overload</h3>
                <p className="text-muted-foreground mb-4">Your team drowns in docs, files, and messages scattered across systems.</p>
                <div className="flex items-start gap-2 text-primary">
                  <Lightbulb className="h-5 w-5 mt-0.5" />
                  <p className="font-medium">Our AI instantly surfaces what's relevant when you need it.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Knowledge Silos</h3>
                <p className="text-muted-foreground mb-4">Critical information stays trapped with individuals, causing delays and duplicate work.</p>
                <div className="flex items-start gap-2 text-primary">
                  <Lightbulb className="h-5 w-5 mt-0.5" />
                  <p className="font-medium">Centralized, searchable knowledge base available to your entire team.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">No Time for Analysis</h3>
                <p className="text-muted-foreground mb-4">Teams spend too much time gathering info and not enough drawing insights.</p>
                <div className="flex items-start gap-2 text-primary">
                  <Lightbulb className="h-5 w-5 mt-0.5" />
                  <p className="font-medium">AI-generated summaries and insights help you make better decisions faster.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features in action */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-16 text-center">Features in action</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-semibold mb-4">AI-Powered Project Chat</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Ask questions in natural language and get instant answers based on your project's documents.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Get accurate answers from your project documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Save time searching through files</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Receive document references for every answer</span>
                </li>
              </ul>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="bg-card border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 pb-3 border-b mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Project Chat</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-medium mb-1">You</p>
                    <p>What's the timeline for the marketing campaign launch?</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="font-medium mb-1">Bra3n AI</p>
                    <p>Based on the marketing plan document uploaded on May 5th, the campaign launch is scheduled for June 15th, with initial social media posts starting on June 10th.</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Source: Marketing_Plan_2023.pdf, page 12
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-24">
            <div>
              <div className="bg-card border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 pb-3 border-b mb-4">
                  <PanelRight className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Document Analysis</h4>
                </div>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">Financial_Report_Q2.pdf</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <h5 className="font-medium mb-2">Key Findings:</h5>
                      <ul className="space-y-2 text-sm">
                        <li>• Revenue increased 23% compared to Q1</li>
                        <li>• New client acquisition up 15%</li>
                        <li>• Marketing costs decreased by 8%</li>
                        <li>• Projected Q3 growth of 18-22%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Automated Document Analysis</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Upload documents and get instant summaries and key insights without reading through everything.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Automatic extraction of key information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Image and PDF content analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Highlight critical findings and next steps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform how your team works?</h2>
          <p className="text-xl mb-8 text-primary-foreground/80">Join the hundreds of teams who are working smarter with Bra3n.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth?signup=true')}
              className="bg-white text-primary hover:bg-white/90"
            >
              Get started for free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-white text-white hover:bg-white/10"
            >
              View demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background px-6 py-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo />
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">Empowering teams with AI-enhanced knowledge management and project intelligence.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">Features</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Pricing</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Use Cases</Button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">About</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Blog</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Contact</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2023 Bra3n. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
              <Button variant="ghost" size="sm">Privacy</Button>
              <Button variant="ghost" size="sm">Terms</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
