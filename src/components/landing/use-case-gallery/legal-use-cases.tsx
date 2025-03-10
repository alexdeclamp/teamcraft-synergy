
import React from 'react';
import { Gavel, FileText, BookMarked, Scale } from 'lucide-react';
import { UseCase } from './types';

// Legal Industry use cases
export const legalUseCases: UseCase[] = [
  {
    id: 13,
    title: "Case Law Research Assistant",
    description: "Bra3n organizes case documents, extracts precedents, and helps legal teams quickly find relevant cases and statutes for ongoing litigation.",
    icon: <Gavel className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Legal', 'Research']
  },
  {
    id: 14,
    title: "Contract Analysis Hub",
    description: "Upload contracts and legal agreements. Bra3n identifies key clauses, potential risks, and creates an organized repository with automated summaries for quick reference.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Legal', 'Business']
  },
  {
    id: 15,
    title: "Legal Knowledge Management",
    description: "Create a centralized repository of firm expertise, precedents, and legal research that automatically suggests relevant resources for current legal matters.",
    icon: <BookMarked className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Legal', 'Knowledge']
  },
  {
    id: 16,
    title: "Regulatory Compliance Tracker",
    description: "Bra3n monitors regulatory changes, organizes compliance requirements, and helps legal teams ensure organizational policies remain aligned with current laws.",
    icon: <Scale className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Legal', 'Business']
  }
];
