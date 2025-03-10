import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Brain, MessageSquare, Search, FolderSearch, Users, Sparkles, Database, ShieldCheck, LayoutDashboard, WandSparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    id: 1,
    title: "AI-Powered Chat",
    description: "Chat with your documents and get instant answers based on your project content.",
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3 bg-muted/30 py-2 px-3 rounded-lg rounded-tl-none">
                <p className="text-sm">How do our customer satisfaction metrics compare to last quarter?</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3 bg-muted/30 py-2 px-3 rounded-lg rounded-tl-none">
                <p className="text-sm">Based on the Q2 report in your project, customer satisfaction has increased by 18% compared to Q1. The NPS score rose from 42 to 49.</p>
              </div>
            </div>
            
            <div className="flex items-start justify-end">
              <div className="mr-3 bg-primary/10 py-2 px-3 rounded-lg rounded-tr-none">
                <p className="text-sm">What were the main factors for this improvement?</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex-shrink-0 flex items-center justify-center">
                <div className="text-sm font-medium">U</div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t mt-3">
            <div className="flex items-center bg-muted/50 rounded-full pl-4 pr-2 py-2">
              <input type="text" placeholder="Ask about your project data..." className="bg-transparent border-none flex-1 text-sm focus:outline-none" />
              <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Smart Document Search",
    description: "Find exactly what you need within seconds, even in large document collections.",
    icon: <Search className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="mb-4">
          <div className="flex items-center bg-muted/50 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input type="text" value="marketing strategy ROI" className="bg-transparent border-none flex-1 text-sm focus:outline-none" />
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { title: "Q2 Marketing Strategy.pdf", match: "ROI increased by 24% YoY...", date: "Yesterday" },
            { title: "Campaign Performance.xlsx", match: "Social media ROI metrics show...", date: "3 days ago" },
            { title: "Budget Planning 2023.pdf", match: "Marketing ROI projections for...", date: "Last week" },
          ].map((result, i) => (
            <div key={i} className="border-b pb-2 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderSearch className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium text-sm">{result.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{result.date}</span>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">...{result.match}...</p>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
      </div>
    )
  },
  {
    id: 3,
    title: "Team Collaboration",
    description: "Work together seamlessly with your team on research, documents, and insights.",
    icon: <Users className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Product Launch Project</h3>
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((initial, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-background ${
                ["bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"][i]
              }`}>
                {initial}
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="border rounded-md p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-medium mr-2">A</div>
                <span className="text-sm font-medium">Alex</span>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <p className="text-sm">I've uploaded the latest market research report. @Beth can you review section 3?</p>
          </div>
          
          <div className="border rounded-md p-2 ml-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-xs font-medium mr-2">B</div>
                <span className="text-sm font-medium">Beth</span>
              </div>
              <span className="text-xs text-muted-foreground">2m ago</span>
            </div>
            <p className="text-sm">Will do! I'll have feedback by EOD.</p>
          </div>
        </div>
        
        <div className="pt-3 border-t">
          <div className="flex items-center">
            <input type="text" placeholder="Add a comment..." className="bg-muted/30 rounded-md border-none flex-1 text-sm p-2 focus:outline-none" />
            <Button size="sm" className="ml-2">Send</Button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "AI Insights Generation",
    description: "Extract key insights and summaries from your documents automatically.",
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">Document Insights</h3>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs">Regenerate</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Key Takeaways</h4>
            <ul className="space-y-1">
              {[
                "Market share increased by 12% in Q2",
                "Customer acquisition cost reduced by 18%",
                "New product line projected to generate $2.4M in first year"
              ].map((point, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-0.5 text-primary mt-0.5">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <p className="text-xs text-muted-foreground">
              The Q2 performance report indicates strong growth across all business units, with the 
              Eastern region outperforming forecasts by 24%. New customer retention rates have improved 
              following the implementation of the enhanced onboarding process. The board has approved 
              further expansion into European markets starting Q3.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
            <ul className="space-y-1">
              {[
                "Schedule team review of European market entry strategy",
                "Allocate additional resources to Eastern region sales team",
                "Prepare Q3 forecast adjustment based on new projections"
              ].map((action, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <div className="rounded-full bg-blue-500/10 p-0.5 text-blue-500 mt-0.5">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Secure Knowledge Base",
    description: "Store all your project data in a secure, centralized knowledge repository.",
    icon: <Database className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="mb-4">
          <h4 className="text-sm font-medium">Project Knowledge Repository</h4>
          <div className="flex items-center mt-1">
            <div className="bg-primary/10 text-primary p-1 rounded">
              <Database className="h-4 w-4" />
            </div>
            <span className="text-xs ml-2">124 documents · 36 notes · 58 images</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { title: "Marketing Strategy", type: "Collection", items: 12, updated: "2 days ago" },
            { title: "Product Research", type: "Collection", items: 24, updated: "Yesterday" },
            { title: "Customer Feedback", type: "Collection", items: 18, updated: "Just now" },
          ].map((collection, i) => (
            <div key={i} className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{collection.title}</span>
                <span className="text-xs text-muted-foreground">{collection.updated}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{collection.type}</span>
                <span className="mx-2">•</span>
                <span>{collection.items} items</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-4 right-4">
          <Button size="sm" variant="outline" className="text-xs">Browse Repository</Button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
      </div>
    )
  },
  {
    id: 6,
    title: "Enterprise Security",
    description: "End-to-end encryption and compliance controls keep your sensitive data protected.",
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h4 className="text-sm font-medium">Security Dashboard</h4>
            <p className="text-xs text-muted-foreground mt-1">Project data is protected with enterprise-grade security</p>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-green-500/20 p-1 rounded text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm ml-2">End-to-End Encryption</span>
                </div>
                <span className="text-xs bg-green-500/10 text-green-600 py-0.5 px-2 rounded-full">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">All data is encrypted at rest and in transit</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-green-500/20 p-1 rounded text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm ml-2">Access Controls</span>
                </div>
                <span className="text-xs bg-green-500/10 text-green-600 py-0.5 px-2 rounded-full">Configured</span>
              </div>
              <p className="text-xs text-muted-foreground">Role-based permissions and access limitations</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-green-500/20 p-1 rounded text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm ml-2">Compliance</span>
                </div>
                <span className="text-xs bg-green-500/10 text-green-600 py-0.5 px-2 rounded-full">GDPR, HIPAA</span>
              </div>
              <p className="text-xs text-muted-foreground">Meets regulatory requirements for data handling</p>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-xs text-muted-foreground">Last security audit: 3 days ago</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "Analytics Dashboard",
    description: "Track usage, engagement, and insights with comprehensive analytics and visualizations.",
    icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h4 className="text-sm font-medium">Analytics Overview</h4>
            <div className="flex items-center mt-1">
              <span className="text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full">Last 30 days</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "Projects Created", value: "32", change: "+12%" },
              { label: "AI Queries", value: "248", change: "+18%" },
              { label: "Documents Uploaded", value: "156", change: "+24%" },
              { label: "Team Activity", value: "86%", change: "+5%" }
            ].map((stat, i) => (
              <div key={i} className="bg-muted/30 p-2 rounded-lg">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-medium">{stat.value}</span>
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex-1 relative">
            <div className="h-24 w-full">
              <div className="relative h-full">
                <div className="absolute bottom-0 left-0 w-6 h-12 bg-primary/80 rounded-t"></div>
                <div className="absolute bottom-0 left-8 w-6 h-16 bg-primary/80 rounded-t"></div>
                <div className="absolute bottom-0 left-16 w-6 h-10 bg-primary/80 rounded-t"></div>
                <div className="absolute bottom-0 left-24 w-6 h-18 bg-primary/80 rounded-t"></div>
                <div className="absolute bottom-0 left-32 w-6 h-14 bg-primary/80 rounded-t"></div>
                <div className="absolute bottom-0 left-40 w-6 h-20 bg-primary/80 rounded-t"></div>
                <div className="absolute bottom-0 left-48 w-6 h-16 bg-primary/80 rounded-t"></div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "Workflow Automation",
    description: "Automate repetitive tasks and streamline your document processing workflows.",
    icon: <WandSparkles className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h4 className="text-sm font-medium">Workflow Editor</h4>
            <p className="text-xs text-muted-foreground mt-1">Drag and drop to build automated workflows</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-full">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 w-32 text-center">
                <span className="text-xs font-medium">New Document</span>
              </div>
              
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 h-8 w-0.5 bg-muted-foreground"></div>
              
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 w-40 text-center">
                <span className="text-xs font-medium">Extract Key Topics</span>
              </div>
              
              <div className="absolute top-32 left-1/2 transform -translate-x-1/2 h-8 w-0.5 bg-muted-foreground"></div>
              
              <div className="absolute top-40 left-1/2 transform -translate-x-1/2 flex space-x-16">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 w-32 text-center">
                  <span className="text-xs font-medium">Create Summary</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 w-32 text-center">
                  <span className="text-xs font-medium">Tag Document</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button size="sm" variant="outline" className="text-xs">Save Workflow</Button>
            <Button size="sm" className="text-xs">Test Run</Button>
          </div>
        </div>
      </div>
    )
  }
];

const KeyFeaturesSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextSlide = () => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };
  
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };
  
  const activeFeature = features[activeIndex];
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-accent/10 rounded-lg">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Bra3n offers a comprehensive set of tools to transform how you manage and interact with your knowledge
        </p>
      </div>
      
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex p-2 rounded-full bg-primary/10">
              {activeFeature.icon}
            </div>
            
            <h3 className="text-2xl font-semibold">{activeFeature.title}</h3>
            <p className="text-muted-foreground">{activeFeature.description}</p>
            
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                aria-label="Previous feature"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                aria-label="Next feature"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-xl bg-background/50 p-4 border">
            {activeFeature.mockup}
          </div>
        </div>
        
        <div className="flex justify-center space-x-2 mt-8">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === activeIndex ? "bg-primary" : "bg-primary/20"
              )}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;
