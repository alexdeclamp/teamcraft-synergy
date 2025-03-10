
import { featuredUseCases } from './featured-use-cases';
import { researchEducationUseCases } from './research-education-use-cases';
import { businessMarketingUseCases } from './business-marketing-use-cases';
import { financeLegalUseCases } from './finance-legal-use-cases';
import { healthcareLifeSciencesUseCases } from './healthcare-life-sciences-use-cases';
import { technologySoftwareUseCases } from './technology-software-use-cases';
import { governmentPublicUseCases } from './government-public-use-cases';
import { UseCase } from './types';

// Helper function to ensure we don't have duplicate IDs
const removeDuplicates = (useCases: UseCase[]): UseCase[] => {
  const seen = new Set();
  return useCases.filter(useCase => {
    if (seen.has(useCase.id)) {
      console.warn(`Duplicate use case ID found: ${useCase.id}`);
      return false;
    }
    seen.add(useCase.id);
    return true;
  });
};

// Combine all use cases without any duplicates
export const useCasesData = removeDuplicates([
  ...featuredUseCases,
  ...researchEducationUseCases,
  ...businessMarketingUseCases,
  ...financeLegalUseCases,
  ...healthcareLifeSciencesUseCases,
  ...technologySoftwareUseCases,
  ...governmentPublicUseCases
]);
