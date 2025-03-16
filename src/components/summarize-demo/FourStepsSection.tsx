
import React from 'react';
import { FileText, Brain, UserPlus, MessageSquare } from 'lucide-react';

const FourStepsSection = () => {
  const steps = [{
    number: 1,
    title: "Add notes, PDFs, images, and more to build your knowledge base.",
    icon: <FileText className="h-6 w-6 text-primary" />,
  }, {
    number: 2,
    title: "AI automatically organizes and summarizes your content.",
    icon: <Brain className="h-6 w-6 text-primary" />,
  }, {
    number: 3,
    title: "Share your Brain with team members and collaborators.",
    icon: <UserPlus className="h-6 w-6 text-primary" />,
  }, {
    number: 4,
    title: "Ask questions and get instant answers from your knowledge base.",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
  }];
  
  return <div className="w-full max-w-5xl mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-12">
        {steps.map((step, index) => <div key={index} className="flex flex-col items-center text-center w-full md:w-1/4">
            <div className="relative">
              <div className="bg-primary/10 w-14 h-14 rounded-lg mb-4 flex items-center justify-center feature-icon-container">
                <div className="font-bold text-lg text-primary">{step.number}</div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && <div className="hidden md:block absolute top-7 left-full w-full h-0.5 bg-primary/20" style={{
                width: 'calc(100% - 3.5rem)'
              }}></div>}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          </div>)}
      </div>
    </div>;
};

export default FourStepsSection;
