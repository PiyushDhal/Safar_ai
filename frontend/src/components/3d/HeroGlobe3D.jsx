import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RealisticGlobe from '../geo/RealisticGlobe';
import { destinations } from '../../data/destinations';

export default function HeroGlobe3D({ className = '' }) {
  const navigate = useNavigate();
  const globeRef = useRef(null);

  const handleSelectDestination = (dest) => {
    if (dest?.slug) {
      navigate(`/destination/${dest.slug}`);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] ${className}`}>
      <RealisticGlobe
        ref={globeRef}
        destinations={destinations}
        onSelect={handleSelectDestination}
        autoRotate={true}
        showClouds={true}
        showLabels={true}
        quality="high"
        className="w-full h-full"
      />
    </div>
  );
}
