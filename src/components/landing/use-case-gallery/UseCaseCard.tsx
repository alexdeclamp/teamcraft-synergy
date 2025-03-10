
import React from 'react';
import { UseCase } from './types';

interface UseCaseCardProps {
  useCase: UseCase;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ useCase }) => {
  return (
    <div className="bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-primary rounded-lg p-2 flex-shrink-0">
            {useCase.icon}
          </div>
          <h3 className="text-lg font-semibold leading-tight">{useCase.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm">{useCase.description}</p>
      </div>
    </div>
  );
};

export default UseCaseCard;
