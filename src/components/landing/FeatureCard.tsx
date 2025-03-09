
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  fullWidth?: boolean;
  className?: string;
  imagePosition?: 'top' | 'bottom' | 'background';
  darkOverlay?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description,
  image,
  fullWidth = false,
  className = '',
  imagePosition = 'top',
  darkOverlay = false
}) => {
  if (image && imagePosition === 'background') {
    return (
      <div 
        className={`relative overflow-hidden rounded-xl ${fullWidth ? 'w-full' : 'h-full'} ${className}`}
        style={{ minHeight: fullWidth ? '460px' : '320px' }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className={`absolute inset-0 ${darkOverlay ? 'bg-black/50' : 'bg-gradient-to-t from-black/70 to-transparent'}`} />
        <div className="relative z-10 p-8 flex flex-col h-full justify-end">
          {icon && (
            <div className="p-3 bg-primary/10 inline-flex rounded-lg mb-4 backdrop-blur-sm bg-white/10 w-fit">
              {icon}
            </div>
          )}
          <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/90">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-4px] ${className}`}>
      {image && imagePosition === 'top' && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-6 space-y-4 flex flex-col h-full">
        {icon && (
          <div className="p-3 bg-primary/10 inline-flex rounded-lg">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </CardContent>
      {image && imagePosition === 'bottom' && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
    </Card>
  );
};

export default FeatureCard;
