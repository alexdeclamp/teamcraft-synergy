
import React from 'react';
import { FileText, Brain, MessageSquare, Users, Folder, PenLine, BarChart } from 'lucide-react';
import { UseCase } from './types';

// Featured use cases (exactly 8)
export const featuredUseCases: UseCase[] = [
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
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Business', 'Research']
  },
  {
    id: 3,
    title: "Interactive Learning Materials",
    description: "Bra3n transforms course content into engaging learning materials, automatically organizing lecture notes, creating summaries, and generating practice questions.",
    icon: <Brain className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Education']
  },
  {
    id: 4,
    title: "Client Profile Management",
    description: "Consolidate client information, meeting notes, and deliverables in one place. Bra3n generates relationship insights and suggests personalized follow-up actions.",
    icon: <Users className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Business']
  },
  {
    id: 5,
    title: "Document Knowledge Base",
    description: "Bra3n intelligently organizes company documents, creating a searchable knowledge base that extracts insights from policies, manuals and guides for easy access.",
    icon: <Folder className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Knowledge']
  },
  {
    id: 6,
    title: "Content Strategy Planning",
    description: "Upload existing content and audience research. Bra3n analyzes patterns, identifies gaps, and recommends data-driven content opportunities with SEO insights.",
    icon: <PenLine className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Content', 'Marketing']
  },
  {
    id: 7,
    title: "Knowledge Assistant Chat",
    description: "Ask questions about your projects and get instant answers. Bra3n understands context across all your documents and generates accurate, sourced responses.",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Knowledge']
  },
  {
    id: 8,
    title: "Software Development Knowledge Hub",
    description: "Bra3n centralizes technical documentation, code snippets, and development best practices in a searchable hub that suggests relevant resources during coding.",
    icon: <Brain className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Technology', 'Knowledge']
  }
];
