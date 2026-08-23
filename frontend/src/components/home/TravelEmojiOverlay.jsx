import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 (or fallback ✈️) emoji floating slowly across the screen
 * using Framer Motion without touching or modifying any Globe code.
 */
export default function TravelEmojiOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        className="absolute top-[28%] left-0 flex items-center justify-center"
        initial={{ x: '-15vw', y: '5vh', rotate: 22, opacity: 0 }}
        animate={{
          x: ['-10vw', '35vw', '75vw', '110vw'],
          y: ['5vh', '-3vh', '4vh', '-2vh'],
          rotate: [20, 28, 18, 25],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Subtle Cyan Glowing Ambient Halo */}
        <div className="absolute h-10 w-10 rounded-full bg-cyan-400/25 blur-md" />
        <div className="absolute h-7 w-7 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.7)] animate-ping" />

        {/* Floating Gentle Bobbing Motion container */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
        >
          <span>🚀</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
