
import React from 'react';
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tutorials = [
  {
    id: 'create-brain',
    title: 'Creating Your First Brain',
    description: 'Learn how to create and configure your first project.',
    completed: true,
  },
  {
    id: 'add-documents',
    title: 'Adding Documents',
    description: 'Learn how to upload and organize your documents.',
    completed: false,
  },
  {
    id: 'chat-with-brain',
    title: 'Chatting With Your Brain',
    description: 'Start having intelligent conversations with your brain.',
    completed: false,
  },
  {
    id: 'share-collaborate',
    title: 'Sharing & Collaboration',
    description: 'Invite team members and collaborate on projects.',
    completed: false,
  },
];

const Tutorial = () => {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl font-bold">Tutorials</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                {tutorial.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
                {tutorial.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{tutorial.description}</p>
              <Button>
                <PlayCircle className="mr-2 h-4 w-4" />
                {tutorial.completed ? 'Review Tutorial' : 'Start Tutorial'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tutorial;
