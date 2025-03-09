
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description 
}) => {
  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
      <CardContent className="p-6 space-y-4 flex flex-col h-full">
        <div className="p-3 bg-primary/10 inline-flex rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
