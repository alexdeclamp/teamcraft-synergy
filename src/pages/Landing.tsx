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
  return <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation bar */}
      <LandingNavbar />
      
      <HeroSection />
      
      {/* Demo CTA Banner */}
      
      
      <TimelineSection />
      <KeyFeaturesSection />
      <UseCaseGallery />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </div>;
};
export default Landing;