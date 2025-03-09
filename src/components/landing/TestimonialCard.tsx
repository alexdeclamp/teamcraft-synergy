
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatarText: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  avatarText
}) => {
  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6 flex flex-col flex-grow">
        <p className="text-muted-foreground mb-6 flex-grow">{content}</p>
        <div className="flex items-center mt-auto pt-4 border-t">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-primary/10 text-primary">
              {avatarText}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{name}</p>
            <p className="text-muted-foreground text-xs">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
