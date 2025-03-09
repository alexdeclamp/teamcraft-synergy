
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description,
  imageUrl,
  imagePosition = 'right'
}) => {
  // If no image URL is provided, render the compact card
  if (!imageUrl) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
        <CardContent className="p-6 space-y-4">
          <div className="p-3 bg-primary/10 inline-flex rounded-lg">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  }

  // Render the expanded card with image
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md w-full">
      <div className={`grid md:grid-cols-2 gap-6 ${imagePosition === 'left' ? 'flex-row-reverse' : ''}`}>
        <div className="p-6 flex flex-col justify-center space-y-4">
          <div className="p-3 bg-primary/10 inline-flex rounded-lg w-fit">
            {icon}
          </div>
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className={`${imagePosition === 'left' ? 'order-first' : ''} h-full min-h-[250px]`}>
          <img 
            src={imageUrl} 
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;
