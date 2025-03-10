
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatarText: string;
  rating?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  avatarText,
  rating = 5
}) => {
  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Star Rating */}
        <div className="flex mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={`${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
            />
          ))}
        </div>
        
        <p className="text-muted-foreground mb-6 flex-grow">{content}</p>
        
        <div className="flex items-center mt-auto pt-4 border-t">
          <Avatar className="h-10 w-10 mr-3 bg-primary/10">
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
