import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../ui/Section';
import Button from '../ui/Button';
import RealisticGlobe from '../geo/RealisticGlobe';
import { destinations } from '../../data/destinations';

export default function InteractiveTravelGlobeSection() {
  const navigate = useNavigate();
  const globeRef = useRef(null);

  const handleSelect = (dest) => {
    if (dest?.slug) {
      navigate(`/destination/${dest.slug}`);
    }
  };

  return (
    <section aria-labelledby="interactive-globe-heading" className="space-y-6 my-20">
      <SectionHeader
        eyebrow="3D Global Network"
        icon="globe"
        title="Interactive Travel Intelligence Globe"
        description="Explore 3D destination hubs, real-time safety scores, and climate telemetry across major international destinations."
        action={
          <Button to="/world" size="sm" leadingIcon="globe" className="bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30">
            Open Full Screen Explorer
          </Button>
        }
      />

      <div className="relative h-[560px] sm:h-[640px] overflow-hidden rounded-3xl border border-slate-200 dark:border-line/80 bg-slate-900 dark:bg-slate-950 shadow-2xl backdrop-blur-2xl">
        <RealisticGlobe
          ref={globeRef}
          destinations={destinations}
          onSelect={handleSelect}
          autoRotate={true}
          showClouds={true}
          showLabels={true}
          quality="high"
          className="w-full h-full"
        />
      </div>
    </section>
  );
}
