
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, FileText, Image, Bell, Users, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    id: 1,
    title: "Summarize PDF Documents",
    description: "Extract key insights and summaries from your PDF documents with just a click.",
    icon: <FileText className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Q2 Financial Report.pdf</h4>
            </div>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">4 pages</span>
          </div>
          
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Document Summary</h4>
            <div className="space-y-3">
              <div className="bg-muted/30 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-1">Key Insights</h5>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-0.5 text-primary mt-0.5">
                      <Brain className="h-3 w-3" />
                    </div>
                    <span>Revenue increased by 18% compared to Q1</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-0.5 text-primary mt-0.5">
                      <Brain className="h-3 w-3" />
                    </div>
                    <span>Customer acquisition costs reduced by 12%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-0.5 text-primary mt-0.5">
                      <Brain className="h-3 w-3" />
                    </div>
                    <span>Eastern region outperformed projections by 24%</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-1">Executive Summary</h5>
                <p className="text-xs text-muted-foreground">
                  Q2 results show strong growth across all business units, with significant improvements 
                  in customer retention and operational efficiency. The board has approved expansion into 
                  European markets starting in Q3, backed by positive performance indicators.
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Get Insights from Screenshots",
    description: "Upload images and screenshots to extract valuable insights and information automatically.",
    icon: <Image className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Dashboard Screenshot.png</h4>
            </div>
            <Button size="sm" variant="outline" className="text-xs">View Original</Button>
          </div>
          
          <div className="flex-1 border-t pt-3 overflow-hidden">
            <h4 className="text-sm font-medium mb-2">Image Analysis</h4>
            <div className="space-y-3">
              <div className="bg-muted/30 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-1">Content Summary</h5>
                <p className="text-xs text-muted-foreground">
                  The image shows a marketing analytics dashboard with key performance metrics 
                  for Q2 2023. The main chart displays a 24% increase in conversion rates, with 
                  social media campaigns showing the highest ROI at 3.8x.
                </p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <h5 className="text-sm font-medium mb-1">Extracted Data</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background p-2 rounded">
                    <span className="text-muted-foreground">Conversion Rate:</span>
                    <div className="font-medium">24% ↑</div>
                  </div>
                  <div className="bg-background p-2 rounded">
                    <span className="text-muted-foreground">Social ROI:</span>
                    <div className="font-medium">3.8x</div>
                  </div>
                  <div className="bg-background p-2 rounded">
                    <span className="text-muted-foreground">Email CTR:</span>
                    <div className="font-medium">5.2%</div>
                  </div>
                  <div className="bg-background p-2 rounded">
                    <span className="text-muted-foreground">Active Users:</span>
                    <div className="font-medium">14.3k</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Send Project Updates",
    description: "Keep your team informed with quick updates and notes about project progress.",
    icon: <Bell className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h4 className="font-medium">Project Updates</h4>
            <p className="text-xs text-muted-foreground mt-1">Keep your team informed on latest progress</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <span className="text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full">Update</span>
              </div>
              <p className="text-sm">
                I've just completed the first draft of the marketing proposal. Could everyone review it by tomorrow?
              </p>
            </div>
            
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    AS
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alex Smith</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <span className="text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full">Update</span>
              </div>
              <p className="text-sm">
                Client meeting went well. They approved the initial concept and are excited to see the next phase.
              </p>
            </div>
            
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    MJ
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maria Johnson</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <span className="text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full">Update</span>
              </div>
              <p className="text-sm">
                Budget has been approved for Q3. We can now proceed with the additional resources we discussed.
              </p>
            </div>
          </div>
          
          <div className="pt-3 border-t mt-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Share a quick update..." 
                className="flex-1 bg-muted/30 border-none rounded-md text-sm px-3 py-2 focus:outline-none"
              />
              <Button size="sm">Post</Button>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Invite Team Members",
    description: "Collaborate with your team by inviting them to your projects with different permission levels.",
    icon: <Users className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h4 className="font-medium">Project Team</h4>
            <p className="text-xs text-muted-foreground mt-1">Manage project members and roles</p>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                    JD
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@example.com</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-500/10 text-blue-500 py-1 px-2 rounded-full">Admin</span>
              </div>
            </div>
            
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                    AS
                  </div>
                  <div>
                    <p className="font-medium">Alex Smith</p>
                    <p className="text-xs text-muted-foreground">alex@example.com</p>
                  </div>
                </div>
                <span className="text-xs bg-green-500/10 text-green-500 py-1 px-2 rounded-full">Editor</span>
              </div>
            </div>
            
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                    MJ
                  </div>
                  <div>
                    <p className="font-medium">Maria Johnson</p>
                    <p className="text-xs text-muted-foreground">maria@example.com</p>
                  </div>
                </div>
                <span className="text-xs bg-orange-500/10 text-orange-500 py-1 px-2 rounded-full">Viewer</span>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t mt-3">
            <Button className="w-full gap-2">
              <Users className="h-4 w-4" />
              Invite Team Member
            </Button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Chat with Your Documents",
    description: "Ask questions about your PDFs and get instant answers based on their content.",
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    mockup: (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-[300px] relative overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Annual Report 2023.pdf</h4>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3 bg-muted/30 py-2 px-3 rounded-lg rounded-tl-none">
                <p className="text-sm">What were the key performance indicators for 2023?</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3 bg-muted/30 py-2 px-3 rounded-lg rounded-tl-none">
                <p className="text-sm">Based on the Annual Report 2023, the key performance indicators were:
                <br />1. Revenue growth of 22% year-over-year
                <br />2. Customer retention rate of 94%
                <br />3. Operating margin improvement to 18.5%
                <br />4. Market share increase in all regions, with Asia showing highest growth at 27%</p>
              </div>
            </div>
            
            <div className="flex items-start justify-end">
              <div className="mr-3 bg-primary/10 py-2 px-3 rounded-lg rounded-tr-none">
                <p className="text-sm">How does this compare to our 2022 performance?</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex-shrink-0 flex items-center justify-center">
                <div className="text-sm font-medium">U</div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t mt-3">
            <div className="flex items-center bg-muted/50 rounded-full pl-4 pr-2 py-2">
              <input type="text" placeholder="Ask a question about this document..." className="bg-transparent border-none flex-1 text-sm focus:outline-none" />
              <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
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
