
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import TimelineSection from '@/components/landing/TimelineSection';
import UseCaseGallery from '@/components/landing/UseCaseGallery';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import KeyFeaturesSection from '@/components/landing/KeyFeaturesSection';
import CtaSection from '@/components/landing/CtaSection';
import FooterSection from '@/components/landing/FooterSection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation bar */}
      <LandingNavbar />
      
      <HeroSection />
      
      {/* Demo CTA Banner */}
      <div className="bg-primary/5 py-8 mb-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-3">See Bra3n in action</h2>
          <p className="text-muted-foreground mb-5 max-w-2xl mx-auto">
            Try our document summarization tool and experience the power of AI-generated insights firsthand.
          </p>
          <Button 
            onClick={() => navigate('/summarize')} 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
          >
            Try the Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <TimelineSection />
      <KeyFeaturesSection />
      <UseCaseGallery />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
