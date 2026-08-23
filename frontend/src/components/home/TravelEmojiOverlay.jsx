import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 rocket traveling left-to-right along the Earth's natural rotation direction,
 * matching its steady pace and fading out completely when passing behind the globe.
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
          // West-to-East rotation path matching Earth's rotation
          x: ['-5vw', '15vw', '45vw', '75vw', '95vw', '95vw', '-5vw'],
          y: ['52vh', '48vh', '45vh', '48vh', '52vh', '52vh', '52vh'],
          rotate: [18, 12, 0, -12, -18, -18, 18],
          scale: [0.75, 1.0, 1.18, 1.0, 0.75, 0.5, 0.5],
          // Completely hidden (opacity: 0) while rounding behind the back of the globe
          opacity: [0, 1, 1, 1, 0, 0, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
          times: [0, 0.15, 0.45, 0.75, 0.88, 0.95, 1],
        }}
      >
        {/* Clean Rocket Emoji with gentle float */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative text-3xl sm:text-4xl drop-shadow-md"
        >
          <span>🚀</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
