
import React from 'react';
import { UseCase } from './types';
import UseCaseCard from './UseCaseCard';

interface UseCaseGridProps {
  useCases: UseCase[];
}

const UseCaseGrid: React.FC<UseCaseGridProps> = ({ useCases }) => {
  console.log('Rendering UseCaseGrid with', useCases.length, 'cases');
  
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {useCases.map((useCase) => (
        <UseCaseCard key={useCase.id} useCase={useCase} />
      ))}
    </div>
  );
};

export default UseCaseGrid;
