
import React from 'react';
import { Lightbulb, FileText, Shield } from 'lucide-react';
import { UseCase } from './types';

// Technology Industry use cases
export const technologyUseCases: UseCase[] = [
  {
    id: 25,
    title: "Product Research Repository",
    description: "Organize market research, user feedback, and competitor analysis to generate insights for product development with AI-powered recommendation summaries.",
    icon: <Lightbulb className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology', 'Research']
  },
  {
    id: 26,
    title: "Technical Documentation Assistant",
    description: "Bra3n helps teams create, organize, and maintain technical documentation with automated summaries, version tracking, and contextual search capabilities.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology', 'Content']
  },
  {
    id: 27,
    title: "IT Compliance Management",
    description: "Organize security standards, audit requirements, and internal policies in one place with automated gap analysis and compliance tracking.",
    icon: <Shield className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology', 'Legal']
  }
];
