import { FileText, Brain, MessageSquare, Users, Search, BarChart, PenLine, Building, BookOpen, Folder, Briefcase, Scale, Stethoscope, Globe, Landmark, Shield, Gavel, Microscope, Glasses, School, DollarSign, Network, Lightbulb, CheckSquare, MoveRight, Layers, FileSpreadsheet, BookMarked, Calculator, BadgeCheck, Heart, Verified, Crosshair } from 'lucide-react';
import { UseCase, UseCaseCategory } from './types';

// Define all available categories
export const categories: UseCaseCategory[] = [
  'Featured', 
  'Research', 
  'Education', 
  'Business', 
  'Content', 
  'Knowledge', 
  'Finance', 
  'Legal', 
  'Healthcare', 
  'Government', 
  'Technology', 
  'Marketing'
];

// Define use cases - with exactly 8 featured cases
export const useCasesData: UseCase[] = [
  // Featured use cases (exactly 8)
  {
    id: 1,
    title: "Research Literature Review",
    description: "Bra3n assists researchers by organizing academic papers, extracting key findings, and generating comprehensive literature reviews with citation management.",
    icon: <FileText className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Research']
  },
  {
    id: 2,
    title: "AI-Enhanced Market Analysis",
    description: "Bra3n analyzes market reports, news articles, and company data to deliver in-depth financial insights with customizable dashboards showing market trends.",
    icon: <BarChart className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Business', 'Research']
  },
  {
    id: 3,
    title: "Interactive Learning Materials",
    description: "Bra3n transforms course content into engaging learning materials, automatically organizing lecture notes, creating summaries, and generating practice questions.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Education']
  },
  {
    id: 4,
    title: "Client Profile Management",
    description: "Consolidate client information, meeting notes, and deliverables in one place. Bra3n generates relationship insights and suggests personalized follow-up actions.",
    icon: <Users className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Business']
  },
  {
    id: 5,
    title: "Document Knowledge Base",
    description: "Bra3n intelligently organizes company documents, creating a searchable knowledge base that extracts insights from policies, manuals and guides for easy access.",
    icon: <Folder className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Knowledge']
  },
  {
    id: 6,
    title: "Content Strategy Planning",
    description: "Upload existing content and audience research. Bra3n analyzes patterns, identifies gaps, and recommends data-driven content opportunities with SEO insights.",
    icon: <PenLine className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Content', 'Marketing']
  },
  {
    id: 7,
    title: "Knowledge Assistant Chat",
    description: "Ask questions about your projects and get instant answers. Bra3n understands context across all your documents and generates accurate, sourced responses.",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Knowledge']
  },
  {
    id: 8,
    title: "Software Development Knowledge Hub",
    description: "Bra3n centralizes technical documentation, code snippets, and development best practices in a searchable hub that suggests relevant resources during coding.",
    icon: <Brain className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Technology', 'Knowledge']
  },
  
  // Non-featured use cases (keeping them for other category filters)
  // Finance Industry
  {
    id: 9,
    title: "Investment Portfolio Analysis",
    description: "Bra3n processes financial reports, analyzes market trends, and provides AI-powered insights for optimizing investment portfolios with real-time risk assessment.",
    icon: <DollarSign className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance', 'Research']
  },
  {
    id: 10,
    title: "Financial Compliance Management",
    description: "Streamline regulatory compliance by organizing financial regulations, internal policies, and audit documents in one searchable knowledge hub with updates tracked over time.",
    icon: <CheckSquare className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance', 'Legal']
  },
  {
    id: 11,
    title: "Banking Client Intelligence",
    description: "Consolidate client financial history, interactions, and preferences to generate insights for personalized banking recommendations and service improvements.",
    icon: <Landmark className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance', 'Business']
  },
  {
    id: 12,
    title: "Financial Report Automation",
    description: "Bra3n analyzes financial data across multiple sources, automatically generating comprehensive reports with key insights, trends and actionable recommendations.",
    icon: <FileSpreadsheet className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Finance']
  },

  // Legal Industry
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
  },

  // Healthcare Industry
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
  },

  // Government & Public Sector
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
  },

  // Technology Industry
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
  },

  // Marketing & Advertising
  {
    id: 28,
    title: "Marketing Campaign Hub",
    description: "Bra3n centralizes campaign assets, performance data, and audience insights to automatically generate performance reports and optimization recommendations.",
    icon: <Crosshair className="h-6 w-6 text-white" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png",
    categories: ['Featured', 'Marketing', 'Business']
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
