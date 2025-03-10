
import React, { useState } from 'react';
import { FileText, Brain, MessageSquare, Users, Search, BarChart, PenLine, Building, BookOpen, Folder } from 'lucide-react';
import { cn } from "@/lib/utils";

// Category type
type UseCaseCategory = 'Featured' | 'Research' | 'Education' | 'Business' | 'Content' | 'Knowledge';

// Use case type
interface UseCase {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  categories: UseCaseCategory[];
}

const UseCaseGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UseCaseCategory>('Featured');
  
  // Define use cases
  const useCases: UseCase[] = [
    {
      id: 1,
      title: "Research Literature Review",
      description: "Bra3n assists researchers by organizing academic papers, extracting key findings, and generating comprehensive literature reviews with citation management.",
      icon: <FileText className="h-6 w-6 text-white" />,
      image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
      categories: ['Featured', 'Research']
    },
    {
      id: 2,
      title: "AI-Enhanced Market Analysis",
      description: "Bra3n analyzes market reports, news articles, and company data to deliver in-depth financial insights with customizable dashboards showing market trends.",
      icon: <BarChart className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
      categories: ['Business', 'Research']
    },
    {
      id: 3,
      title: "Interactive Learning Materials",
      description: "Bra3n transforms course content into engaging learning materials, automatically organizing lecture notes, creating summaries, and generating practice questions.",
      icon: <BookOpen className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      categories: ['Featured', 'Education']
    },
    {
      id: 4,
      title: "Client Profile Management",
      description: "Consolidate client information, meeting notes, and deliverables in one place. Bra3n generates relationship insights and suggests personalized follow-up actions.",
      icon: <Users className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      categories: ['Business']
    },
    {
      id: 5,
      title: "Document Knowledge Base",
      description: "Bra3n intelligently organizes company documents, creating a searchable knowledge base that extracts insights from policies, manuals and guides for easy access.",
      icon: <Folder className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      categories: ['Featured', 'Knowledge']
    },
    {
      id: 6,
      title: "Content Strategy Planning",
      description: "Upload existing content and audience research. Bra3n analyzes patterns, identifies gaps, and recommends data-driven content opportunities with SEO insights.",
      icon: <PenLine className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      categories: ['Content']
    },
    {
      id: 7,
      title: "Competitor Research Dashboard",
      description: "Bra3n compiles competitor information from multiple sources, tracks positioning, and automatically alerts you about significant market changes.",
      icon: <Building className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      categories: ['Research', 'Business']
    },
    {
      id: 8,
      title: "Knowledge Assistant Chat",
      description: "Ask questions about your projects and get instant answers. Bra3n understands context across all your documents and generates accurate, sourced responses.",
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      categories: ['Featured', 'Knowledge']
    }
  ];

  // Categories for the filter
  const categories: UseCaseCategory[] = ['Featured', 'Research', 'Education', 'Business', 'Content', 'Knowledge'];
  
  // Filter use cases based on active category
  const filteredUseCases = useCases.filter(useCase => 
    useCase.categories.includes(activeCategory)
  );

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="use-cases">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4">Use case gallery</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Learn how Bra3n handles real-world information management through practical examples.
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === category 
                ? "bg-foreground text-background" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Use Cases Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredUseCases.map((useCase) => (
          <div key={useCase.id} className="bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary rounded-lg p-2 flex-shrink-0">
                  {useCase.icon}
                </div>
                <h3 className="text-lg font-semibold leading-tight">{useCase.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
            </div>
            <div className="h-48 border-t">
              <img 
                src={useCase.image} 
                alt={useCase.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Explore More Button */}
      <div className="flex justify-center mt-12">
        <button className="bg-foreground text-background px-6 py-3 rounded-full flex items-center gap-2 hover:bg-foreground/90 transition-colors">
          Explore more use cases
          <Search className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

export default UseCaseGallery;
