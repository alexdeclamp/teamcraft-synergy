
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import TimelineSection from '@/components/landing/TimelineSection';
import UseCaseGallery from '@/components/landing/UseCaseGallery';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CtaSection from '@/components/landing/CtaSection';
import FooterSection from '@/components/landing/FooterSection';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <LandingNavbar />
      <HeroSection />
      <TimelineSection />
      <UseCaseGallery />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
