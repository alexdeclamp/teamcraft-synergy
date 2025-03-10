
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">Who Uses Bra3n?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {audiences.map((audience, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{audience.name}</h3>
              <p className="text-muted-foreground">{audience.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AudienceSection;
