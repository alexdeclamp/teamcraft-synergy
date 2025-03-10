
import React from 'react';
import { Crosshair, PenLine, BarChart, Globe } from 'lucide-react';
import { UseCase } from './types';

// Marketing & Advertising use cases
export const marketingUseCases: UseCase[] = [
  {
    id: 28,
    title: "Marketing Campaign Hub",
    description: "Bra3n centralizes campaign assets, performance data, and audience insights to automatically generate performance reports and optimization recommendations.",
    icon: <Crosshair className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Marketing', 'Business']
  },
  {
    id: 29,
    title: "Brand Asset Management",
    description: "Create an organized repository of brand guidelines, creative assets, and marketing materials with AI-powered tagging and intuitive search capabilities.",
    icon: <PenLine className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Marketing', 'Content']
  },
  {
    id: 30,
    title: "Market Research Intelligence",
    description: "Bra3n analyzes consumer research, focus group findings, and market trends to generate actionable marketing insights and competitive positioning strategies.",
    icon: <BarChart className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Marketing', 'Research']
  },
  {
    id: 31,
    title: "Social Media Content Planning",
    description: "Organize content calendars, audience data, and performance metrics to generate AI-powered content recommendations and engagement strategies.",
    icon: <Globe className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Marketing', 'Content']
  }
];
