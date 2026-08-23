import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import HeroSection from '../components/home/HeroSection';
import TravelCommandCenter from '../components/os/TravelCommandCenter';
import InteractiveTravelGlobeSection from '../components/home/InteractiveTravelGlobeSection';
import { HowItWorks, Testimonials, TrustBar } from '../components/home/Sections';
import { Reveal } from '../components/ui/Section';
import FeatureCards from '../components/home/FeatureCards';

function HomePage() {
  usePageMeta(
    'SafarAI | AI Travel Operating System',
    'SafarAI is a unified AI Travel Operating System with an intent engine, destination intelligence scoring, functional 3D globe visualization, and instant command center dashboard.'
  );

  return (
    <div className="space-y-12">
      {/* Step 1: Central Command Center Hero */}
      <HeroSection />

      <div className="content-grid space-y-16 pb-16 sm:space-y-20">
        <Reveal>
          <TrustBar />
        </Reveal>

        {/* Step 5: Unified Travel Command Center Dashboard */}
        <Reveal>
          <TravelCommandCenter />
        </Reveal>

        {/* Interactive Functional Globe Section */}
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
