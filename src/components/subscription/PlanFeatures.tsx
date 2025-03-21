
import React from 'react';

interface PlanFeaturesProps {
  features: string[];
}

const PlanFeatures = ({ features }: PlanFeaturesProps) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
      <h4 className="font-medium mb-2">Plan Includes</h4>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanFeatures;
