
import { featuredUseCases } from './featured-use-cases';
import { researchEducationUseCases } from './research-education-use-cases';
import { businessMarketingUseCases } from './business-marketing-use-cases';
import { financeLegalUseCases } from './finance-legal-use-cases';
import { healthcareLifeSciencesUseCases } from './healthcare-life-sciences-use-cases';
import { technologySoftwareUseCases } from './technology-software-use-cases';
import { governmentPublicUseCases } from './government-public-use-cases';

// Combine all use cases without any duplicates
export const useCasesData = [
  ...featuredUseCases,
  ...researchEducationUseCases,
  ...businessMarketingUseCases,
  ...financeLegalUseCases,
  ...healthcareLifeSciencesUseCases,
  ...technologySoftwareUseCases,
  ...governmentPublicUseCases
];
