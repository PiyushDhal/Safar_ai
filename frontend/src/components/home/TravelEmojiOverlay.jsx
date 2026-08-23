import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 rocket along a smooth orbital curved arc that follows the round contour
 * and rotation of the Earth globe.
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
          x: ['12vw', '36vw', '64vw', '82vw', '50vw', '12vw'],
          y: ['52vh', '18vh', '14vh', '46vh', '62vh', '52vh'],
          rotate: [-35, 15, 70, 135, 210, -35],
          scale: [0.85, 1.2, 1.15, 0.85, 0.7, 0.85],
          opacity: [0.2, 1, 1, 0.85, 0.3, 0.2],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glowing Cyan Engine Thruster Exhaust */}
        <div className="absolute h-10 w-10 rounded-full bg-cyan-400/30 blur-md" />
        <div className="absolute h-7 w-7 rounded-full border border-cyan-400/70 shadow-[0_0_18px_rgba(6,182,212,0.9)] animate-pulse" />

        {/* Rocket Emoji */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 2.2,
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
