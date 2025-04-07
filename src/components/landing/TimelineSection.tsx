
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Brain, UserPlus, MessageSquare } from 'lucide-react';

const TimelineSection: React.FC = () => {
  const navigate = useNavigate();
  
  const steps = [{
    icon: <Upload className="h-10 w-10 text-white" />,
    title: "Upload Your Knowledge",
    description: "Add notes, PDFs, images, and more to build your knowledge base.",
    color: "bg-primary"
  }, {
    icon: <Brain className="h-10 w-10 text-white" />,
    title: "Generate Notes",
    description: "AI automatically organizes and summarizes your content.",
    color: "bg-blue-500"
  }, {
    icon: <UserPlus className="h-10 w-10 text-white" />,
    title: "Invite People",
    description: "Share your Brain with team members and collaborators.",
    color: "bg-purple-500"
  }, {
    icon: <MessageSquare className="h-10 w-10 text-white" />,
    title: "Chat With Your Project",
    description: "Ask questions and get instant answers from your knowledge base.",
    color: "bg-indigo-500"
  }];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">How It Works</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four simple steps to transform how you manage information
        </p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md transform transition-transform hover:scale-105`}>
              {step.icon}
              <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <Button
          onClick={() => navigate('/auth')}
          variant="outline"
          size="lg"
          className="rounded-full px-8 shadow-sm hover:bg-primary hover:text-white transition-colors"
        >
          Start Your Journey
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default TimelineSection;
