
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type MembershipFeature = {
  name: string;
  description: string;
};

type MembershipCardProps = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: MembershipFeature[];
  isCurrentPlan: boolean;
  onSelect: () => void;
  isLoading?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  selectedTierId?: string | null;
  tierId?: string;
};

const MembershipCard = ({
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  isCurrentPlan,
  onSelect,
  isLoading = false,
  billingCycle = 'monthly',
  selectedTierId = null,
  tierId
}: MembershipCardProps) => {
  // Calculate the price to display based on the selected billing cycle
  const displayPrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
  
  // Calculate the billing interval label
  const intervalLabel = billingCycle === 'monthly' ? '/month' : '/year';

  // Calculate yearly savings percentage (if applicable)
  const yearlySavingsPercentage = Math.round((1 - (yearlyPrice / (monthlyPrice * 12))) * 100);
  
  // Determine if this specific card is in loading state
  const isThisCardLoading = isLoading && selectedTierId === tierId;
  
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all", 
      isCurrentPlan && "border-primary shadow-lg"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isCurrentPlan && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
              Current Plan
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <p className="text-3xl font-bold">${displayPrice}<span className="text-sm font-normal">{intervalLabel}</span></p>
          {billingCycle === 'monthly' && yearlyPrice > 0 && (
            <p className="text-sm text-muted-foreground">or ${yearlyPrice}/year (save {yearlySavingsPercentage}%)</p>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-medium">Features</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button className="w-full" variant="outline" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onSelect}
            disabled={isThisCardLoading || isLoading}
          >
            {isThisCardLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              monthlyPrice === 0 ? 'Downgrade to Free' : 'Upgrade Plan'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MembershipCard;
