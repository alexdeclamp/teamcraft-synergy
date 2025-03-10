
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Upload, Brain, UserPlus, MessageSquare } from 'lucide-react';

const TimelineSection: React.FC = () => {
  const navigate = useNavigate();
  
  const timelineSteps = [{
    icon: <Upload className="h-10 w-10 text-white" />,
    title: "Upload Your Knowledge",
    description: "Add notes, PDFs, images, and more to build your knowledge base.",
    color: "bg-primary",
    progress: 25
  }, {
    icon: <Brain className="h-10 w-10 text-white" />,
    title: "Generate Notes",
    description: "AI automatically organizes and summarizes your content.",
    color: "bg-blue-500",
    progress: 50
  }, {
    icon: <UserPlus className="h-10 w-10 text-white" />,
    title: "Invite People",
    description: "Share your Brain with team members and collaborators.",
    color: "bg-purple-500",
    progress: 75
  }, {
    icon: <MessageSquare className="h-10 w-10 text-white" />,
    title: "Chat With Your Project",
    description: "Ask questions and get instant answers from your knowledge base.",
    color: "bg-indigo-500",
    progress: 100
  }];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">🔍 How It Works</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four simple steps to transform how you manage information
        </p>
      </div>
      
      {/* Timeline */}
      <div className="relative max-w-4xl mx-auto mb-16">
        {/* Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-muted"></div>
        
        {/* Timeline Steps */}
        <div className="space-y-24">
          {timelineSteps.map((step, index) => (
            <div key={index} className="relative">
              {/* Timeline Connector */}
              {index < timelineSteps.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 h-24 w-1 bg-gradient-to-b from-muted to-transparent top-20"></div>
              )}
              
              {/* Timeline Content */}
              <div className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Step Content */}
                <div className={`md:w-1/2 px-6 text-center md:text-${index % 2 === 0 ? 'left' : 'right'} mb-8 md:mb-0`}>
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Step Icon and Circle */}
                <div className="flex items-center justify-center">
                  <div className={`relative z-10 w-20 h-20 rounded-full ${step.color} shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110`}>
                    {step.icon}
                    <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                
                {/* Empty Space for Alignment */}
                <div className="md:w-1/2 px-6"></div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6 max-w-md mx-auto px-4 hidden sm:block">
                <Progress value={step.progress} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mb-12">
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
