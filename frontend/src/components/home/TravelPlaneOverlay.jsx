import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelPlaneOverlay — a premium, minimal floating aircraft overlay component.
 * Renders an elegant white ✈︎ aircraft cruising smoothly above the top crest of the globe
 * using Framer Motion without modifying any Globe or Three.js code.
 */
export default function TravelPlaneOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden flex items-start justify-center pt-16 sm:pt-20 md:pt-24"
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          y: [0, -12, 0],
          x: [-14, 14, -14],
          rotate: [-4, 4, -4],
          opacity: [0.85, 0.95, 0.85],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex items-center justify-center text-[32px] md:text-[42px] lg:text-[48px] text-white/95 drop-shadow-[0_0_12px_rgba(255,255,255,0.75)] select-none"
      >
        {/* Soft Ambient White Halo */}
        <div className="absolute h-8 w-8 rounded-full bg-white/10 blur-md pointer-events-none" />

        <span>✈︎</span>
      </motion.div>
    </div>
  );
}
