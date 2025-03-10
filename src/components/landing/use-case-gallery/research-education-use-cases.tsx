
import React from 'react';
import { FileText, Lightbulb, BookOpen, BookMarked, GraduationCap } from 'lucide-react';
import { UseCase } from './types';

// Research & Education use cases
export const researchEducationUseCases: UseCase[] = [
  {
    id: 1,
    title: "Research Literature Review",
    description: "Organize academic papers, extract key findings, and generate comprehensive literature reviews with citation management.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Research & Education']
  },
  {
    id: 2,
    title: "AI-Powered Grant Writing",
    description: "Assist researchers in drafting grant proposals by analyzing previous applications and summarizing key themes.",
    icon: <Lightbulb className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Research & Education']
  },
  {
    id: 3,
    title: "Interactive Learning Materials",
    description: "Transform course content into structured lecture notes, summaries, and practice questions.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Research & Education']
  },
  {
    id: 4,
    title: "Institutional Knowledge Repository",
    description: "Centralize faculty publications, teaching materials, and policies into a searchable knowledge hub.",
    icon: <BookMarked className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Research & Education']
  },
  {
    id: 5,
    title: "Student Research Archive",
    description: "Organize student projects, thesis documents, and study materials for collaborative research.",
    icon: <GraduationCap className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Research & Education']
  }
];
