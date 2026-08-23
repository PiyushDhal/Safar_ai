import React from 'react';
import { motion } from 'framer-motion';

/**
 * TravelEmojiOverlay — a lightweight, non-destructive HTML overlay component.
 * Animates a 🚀 rocket in a continuous, ultra-smooth 3D orbital loop with 0 pauses:
 * - Front pass: Arcs smoothly across the upper face of the globe (scaling & full opacity).
 * - Back pass: Loops seamlessly around the back half, completely hidden (opacity: 0).
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
            // Continuous smooth orbital loop around the 3D globe sphere
            x: ['-30vw', '-15vw', '0vw', '15vw', '30vw', '18vw', '0vw', '-18vw', '-30vw'],
            y: ['5vh', '-6vh', '-12vh', '-6vh', '5vh', '16vh', '20vh', '16vh', '5vh'],
            rotate: [-28, -12, 0, 12, 28, 100, 180, -100, -28],
            scale: [0.85, 1.15, 1.35, 1.15, 0.85, 0.55, 0.45, 0.55, 0.85],
            // Full opacity on front pass (1), completely hidden (0) when passing behind globe
            opacity: [1, 1, 1, 1, 0, 0, 0, 0, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'linear',
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
