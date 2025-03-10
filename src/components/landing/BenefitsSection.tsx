
import React from 'react';
import { Check } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    "Organize research and documents in one central place", 
    "Extract key insights from PDFs and images automatically", 
    "Find information quickly with powerful search capabilities", 
    "Collaborate seamlessly with team members", 
    "Save time with AI-powered document summarization"
  ];
  
  return (
    <section id="benefits" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-primary/5 rounded-lg">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose Bra3n?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Our AI-powered platform offers unique benefits that transform how you manage information
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <ul className="space-y-4">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3 bg-background p-4 rounded-lg shadow-sm">
              <div className="bg-primary/10 p-1.5 rounded-full text-primary flex-shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <span className="text-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BenefitsSection;
