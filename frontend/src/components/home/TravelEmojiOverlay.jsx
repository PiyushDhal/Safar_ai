import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 rocket along an orbital trajectory centered around the Earth sphere:
 * - Front pass: Arcs smoothly across the upper face of the globe (scaling & full opacity).
 * - Back pass: Loops around the back half, completely hidden (opacity: 0).
 */
export default function TravelEmojiOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      aria-hidden="true"
    >
      {/* Centered Rocket Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
        <motion.div
          className="absolute flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{
            // Centered orbital trajectory around the 3D globe sphere
            x: ['-32vw', '-16vw', '0vw', '16vw', '32vw', '22vw', '-22vw', '-32vw'],
            y: ['6vh', '-6vh', '-14vh', '-6vh', '6vh', '18vh', '20vh', '6vh'],
            rotate: [-30, -12, 0, 12, 30, 115, -145, -30],
            scale: [0.85, 1.15, 1.35, 1.15, 0.85, 0.5, 0.45, 0.85],
            // Full opacity on front pass (1), completely hidden (0) when passing behind globe
            opacity: [1, 1, 1, 1, 0, 0, 0, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.18, 0.36, 0.54, 0.68, 0.80, 0.92, 1],
          }}
        >
          {/* Clean Rocket Emoji */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
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
    </div>
  );
}
