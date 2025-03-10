
import React from 'react';
import { BookOpen, FileText, ClipboardList, Building, AlertTriangle } from 'lucide-react';
import { UseCase } from './types';

// Government & Public Sector use cases
export const governmentPublicUseCases: UseCase[] = [
  {
    id: 26,
    title: "Legislative & Policy Archive",
    description: "Store government reports, laws, and policy changes for quick access.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government & Public Sector']
  },
  {
    id: 27,
    title: "Public Policy Research Storage",
    description: "Organize and summarize policy papers and whitepapers for informed decision-making.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government & Public Sector']
  },
  {
    id: 28,
    title: "Government Meeting Notes & Reports",
    description: "Maintain a repository of official minutes and public statements.",
    icon: <ClipboardList className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government & Public Sector']
  },
  {
    id: 29,
    title: "Urban Planning & Infrastructure Reports",
    description: "Store city development plans, transportation reports, and environmental assessments.",
    icon: <Building className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government & Public Sector']
  },
  {
    id: 30,
    title: "Crisis Management & Disaster Response Playbooks",
    description: "Archive best practices, emergency response plans, and historical incident reports.",
    icon: <AlertTriangle className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government & Public Sector']
  }
];
