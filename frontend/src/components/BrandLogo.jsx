import React from 'react';
import { cn } from '../lib/cn';

/**
 * BrandLogo — Official Yatri AI Brand Logo.
 * Renders the custom Yatri AI logo artwork featuring the globe, flight trail, and official tagline.
 */
function BrandLogo({ compact = false, className, inverted = false }) {
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <img
          src="/logo.jpg"
          alt="Yatri AI Mark"
          className="h-9 w-9 rounded-xl object-cover shadow-float border border-cyan-500/30 transition-transform duration-300 group-hover:scale-105"
        />
      </span>
    );
  }

  return (
    <span className={cn('group inline-flex items-center gap-2.5', className)}>
      <img
        src="/logo.jpg"
        alt="Yatri AI — Har Yatra, Smart Yatra"
        className="h-10 w-auto rounded-xl object-contain shadow-float border border-cyan-500/20 transition-transform duration-300 group-hover:scale-105"
      />
    </span>
  );
}

export default BrandLogo;
