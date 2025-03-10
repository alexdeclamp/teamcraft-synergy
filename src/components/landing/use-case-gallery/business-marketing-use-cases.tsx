
import React from 'react';
import { BarChart, PenLine, Users, BookOpen, Star } from 'lucide-react';
import { UseCase } from './types';

// Business & Marketing use cases
export const businessMarketingUseCases: UseCase[] = [
  {
    id: 6,
    title: "Competitor Research Repository",
    description: "Store and summarize competitor reports, marketing materials, and industry analysis.",
    icon: <BarChart className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Business & Marketing']
  },
  {
    id: 7,
    title: "Content Strategy Planning",
    description: "Organize past content and research audience insights to identify new opportunities.",
    icon: <PenLine className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Business & Marketing']
  },
  {
    id: 8,
    title: "Meeting Notes & Client History",
    description: "Store meeting notes, proposals, and client communications in one place for quick retrieval.",
    icon: <Users className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Business & Marketing']
  },
  {
    id: 9,
    title: "Sales Playbook & Best Practices",
    description: "Create a searchable knowledge base of sales scripts, winning pitch decks, and customer insights.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Business & Marketing']
  },
  {
    id: 10,
    title: "Brand Sentiment Archive",
    description: "Collect and summarize customer reviews, testimonials, and survey responses.",
    icon: <Star className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Business & Marketing']
  }
];
