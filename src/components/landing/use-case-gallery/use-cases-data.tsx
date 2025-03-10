
import { categories } from './categories';
import { featuredUseCases } from './featured-use-cases';
import { financeUseCases } from './finance-use-cases';
import { legalUseCases } from './legal-use-cases';
import { healthcareUseCases } from './healthcare-use-cases';
import { governmentUseCases } from './government-use-cases';
import { technologyUseCases } from './technology-use-cases';
import { marketingUseCases } from './marketing-use-cases';

// Combine all use cases
export const useCasesData = [
  ...featuredUseCases,
  ...financeUseCases,
  ...legalUseCases,
  ...healthcareUseCases,
  ...governmentUseCases,
  ...technologyUseCases,
  ...marketingUseCases
];

// Re-export categories for convenience
export { categories };
