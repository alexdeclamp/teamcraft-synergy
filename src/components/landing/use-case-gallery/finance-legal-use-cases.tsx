
import React from 'react';
import { FileText, Scale, Landmark, BarChart, AlertTriangle } from 'lucide-react';
import { UseCase } from './types';

// Finance & Legal use cases
export const financeLegalUseCases: UseCase[] = [
  {
    id: 11,
    title: "Financial Report Summarization",
    description: "Extract key points from financial statements, investment reports, and earnings calls.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance & Legal']
  },
  {
    id: 12,
    title: "Legal Document Analysis",
    description: "Organize contracts, policies, and legal agreements with key clause summaries.",
    icon: <Scale className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance & Legal']
  },
  {
    id: 13,
    title: "Regulatory & Compliance Document Storage",
    description: "Maintain an updated repository of compliance documents and historical regulatory changes.",
    icon: <Landmark className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance & Legal']
  },
  {
    id: 14,
    title: "Investment Research Archive",
    description: "Store and summarize past investment memos, due diligence reports, and market analyses.",
    icon: <BarChart className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance & Legal']
  },
  {
    id: 15,
    title: "Risk & Case Study Database",
    description: "Collect and categorize case studies of past legal or financial risks for reference.",
    icon: <AlertTriangle className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance & Legal']
  }
];
