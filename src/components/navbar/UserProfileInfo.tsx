
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { SubscriptionTier } from '@/types/subscription';

interface UserProfileInfoProps {
  fullName: string | null;
  email: string | null;
  createdAt: string | null;
  planDetails: SubscriptionTier | null;
  isLoading: boolean;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({
  fullName,
  email,
  createdAt,
  planDetails,
  isLoading
}) => {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-medium">{fullName || 'User'}</h3>
      <p className="text-sm text-muted-foreground">{email}</p>
      
      {!isLoading && planDetails && (
        <Badge 
          variant={planDetails.plan_type === 'pro' ? "default" : "secondary"}
          className={`${planDetails.plan_type === 'pro' ? 'bg-primary' : ''} mt-2`}
        >
          <Zap className="h-3 w-3 mr-1" />
          {planDetails.name} Plan
        </Badge>
      )}
      
      <div className="w-full space-y-2 mt-4">
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <span className="text-sm font-medium">Account Type</span>
          <span className="text-sm">
            {isLoading 
              ? 'Loading...' 
              : planDetails?.name || 'Starter'}
          </span>
        </div>
        <div className="flex justify-between p-3 bg-muted rounded-md">
          <span className="text-sm font-medium">Member Since</span>
          <span className="text-sm">{new Date(createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
