
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Brain, MessageSquare, FileImage, FileText, ChevronDown, Zap, File } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return <section className="relative pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      {/* Hero Text - Centered */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4 mr-2" />
          AI-Powered Knowledge Hub
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-4">
          Bra<span className="text-primary">3</span>n
        </h1>
        <p className="text-2xl sm:text-3xl font-medium text-foreground mb-4">Your AI Project Assistant.</p>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8">Turn any documents into actionable insights instantly with AI-powered summaries and search.</p>
        <Button onClick={() => navigate('/auth?tab=register')} size="lg" className="rounded-full px-8 text-base shadow-sm">
          Try Bra3n
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      {/* File Transformation Visual */}
      <div className="flex justify-center mb-10">
        <div className="relative max-w-4xl w-full">
          {/* Files being dropped section */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {/* PDF File */}
            <div className="animate-bounce-slow delay-100 bg-background rounded-lg p-4 shadow-md border border-border/30 flex items-center gap-2">
              <File className="h-8 w-8 text-red-500" />
              <span className="font-medium">Report.pdf</span>
            </div>
            
            {/* Image File */}
            <div className="animate-bounce-slow delay-300 bg-background rounded-lg p-4 shadow-md border border-border/30 flex items-center gap-2">
              <FileImage className="h-8 w-8 text-blue-500" />
              <span className="font-medium">Diagram.png</span>
            </div>
            
            {/* Text File */}
            <div className="animate-bounce-slow delay-500 bg-background rounded-lg p-4 shadow-md border border-border/30 flex items-center gap-2">
              <FileText className="h-8 w-8 text-green-500" />
              <span className="font-medium">Notes.txt</span>
            </div>
          </div>
          
          {/* Arrow down */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-2">
              <ChevronDown className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          
          {/* Transformation process */}
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-primary/20 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <Brain className="h-10 w-10 text-primary mr-2" />
              <div className="h-2 bg-primary/20 rounded-full w-24 animate-pulse"></div>
              <div className="h-2 bg-primary/30 rounded-full w-32 ml-2 animate-pulse delay-100"></div>
              <div className="h-2 bg-primary/20 rounded-full w-20 ml-2 animate-pulse delay-200"></div>
              <Zap className="h-6 w-6 text-primary ml-2 animate-pulse" />
            </div>
            <div className="h-2 bg-primary/10 rounded-full w-full animate-pulse"></div>
            <div className="h-2 bg-primary/10 rounded-full w-5/6 mx-auto mt-2 animate-pulse delay-100"></div>
            <div className="h-2 bg-primary/10 rounded-full w-4/6 mx-auto mt-2 animate-pulse delay-200"></div>
          </div>
          
          {/* Resulting notes */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-background rounded-lg p-4 shadow-md border border-border/30 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Summary</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-muted rounded-full w-full"></div>
                <div className="h-2 bg-muted rounded-full w-5/6"></div>
                <div className="h-2 bg-muted rounded-full w-4/6"></div>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="bg-primary/10 rounded-full px-2 py-1 text-xs text-primary font-medium">Key Insights</div>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-4 shadow-md border border-border/30 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">Notes Analysis</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-muted rounded-full w-full"></div>
                <div className="h-2 bg-muted rounded-full w-5/6"></div>
                <div className="h-2 bg-muted rounded-full w-4/6"></div>
              </div>
              <div className="mt-3 flex justify-end">
                <div className="bg-primary/10 rounded-full px-2 py-1 text-xs text-primary font-medium">Action Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Platform Interface Representation - Responsive */}
      {isMobile ?
        <div className="space-y-4 mb-16">
          <div className="bg-background rounded-xl shadow-md p-4 border border-border/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Ask Anything</div>
                <div className="text-sm text-muted-foreground">Get instant answers from your data</div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center bg-background rounded-full pl-4 pr-2 py-2 mb-2">
                <input type="text" placeholder="Ask a question..." className="bg-transparent border-none flex-1 text-sm focus:outline-none" readOnly />
                <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-2 bg-background p-3 rounded-lg text-sm">
                <p className="font-medium text-primary">Bra3n AI</p>
                <p>I found these key insights in your documents...</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl shadow-md p-4 border border-border/30">
              <div className="text-sm font-medium mb-2">Documents</div>
              <div className="text-xl font-semibold">36</div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary" style={{
              width: "65%"
            }}></div>
              </div>
            </div>
            <div className="bg-background rounded-xl shadow-md p-4 border border-border/30">
              <div className="text-sm font-medium mb-2">Projects</div>
              <div className="text-xl font-semibold">8</div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent-foreground" style={{
              width: "40%"
            }}></div>
              </div>
            </div>
          </div>
        </div> :
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
                    {['Projects', 'Documents', 'Images', 'Settings'].map((item, i) => <div key={i} className="h-8 rounded-md bg-muted/70 flex items-center px-3">
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>)}
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-xs font-medium mb-2 text-muted-foreground">RECENT PROJECTS</div>
                    {['Marketing Strategy', 'Product Research', 'Client Presentations'].map((project, i) => <div key={i} className="h-8 flex items-center text-sm text-muted-foreground">
                        {project}
                      </div>)}
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="col-span-9 space-y-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {['Documents', 'Images', 'Notes'].map((stat, i) => <div key={i} className="bg-background rounded-lg p-3 border border-border/30">
                        <div className="text-sm text-muted-foreground">{stat}</div>
                        <div className="text-2xl font-semibold">{Math.floor(Math.random() * 50) + 10}</div>
                      </div>)}
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
                    {['Marketing Strategy', 'Product Research'].map((project, i) => <div key={i} className="bg-background border border-border/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-medium">{project}</div>
                          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Active</div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{
                        width: `${Math.floor(Math.random() * 60) + 30}%`
                      }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Updated 2 days ago</span>
                            <span>{Math.floor(Math.random() * 5) + 3} contributors</span>
                          </div>
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 -z-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-6 -left-6 -z-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>
          </div>
        </div>}
    </section>;
};
export default HeroSection;
