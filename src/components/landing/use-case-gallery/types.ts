
import { ReactNode } from 'react';

// Category type - expanded to include more industries
export type UseCaseCategory = 'Featured' | 'Research' | 'Education' | 'Business' | 'Content' | 'Knowledge' | 'Finance' | 'Legal' | 'Healthcare' | 'Government' | 'Technology' | 'Marketing';

// Use case type
export interface UseCase {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  categories: UseCaseCategory[];
}
