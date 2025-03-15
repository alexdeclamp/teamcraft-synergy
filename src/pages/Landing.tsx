
import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import TimelineSection from '@/components/landing/TimelineSection';
import UseCaseGallery from '@/components/landing/UseCaseGallery';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import KeyFeaturesSection from '@/components/landing/KeyFeaturesSection';
import CtaSection from '@/components/landing/CtaSection';
import FooterSection from '@/components/landing/FooterSection';
import { InvitationBanner } from '@/components/ui/invitation-banner';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="flex flex-col">
        {isMobile ? (
          <>
            <InvitationBanner />
            <LandingNavbar />
          </>
        ) : (
          <>
            <InvitationBanner />
            <div className="pt-10">
              <LandingNavbar />
            </div>
          </>
        )}
      </div>
      <HeroSection />
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
