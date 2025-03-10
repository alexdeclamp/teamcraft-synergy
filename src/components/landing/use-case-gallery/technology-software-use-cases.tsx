
import React from 'react';
import { Folder, Code, FileCog, AlertOctagon, BookOpen } from 'lucide-react';
import { UseCase } from './types';

// Technology & Software Development use cases
export const technologySoftwareUseCases: UseCase[] = [
  {
    id: 21,
    title: "Software Development Knowledge Hub",
    description: "Centralize documentation, technical guides, and best practices.",
    icon: <Folder className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology & Software Development']
  },
  {
    id: 22,
    title: "Code Review Summaries",
    description: "Store and summarize past code reviews, highlighting key learnings.",
    icon: <Code className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology & Software Development']
  },
  {
    id: 23,
    title: "API Documentation Repository",
    description: "Organize API documentation for easy reference.",
    icon: <FileCog className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology & Software Development']
  },
  {
    id: 24,
    title: "Incident & Post-Mortem Storage",
    description: "Archive reports on past system failures, resolutions, and key takeaways.",
    icon: <AlertOctagon className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology & Software Development']
  },
  {
    id: 25,
    title: "Engineering Team Knowledge Sharing",
    description: "Maintain a shared space for storing engineering playbooks, onboarding materials, and process documentation.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Technology & Software Development']
  }
];
