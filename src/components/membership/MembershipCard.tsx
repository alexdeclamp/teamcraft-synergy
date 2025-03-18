
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink } from 'lucide-react';
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
  paymentLink?: string;
};

const MembershipCard = ({
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  isCurrentPlan,
  onSelect,
  paymentLink
}: MembershipCardProps) => {
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all", 
      isCurrentPlan && "border-primary shadow-md"
    )}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="text-3xl font-bold">${monthlyPrice}<span className="text-sm font-normal">/month</span></p>
          <p className="text-sm text-muted-foreground">or ${yearlyPrice}/year (save {Math.round((1 - (yearlyPrice / (monthlyPrice * 12))) * 100)}%)</p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Features</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
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
          <Button className="w-full" disabled>Current Plan</Button>
        ) : (
          paymentLink ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.open(paymentLink, '_blank')}
            >
              {monthlyPrice === 0 ? 'Downgrade' : 'Subscribe'} <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={onSelect}>
              {monthlyPrice === 0 ? 'Downgrade' : 'Upgrade'}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default MembershipCard;
