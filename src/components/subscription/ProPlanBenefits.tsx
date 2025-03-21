
import React from 'react';

// Simple benefit item component
const BenefitItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
    <span>{text}</span>
  </li>
);

const ProPlanBenefits = () => {
  return (
    <div className="mt-8 p-4 bg-primary/5 rounded-lg">
      <h3 className="text-lg font-medium mb-3">Pro Plan Benefits</h3>
      <ul className="space-y-2">
        <BenefitItem text="Unlimited AI calls per month" />
        <BenefitItem text="Create and manage unlimited brains" />
        <BenefitItem text="Share brains with team members" />
        <BenefitItem text="Early access to new features" />
        <BenefitItem text="Priority support" />
      </ul>
    </div>
  );
};

export default ProPlanBenefits;
