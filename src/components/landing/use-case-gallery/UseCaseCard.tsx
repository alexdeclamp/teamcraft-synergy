
import React from 'react';
import { UseCase } from './types';

interface UseCaseCardProps {
  useCase: UseCase;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ useCase }) => {
  return (
    <div className="bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-primary rounded-lg p-2 flex-shrink-0">
            {useCase.icon}
          </div>
          <h3 className="text-lg font-semibold leading-tight">{useCase.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
      </div>
      <div className="h-48 border-t">
        <img 
          src={useCase.image} 
          alt={useCase.title} 
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
};

export default UseCaseCard;
