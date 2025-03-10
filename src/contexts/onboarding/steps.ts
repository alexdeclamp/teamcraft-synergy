
import { OnboardingStep } from './types';

export const initialSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bra3n!',
    description: 'Welcome to Bra3n, your collaborative hub for smarter projects. Store notes, images, PDFs, and updates effortlessly. Share and collaborate seamlessly, and let your AI assistant answer your questions instantly.',
    isCompleted: false,
    action: 'Continue'
  },
  {
    id: 'create-brain',
    title: 'Create Your First Brain',
    description: 'Create a Brain for each of your projects or topics. Think of a Brain as your project\'s central hub, storing notes, updates, images, PDFs, and more—ready for collaboration and AI-powered insights.',
    isCompleted: false,
    action: 'Create a Brain'
  },
  {
    id: 'add-note',
    title: 'Add Your First Note',
    description: 'Start by adding a note—a simple piece of text capturing your thoughts, ideas, or crucial project details. Notes keep your ideas organized and accessible, ensuring important information is always at your fingertips.',
    isCompleted: false,
    action: 'Add a Note'
  },
  {
    id: 'upload-documents',
    title: 'Upload Images and PDFs',
    description: 'Enhance your Brain by uploading images and PDFs. These documents will be automatically summarized into concise notes using our AI integration, making it effortless to capture key information.',
    isCompleted: false,
    action: 'Upload Files'
  },
  {
    id: 'ai-summaries',
    title: 'AI-Powered Summaries',
    description: 'Submit your documents, and Bra3n will automatically generate clear, insightful summaries. These summaries become part of your notes, training your Brain\'s AI model so you can quickly find answers to any question.',
    isCompleted: false,
    action: 'View Summaries'
  },
  {
    id: 'chat-with-brain',
    title: 'Chat with Your Brain',
    description: 'Ask Bra3n anything about your project. Your AI chat is continuously learning from your notes and summaries, providing fast, accurate answers whenever you need them.',
    isCompleted: false,
    action: 'Try Chatting'
  },
  {
    id: 'collaborate',
    title: 'Collaborate and Share',
    description: 'Bra3n is built for collaboration. Easily share your Brains with colleagues or teammates, allowing everyone to contribute, access information, and collaborate seamlessly.',
    isCompleted: false,
    action: 'Invite Team Member'
  },
  {
    id: 'all-set',
    title: 'You\'re All Set!',
    description: 'Visit your Brain anytime to add more content, ask questions, or create additional Brains. Start exploring now, keep improving your existing Brain, or launch a new one!',
    isCompleted: false,
    action: 'Start Using Bra3n'
  }
];
