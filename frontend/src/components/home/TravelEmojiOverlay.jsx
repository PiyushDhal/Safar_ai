import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 rocket along a 360° 3D elliptical orbit around the Earth sphere:
 * - Front pass: Large, bright, arcing across the front face.
 * - Back pass: Scales down and fades out completely behind the back of the globe.
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
          // 360° Elliptical orbit around the globe sphere
          x: ['18vw', '50vw', '82vw', '88vw', '50vw', '12vw', '18vw'],
          y: ['56vh', '34vh', '48vh', '58vh', '66vh', '64vh', '56vh'],
          rotate: [32, 8, -25, -55, -140, 150, 32],
          scale: [0.85, 1.35, 0.95, 0.65, 0.45, 0.6, 0.85],
          // Opacity: 1 on front pass, 0 when passing behind the globe
          opacity: [1, 1, 0.9, 0, 0, 0, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.35, 0.65, 0.72, 0.85, 0.94, 1],
        }}
      >
        {/* Clean Rocket Emoji with gentle float */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 2.2,
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
