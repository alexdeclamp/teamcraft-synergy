
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Brain, UserPlus, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const FourStepsSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const steps = [
    {
      number: 1,
      title: "Drag & Drop Files",
      description: "Seamlessly add files using our drag & drop interface.",
      icon: <Upload className="h-6 w-6 text-white" />,
      iconBgColor: "bg-blue-500"
    },
    {
      number: 2,
      title: "Generates Summary",
      description: "AI automatically creates summaries of your content.",
      icon: <Brain className="h-6 w-6 text-white" />,
      iconBgColor: "bg-purple-500"
    },
    {
      number: 3,
      title: "Take Notes",
      description: "Add your own insights and comments to the summaries.",
      icon: <UserPlus className="h-6 w-6 text-white" />,
      iconBgColor: "bg-blue-500"
    },
    {
      number: 4,
      title: "Chat With It",
      description: "Engage in conversations with your summarized content.",
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      iconBgColor: "bg-purple-500"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground">
          Four simple steps to transform how you manage information
        </p>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute top-0 left-1/2 h-full w-0.5 bg-gray-200 -translate-x-1/2 z-0" />

        {/* Steps */}
        <div className="space-y-16 relative z-10">
          {steps.map((step, index) => (
            <div key={index} className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center`}>
              {/* Content */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              
              {/* Icon with Number */}
              <div className="relative">
                <div className={`h-16 w-16 rounded-full ${step.iconBgColor} flex items-center justify-center z-10`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-white rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                  {step.number}
                </div>
                
                {/* Progress Bar */}
                <div className={`absolute top-1/2 ${index % 2 === 0 ? 'right-full' : 'left-full'} w-full max-w-[220px] h-1 ${index < steps.length - 1 ? step.iconBgColor : 'bg-transparent'} transform -translate-y-1/2 ${index % 2 === 0 ? '-translate-x-2' : 'translate-x-2'}`}></div>
              </div>
              
              {/* Empty Space */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-12">
        <Button 
          onClick={() => navigate('/waitlist')} 
          size="lg" 
          className="shadow-sm"
        >
          Join the Waitlist
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FourStepsSection;
