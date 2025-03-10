
import { ReactNode } from 'react';

// Category type - updated to reflect new categories
export type UseCaseCategory = 
  | 'Featured' 
  | 'Research & Education' 
  | 'Business & Marketing' 
  | 'Finance & Legal' 
  | 'Healthcare & Life Sciences' 
  | 'Technology & Software Development' 
  | 'Government & Public Sector';

// Use case type
export interface UseCase {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
  image: string;
  categories: UseCaseCategory[];
}
