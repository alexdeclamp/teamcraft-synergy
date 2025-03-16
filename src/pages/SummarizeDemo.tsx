import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, PaperclipIcon, Code, Sparkles, Edit, Share } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import SummaryResult from '@/components/summarize-demo/SummaryResult';
import FourStepsSection from '@/components/summarize-demo/FourStepsSection';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/navbar/Logo';

const SummarizeDemo = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [text, setText] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSummarize = () => {
    if (!session) {
      setShowAuthDialog(true);
      return;
    }

    if (text.trim().length < 50) {
      toast.error('Please enter at least 50 characters to generate a meaningful summary');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const demoSummary = `# Summary of Document

## Key Points
• The document discusses advanced knowledge management techniques
• It highlights the importance of AI in document processing
• Several case studies demonstrate successful implementation

## Recommendations
• Implement a centralized knowledge repository
• Use AI tools for automatic document classification
• Regularly update and maintain the knowledge base`;
      
      setSummary(demoSummary);
      setIsGenerating(false);
      toast.success('Summary generated successfully!');
    }, 2000);
  };

  const handleSignIn = () => {
    navigate('/auth?tab=login');
  };

  const handleSignUp = () => {
    navigate('/auth?tab=register');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/30 py-4 px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  href="#features"
                >
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  href="#pricing"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  href="#about"
                >
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button onClick={handleSignUp}>Sign Up</Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl mx-auto mb-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Summarize any document in seconds</h1>
            <p className="text-xl text-muted-foreground">
              Bra3n is a next-gen collaborative knowledge management system
            </p>
          </div>

          <div className="bg-muted/20 rounded-xl border border-border/30 shadow-sm overflow-hidden mb-8">
            <Textarea
              placeholder="Ask Bra3n to summarize any text or document..."
              value={text}
              onChange={handleTextChange}
              className="min-h-[120px] border-0 bg-transparent focus-visible:ring-0 resize-none p-4 text-base"
            />
            
            <div className="flex items-center justify-between p-3 border-t border-border/30 bg-background/50">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <PaperclipIcon className="h-4 w-4 mr-1" />
                  Attach
                </Button>
              </div>
              
              <Button onClick={handleSummarize} className="gap-1.5">
                <Brain className="h-4 w-4" />
                Summarize
              </Button>
            </div>
          </div>

          <SummaryResult summary={summary} isGenerating={isGenerating} />
        </div>

        <Separator className="max-w-3xl w-full my-16 opacity-50" />

        <FourStepsSection />
        
        <Separator className="max-w-3xl w-full my-16 opacity-50" />
        
        <div className="w-full max-w-5xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover how Bra3n transforms your workflow with these key capabilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-primary/5 border border-primary/20 shadow-lg overflow-hidden feature-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 feature-icon-container">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Code Generation</h3>
                </div>
                <p className="text-muted-foreground">
                  Generate high-quality, production-ready code in seconds with advanced AI technology.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border border-primary/20 shadow-lg overflow-hidden feature-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 feature-icon-container">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Responsive Design</h3>
                </div>
                <p className="text-muted-foreground">
                  Automatically create beautiful, responsive interfaces that work across all devices.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border border-primary/20 shadow-lg overflow-hidden feature-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 feature-icon-container">
                    <Edit className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Natural Language Editing</h3>
                </div>
                <p className="text-muted-foreground">
                  Request changes and updates using simple, conversational language - no coding required.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border border-primary/20 shadow-lg overflow-hidden feature-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 feature-icon-container">
                    <Share className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Export & Integration</h3>
                </div>
                <p className="text-muted-foreground">
                  Easily export your projects or integrate with existing codebases and development workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator className="max-w-3xl w-full my-16 opacity-50" />
        
        <div className="w-full max-w-5xl mx-auto mb-20 bg-[#111111]/95 py-16 px-8 rounded-xl dark-bg-section">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Build high quality software<br />without writing code.
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Creating software has never been more accessible. With Bra3n, simply describe
              your idea in your own words, and watch it transform into a fully functional application
              with beautiful aesthetics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mt-20">
            <div className="space-y-8">
              <div className="mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">20× faster than coding.</h3>
                <div className="w-16 h-0.5 bg-primary mb-6 accent-divider"></div>
                <p className="text-gray-300">
                  Use your native language to describe your idea, then watch
                  Bra3n do the rest. Creating for the web is faster and easier than
                  ever before.
                </p>
              </div>
              
              <div className="mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Prompt to edit.</h3>
                <div className="w-16 h-0.5 bg-primary mb-6 accent-divider"></div>
                <p className="text-gray-300">
                  Forget about the overhead of frontend engineers or freelancers to
                  maintain your website. Ask in text to change anything.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">You own the code.</h3>
                <div className="w-16 h-0.5 bg-primary mb-6 accent-divider"></div>
                <p className="text-gray-300">
                  Everything that Bra3n builds is yours. Sync your codebase to
                  Github and edit in any code editor, export or publish your app
                  instantly with one click.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/8d69913a-49e9-46f0-bea0-efdc9a28fc72.png" 
                  alt="AI editing interface" 
                  className="w-full h-auto rounded-xl border border-gray-700/50"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              onClick={() => navigate('/waitlist')} 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg h-auto"
            >
              Join the Waitlist
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be signed in to use the summarization feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSignUp}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SummarizeDemo;
