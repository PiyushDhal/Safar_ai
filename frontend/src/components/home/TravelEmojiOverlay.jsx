import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 rocket with organic waypoints, pausing at travel destinations
 * and matching the slow rotation pace of the Earth globe.
 */
export default function TravelEmojiOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          // Multi-directional waypoints arcing around the globe surface
          x: ['18vw', '44vw', '47vw', '74vw', '76vw', '54vw', '26vw', '18vw'],
          y: ['50vh', '20vh', '21vh', '36vh', '37vh', '60vh', '40vh', '50vh'],
          rotate: [-35, 20, 15, 80, 75, 165, 225, -35],
          scale: [0.85, 1.2, 1.2, 1.05, 1.05, 0.8, 0.95, 0.85],
          opacity: [0.3, 1, 1, 0.95, 0.95, 0.45, 0.85, 0.3],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          // Keyframe timing pauses matching globe auto-rotation speed
          times: [0, 0.22, 0.28, 0.48, 0.54, 0.74, 0.82, 1],
        }}
      >
        {/* Glowing Cyan Thruster Exhaust */}
        <div className="absolute h-10 w-10 rounded-full bg-cyan-400/30 blur-md" />
        <div className="absolute h-7 w-7 rounded-full border border-cyan-400/70 shadow-[0_0_18px_rgba(6,182,212,0.9)] animate-pulse" />

        {/* Gentle Floating Rocket Bobbing */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative text-3xl sm:text-4xl drop-shadow-[0_0_14px_rgba(6,182,212,0.95)]"
        >
          <span>🚀</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
