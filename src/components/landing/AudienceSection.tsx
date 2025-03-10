
import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AudienceSection: React.FC = () => {
  const audiences = [{
    name: "Consultants & Analysts",
    description: "Keep research organized."
  }, {
    name: "Product Teams",
    description: "Centralize insights & findings."
  }, {
    name: "Startups & Creators",
    description: "Manage ideas & notes easily."
  }, {
    name: "Anyone who hates losing information",
    description: "Find what you need when you need it."
  }];
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Who Uses Bra3n?</h2>
          <p className="text-gray-600 mb-8">
            Our platform is designed for anyone who needs to manage information efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {audiences.map((audience, index) => (
            <Card key={index} className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">{audience.name}</h3>
                <p className="text-gray-600">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
