
import React from 'react';
import { FileText, Brain, MessageSquare, Users, Folder, PenLine, BarChart, BookOpen } from 'lucide-react';
import { UseCase } from './types';

// Featured use cases
export const featuredUseCases: UseCase[] = [
  {
    id: 1,
    title: "Research Literature Review",
    description: "Organize academic papers, extract key findings, and generate comprehensive literature reviews with citation management.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Research & Education']
  },
  {
    id: 6,
    title: "Competitor Research Repository",
    description: "Store and summarize competitor reports, marketing materials, and industry analysis.",
    icon: <BarChart className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Business & Marketing']
  },
  {
    id: 11,
    title: "Financial Report Summarization",
    description: "Extract key points from financial statements, investment reports, and earnings calls.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Finance & Legal']
  },
  {
    id: 16,
    title: "Medical Research Summarization",
    description: "Store and analyze medical papers, extracting key insights for faster knowledge sharing.",
    icon: <Brain className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Healthcare & Life Sciences']
  },
  {
    id: 21,
    title: "Software Development Knowledge Hub",
    description: "Centralize documentation, technical guides, and best practices.",
    icon: <Folder className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Technology & Software Development']
  },
  {
    id: 26,
    title: "Legislative & Policy Archive",
    description: "Store government reports, laws, and policy changes for quick access.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Government & Public Sector']
  },
  {
    id: 8,
    title: "Meeting Notes & Client History",
    description: "Store meeting notes, proposals, and client communications in one place for quick retrieval.",
    icon: <Users className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Business & Marketing']
  },
  {
    id: 7,
    title: "Knowledge Assistant Chat",
    description: "Ask questions about your projects and get instant answers. Bra3n understands context across all your documents and generates accurate, sourced responses.",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured']
  }
];
