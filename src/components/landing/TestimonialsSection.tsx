
import React from 'react';
import TestimonialCard from './TestimonialCard';
import { MessageCircle } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "John D.",
      role: "Product Manager",
      content: "Bra3n changed how my team works! Finding past notes is now instant and the AI-powered insights have revolutionized our research process.",
      avatar: "JD",
      rating: 5
    }, 
    {
      name: "Marie L.",
      role: "Consultant",
      content: "It's like having an AI assistant that actually knows my work. I can't imagine going back to traditional note-taking after experiencing Bra3n.",
      avatar: "ML",
      rating: 5
    }, 
    {
      name: "Alex K.",
      role: "Researcher",
      content: "The way Bra3n connects related information from different documents has saved me countless hours. It finds connections I would have missed.",
      avatar: "AK",
      rating: 4
    }, 
    {
      name: "Sarah T.",
      role: "Marketing Director",
      content: "Our team's productivity increased by 30% after adopting Bra3n. The collaborative features are exceptional and the AI suggestions are spot-on.",
      avatar: "ST",
      rating: 5
    }
  ];
  
  return (
    <section id="testimonials" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-accent/30 rounded-lg">
      <div className="text-center mb-12 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white p-3 rounded-full">
          <MessageCircle size={24} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4 pt-6">What Our Users Say</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Don't take our word for it - hear from people who use Bra3n every day
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={index} 
            name={testimonial.name} 
            role={testimonial.role} 
            content={testimonial.content} 
            avatarText={testimonial.avatar} 
            rating={testimonial.rating} 
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
