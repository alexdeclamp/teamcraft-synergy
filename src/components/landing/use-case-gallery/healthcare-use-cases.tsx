
import React from 'react';
import { Microscope, Stethoscope, Heart, BookOpen } from 'lucide-react';
import { UseCase } from './types';

// Healthcare Industry use cases
export const healthcareUseCases: UseCase[] = [
  {
    id: 17,
    title: "Medical Research Collaboration",
    description: "Bra3n helps medical researchers organize clinical studies, collaborate on findings, and generate comprehensive literature reviews across medical databases.",
    icon: <Microscope className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare', 'Research']
  },
  {
    id: 18,
    title: "Patient Case Management",
    description: "Secure organization of patient history, test results, and treatment plans with AI-powered summaries to support clinical decision-making and continuity of care.",
    icon: <Stethoscope className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare', 'Business']
  },
  {
    id: 19,
    title: "Healthcare Policy Knowledge Base",
    description: "Bra3n organizes hospital policies, regulatory requirements, and best practices in a searchable knowledge base with regular updates and documentation tracking.",
    icon: <Heart className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare', 'Knowledge']
  },
  {
    id: 20,
    title: "Medical Education Platform",
    description: "Transform complex medical content into structured learning materials with AI-generated summaries, practice questions, and visual learning aids for medical students.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare', 'Education']
  }
];
