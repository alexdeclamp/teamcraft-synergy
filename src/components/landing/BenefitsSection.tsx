
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Bra3n?</h2>
          <p className="text-gray-600">
            Our platform helps you organize information, extract insights, and collaborate effectively.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-3 mt-1">
                  <Check className="h-5 w-5 text-black" />
                </div>
                <span className="text-gray-800">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
