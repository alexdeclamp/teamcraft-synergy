
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
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">👀 Who is Bra3n for?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Perfect for teams and individuals who value their time and information
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {audiences.map((audience, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="p-3 bg-primary/10 inline-flex rounded-lg">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{audience.name}</h3>
              <p className="text-muted-foreground">{audience.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AudienceSection;
