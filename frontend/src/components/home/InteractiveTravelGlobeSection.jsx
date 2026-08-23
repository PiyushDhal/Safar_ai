import React from 'react';
import { SectionHeader } from '../ui/Section';
import Button from '../ui/Button';
import CinematicGlobe3D from '../3d/CinematicGlobe3D';

export default function InteractiveTravelGlobeSection() {
  return (
    <section aria-labelledby="interactive-globe-heading" className="space-y-6 my-20">
      <SectionHeader
        eyebrow="3D Global Network"
        icon="globe"
        title="Interactive Travel Intelligence Globe"
        description="Explore 3D flight connections, real-time safety scores, and climate telemetry across major international hubs."
        action={
          <Button to="/world" size="sm" leadingIcon="globe" className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30">
            Open Full Screen Explorer
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl backdrop-blur-2xl">
        <CinematicGlobe3D />
      </div>
    </section>
  );
}
