
import React from 'react';
import { DollarSign, CheckSquare, Landmark, FileSpreadsheet } from 'lucide-react';
import { UseCase } from './types';

// Finance Industry use cases
export const financeUseCases: UseCase[] = [
  {
    id: 9,
    title: "Investment Portfolio Analysis",
    description: "Bra3n processes financial reports, analyzes market trends, and provides AI-powered insights for optimizing investment portfolios with real-time risk assessment.",
    icon: <DollarSign className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance', 'Research']
  },
  {
    id: 10,
    title: "Financial Compliance Management",
    description: "Streamline regulatory compliance by organizing financial regulations, internal policies, and audit documents in one searchable knowledge hub with updates tracked over time.",
    icon: <CheckSquare className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance', 'Legal']
  },
  {
    id: 11,
    title: "Banking Client Intelligence",
    description: "Consolidate client financial history, interactions, and preferences to generate insights for personalized banking recommendations and service improvements.",
    icon: <Landmark className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance', 'Business']
  },
  {
    id: 12,
    title: "Financial Report Automation",
    description: "Bra3n analyzes financial data across multiple sources, automatically generating comprehensive reports with key insights, trends and actionable recommendations.",
    icon: <FileSpreadsheet className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance']
  }
];
