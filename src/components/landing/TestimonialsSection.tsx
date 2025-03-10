
import React from 'react';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection: React.FC = () => {
  const testimonials = [{
    name: "John D.",
    role: "Product Manager",
    content: "Bra3n changed how my team works! Finding past notes is now instant.",
    avatar: "JD"
  }, {
    name: "Marie L.",
    role: "Consultant",
    content: "It's like having an AI assistant that actually knows my work.",
    avatar: "ML"
  }];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">📢 What Users Say</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Don't take our word for it - hear from our users
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={index} 
            name={testimonial.name} 
            role={testimonial.role} 
            content={testimonial.content} 
            avatarText={testimonial.avatar} 
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
