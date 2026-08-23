import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import HeroSection from '../components/home/HeroSection';
import InteractiveTravelGlobeSection from '../components/home/InteractiveTravelGlobeSection';
import { HowItWorks, Testimonials, TrustBar } from '../components/home/Sections';
import { Reveal } from '../components/ui/Section';
import FeatureCards from '../components/home/FeatureCards';

function HomePage() {
  usePageMeta(
    'SafarAI | Cinematic AI Travel Intelligence Platform',
    'SafarAI helps travelers plan smarter and safer with AI itinerary generation, 3D destination intelligence, transport tools, and personalized recommendations.'
  );

  return (
    <div className="space-y-12">
      {/* Central Command Center Hero */}
      <HeroSection />

      <div className="content-grid space-y-16 pb-16 sm:space-y-20">
        <Reveal>
          <TrustBar />
        </Reveal>

        {/* Interactive Globe Section */}
        <Reveal>
          <InteractiveTravelGlobeSection />
        </Reveal>

        <HowItWorks />
        <FeatureCards />
        <Testimonials />
      </div>
    </div>
  );
}

export default HomePage;
