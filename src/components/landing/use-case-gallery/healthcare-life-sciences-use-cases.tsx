
import React from 'react';
import { Brain, Stethoscope, Microscope, BookOpen, Shield } from 'lucide-react';
import { UseCase } from './types';

// Healthcare & Life Sciences use cases
export const healthcareLifeSciencesUseCases: UseCase[] = [
  {
    id: 16,
    title: "Medical Research Summarization",
    description: "Store and analyze medical papers, extracting key insights for faster knowledge sharing.",
    icon: <Brain className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare & Life Sciences']
  },
  {
    id: 17,
    title: "Clinical Case Studies Archive",
    description: "Organize case reports, anonymized patient studies, and treatment outcomes.",
    icon: <Stethoscope className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare & Life Sciences']
  },
  {
    id: 18,
    title: "Pharmaceutical Trials Document Storage",
    description: "Maintain a repository of trial protocols, regulatory submissions, and study results.",
    icon: <Microscope className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare & Life Sciences']
  },
  {
    id: 19,
    title: "Best Practices for Healthcare Professionals",
    description: "Compile and summarize medical guidelines, research-backed treatments, and professional recommendations.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare & Life Sciences']
  },
  {
    id: 20,
    title: "Healthcare Policy & Compliance Library",
    description: "Store and retrieve documents related to healthcare policies, insurance guidelines, and compliance rules.",
    icon: <Shield className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Healthcare & Life Sciences']
  }
];
