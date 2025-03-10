
import React from 'react';
import FeatureCard from './FeatureCard';
import { Upload, Brain, MessageSquare } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const howItWorks = [{
    icon: <Upload className="h-10 w-10 text-primary" />,
    title: "1️⃣ Upload Your Knowledge",
    description: "📂 Add notes, PDFs, images, and updates into your Brain.",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
    imagePosition: "right" as const
  }, {
    icon: <Brain className="h-10 w-10 text-primary" />,
    title: "2️⃣ AI Summarizes for You",
    description: "🧠 Bra3n instantly organizes and summarizes your content.",
    imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d",
    imagePosition: "left" as const
  }, {
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: "3️⃣ Ask Anything, Get Answers",
    description: "💬 Use our AI-powered chat to retrieve insights instantly. 👉 No more digging through messy docs – just ask and get what you need!",
    imageUrl: "https://images.unsplash.com/photo-1565616424931-f04411bde104",
    imagePosition: "right" as const
  }];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        {howItWorks.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            imageUrl={feature.imageUrl}
            imagePosition={feature.imagePosition}
          />
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
