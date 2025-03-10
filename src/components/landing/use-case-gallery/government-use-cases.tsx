
import React from 'react';
import { Landmark, Folder, Users, Layers } from 'lucide-react';
import { UseCase } from './types';

// Government & Public Sector use cases
export const governmentUseCases: UseCase[] = [
  {
    id: 21,
    title: "Policy Development Workspace",
    description: "Bra3n helps government teams organize research, stakeholder input, and data analysis to develop evidence-based policies with comprehensive documentation.",
    icon: <Landmark className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government', 'Research']
  },
  {
    id: 22,
    title: "Public Records Management",
    description: "Create an organized, searchable repository of public records with automated indexing, redaction capabilities, and intuitive retrieval for FOIA requests.",
    icon: <Folder className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government', 'Knowledge']
  },
  {
    id: 23,
    title: "Constituent Case Management",
    description: "Bra3n helps government offices organize constituent inquiries, track cases, and provide personalized responses with recommendation summaries.",
    icon: <Users className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government', 'Business']
  },
  {
    id: 24,
    title: "Grant Management System",
    description: "Streamline grant applications, reviews, and reporting processes with AI-powered organization of requirements, deadlines, and performance metrics.",
    icon: <Layers className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Government', 'Finance']
  }
];
