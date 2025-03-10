
import React, { useState } from 'react';
import { FileText, Brain, MessageSquare, Users, Search, BarChart, PenLine, Building, BookOpen, Folder, Briefcase, Scale, Stethoscope, Globe, Landmark, Shield, Gavel, Microscope, Glasses, School, DollarSign, Network, Lightbulb, CheckSquare, MoveRight, Layers, FileSpreadsheet, BookMarked, Calculator, BadgeCheck, Heart, Verified } from 'lucide-react';
import { cn } from "@/lib/utils";

// Category type - expanded to include more industries
type UseCaseCategory = 'Featured' | 'Research' | 'Education' | 'Business' | 'Content' | 'Knowledge' | 'Finance' | 'Legal' | 'Healthcare' | 'Government' | 'Technology' | 'Marketing';

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
  
  // Define use cases - expanded to 30+ cases across industries
  const useCases: UseCase[] = [
    // Original use cases
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
      categories: ['Content', 'Marketing']
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
    },
    
    // Finance Industry
    {
      id: 9,
      title: "Investment Portfolio Analysis",
      description: "Bra3n processes financial reports, analyzes market trends, and provides AI-powered insights for optimizing investment portfolios with real-time risk assessment.",
      icon: <DollarSign className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
      categories: ['Finance', 'Research']
    },
    {
      id: 10,
      title: "Financial Compliance Management",
      description: "Streamline regulatory compliance by organizing financial regulations, internal policies, and audit documents in one searchable knowledge hub with automated updates.",
      icon: <CheckSquare className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      categories: ['Finance', 'Legal']
    },
    {
      id: 11,
      title: "Banking Client Intelligence",
      description: "Consolidate client financial history, interactions, and preferences to generate insights for personalized banking recommendations and service improvements.",
      icon: <Landmark className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc",
      categories: ['Finance', 'Business']
    },
    {
      id: 12,
      title: "Financial Report Automation",
      description: "Bra3n analyzes financial data across multiple sources, automatically generating comprehensive reports with key insights, trends and actionable recommendations.",
      icon: <FileSpreadsheet className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
      categories: ['Finance']
    },

    // Legal Industry
    {
      id: 13,
      title: "Case Law Research Assistant",
      description: "Bra3n organizes case documents, extracts precedents, and helps legal teams quickly find relevant cases and statutes for ongoing litigation.",
      icon: <Gavel className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
      categories: ['Legal', 'Research']
    },
    {
      id: 14,
      title: "Contract Analysis Hub",
      description: "Upload contracts and legal agreements. Bra3n identifies key clauses, potential risks, and creates an organized repository with automated summaries and alerts.",
      icon: <FileText className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1607703703520-bb638e84caf2",
      categories: ['Legal', 'Business']
    },
    {
      id: 15,
      title: "Legal Knowledge Management",
      description: "Create a centralized repository of firm expertise, precedents, and legal research that automatically suggests relevant resources for current legal matters.",
      icon: <BookMarked className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1470175369463-7bb9f41e721a",
      categories: ['Legal', 'Knowledge']
    },
    {
      id: 16,
      title: "Regulatory Compliance Tracker",
      description: "Bra3n monitors regulatory changes, organizes compliance requirements, and helps legal teams ensure organizational policies remain aligned with current laws.",
      icon: <Scale className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e",
      categories: ['Legal', 'Business']
    },

    // Healthcare Industry
    {
      id: 17,
      title: "Medical Research Collaboration",
      description: "Bra3n helps medical researchers organize clinical studies, collaborate on findings, and generate comprehensive literature reviews across medical databases.",
      icon: <Microscope className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e",
      categories: ['Healthcare', 'Research']
    },
    {
      id: 18,
      title: "Patient Case Management",
      description: "Secure organization of patient history, test results, and treatment plans with AI-powered summaries to support clinical decision-making and continuity of care.",
      icon: <Stethoscope className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67",
      categories: ['Healthcare', 'Business']
    },
    {
      id: 19,
      title: "Healthcare Policy Knowledge Base",
      description: "Bra3n organizes hospital policies, regulatory requirements, and best practices in a searchable knowledge base with automatic updates and compliance tracking.",
      icon: <Heart className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      categories: ['Healthcare', 'Knowledge']
    },
    {
      id: 20,
      title: "Medical Education Platform",
      description: "Transform complex medical content into structured learning materials with AI-generated summaries, practice questions, and visual learning aids for medical students.",
      icon: <BookOpen className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
      categories: ['Healthcare', 'Education']
    },

    // Government & Public Sector
    {
      id: 21,
      title: "Policy Development Workspace",
      description: "Bra3n helps government teams organize research, stakeholder input, and data analysis to develop evidence-based policies with comprehensive documentation.",
      icon: <Landmark className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a",
      categories: ['Government', 'Research']
    },
    {
      id: 22,
      title: "Public Records Management",
      description: "Create an organized, searchable repository of public records with automated indexing, redaction capabilities, and intuitive retrieval for FOIA requests.",
      icon: <Folder className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521",
      categories: ['Government', 'Knowledge']
    },
    {
      id: 23,
      title: "Constituent Case Management",
      description: "Bra3n helps government offices organize constituent inquiries, track cases, and provide personalized responses with automated follow-up recommendations.",
      icon: <Users className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1518600570419-666533082f3f",
      categories: ['Government', 'Business']
    },
    {
      id: 24,
      title: "Grant Management System",
      description: "Streamline grant applications, reviews, and reporting processes with AI-powered organization of requirements, deadlines, and performance metrics.",
      icon: <Layers className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1554224155-1696413565d3",
      categories: ['Government', 'Finance']
    },

    // Technology Industry
    {
      id: 25,
      title: "Software Development Knowledge Hub",
      description: "Bra3n centralizes technical documentation, code snippets, and development best practices in a searchable hub that suggests relevant resources during coding.",
      icon: <Brain className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
      categories: ['Technology', 'Knowledge']
    },
    {
      id: 26,
      title: "Product Research Repository",
      description: "Organize market research, user feedback, and competitor analysis to generate insights for product development with AI-powered recommendation summaries.",
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2",
      categories: ['Technology', 'Research']
    },
    {
      id: 27,
      title: "Technical Documentation Assistant",
      description: "Bra3n helps teams create, organize, and maintain technical documentation with automated summaries, version tracking, and contextual search capabilities.",
      icon: <FileText className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de",
      categories: ['Technology', 'Content']
    },
    {
      id: 28,
      title: "IT Compliance Management",
      description: "Organize security standards, audit requirements, and internal policies in one place with automated gap analysis and compliance reporting capabilities.",
      icon: <Shield className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
      categories: ['Technology', 'Legal']
    },

    // Marketing & Advertising
    {
      id: 29,
      title: "Marketing Campaign Hub",
      description: "Bra3n centralizes campaign assets, performance data, and audience insights to automatically generate performance reports and optimization recommendations.",
      icon: <Target className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
      categories: ['Marketing', 'Business']
    },
    {
      id: 30,
      title: "Brand Asset Management",
      description: "Create an organized repository of brand guidelines, creative assets, and marketing materials with AI-powered tagging and intuitive search capabilities.",
      icon: <PenLine className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1616499453887-fc6553d0126c",
      categories: ['Marketing', 'Content']
    },
    {
      id: 31,
      title: "Market Research Intelligence",
      description: "Bra3n analyzes consumer research, focus group findings, and market trends to generate actionable marketing insights and competitive positioning strategies.",
      icon: <BarChart className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      categories: ['Marketing', 'Research']
    },
    {
      id: 32,
      title: "Social Media Content Planning",
      description: "Organize content calendars, audience data, and performance metrics to generate AI-powered content recommendations and engagement strategies.",
      icon: <Globe className="h-6 w-6 text-white" />,
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
      categories: ['Marketing', 'Content']
    }
  ];

  // Categories for the filter - expanded to include all industry categories
  const categories: UseCaseCategory[] = ['Featured', 'Research', 'Education', 'Business', 'Content', 'Knowledge', 'Finance', 'Legal', 'Healthcare', 'Government', 'Technology', 'Marketing'];
  
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
