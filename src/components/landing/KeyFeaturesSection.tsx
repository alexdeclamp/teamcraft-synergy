
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Brain, MessageSquare, Search, FolderSearch, Users, Sparkles } from 'lucide-react';
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
        {/* Feature Info + Mockup */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Feature Info */}
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
          
          {/* Feature Mockup */}
          <div className="relative rounded-xl overflow-hidden shadow-xl bg-background/50 p-4 border">
            {activeFeature.mockup}
          </div>
        </div>
        
        {/* Feature Indicators */}
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
