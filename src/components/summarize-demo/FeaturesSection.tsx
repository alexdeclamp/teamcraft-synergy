
import React, { useState } from 'react';
import { Code, Sparkles, Edit, Share, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Code Generation",
    description: "Generate high-quality, production-ready code in seconds with advanced AI technology.",
    icon: <Code className="h-6 w-6 text-primary" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png"
  },
  {
    id: 2,
    title: "Responsive Design",
    description: "Automatically create beautiful, responsive interfaces that work across all devices.",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    image: "/lovable-uploads/8d69913a-49e9-46f0-bea0-efdc9a28fc72.png"
  },
  {
    id: 3,
    title: "Natural Language Editing",
    description: "Request changes and updates using simple, conversational language - no coding required.",
    icon: <Edit className="h-6 w-6 text-primary" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png"
  },
  {
    id: 4,
    title: "Export & Integration",
    description: "Easily export your projects or integrate with existing codebases and development workflows.",
    icon: <Share className="h-6 w-6 text-primary" />,
    image: "/lovable-uploads/8d69913a-49e9-46f0-bea0-efdc9a28fc72.png"
  },
  {
    id: 5,
    title: "Chat with Your Documents",
    description: "Ask questions about your PDFs and get instant answers based on their content.",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    image: "/lovable-uploads/d3f6e2ca-3976-4e95-a07a-e33d20d16bc5.png"
  }
];

const FeaturesSection = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature>(features[0]);

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Powerful Features for Everyone
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover how Bra3n transforms your workflow with these key capabilities
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex flex-col gap-4">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              className={`bg-primary/5 border ${selectedFeature.id === feature.id ? 'border-primary shadow-md' : 'border-primary/20'} 
                overflow-hidden feature-card cursor-pointer transition-all`}
              onClick={() => handleFeatureClick(feature)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <div className="bg-primary/10 p-3 rounded-full mr-4 feature-icon-container">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="md:w-1/2 sticky top-24 self-start">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl overflow-hidden shadow-lg h-full p-4 border border-primary/20">
            <img 
              src={selectedFeature.image} 
              alt={selectedFeature.title} 
              className="w-full h-auto rounded-lg shadow-md transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
