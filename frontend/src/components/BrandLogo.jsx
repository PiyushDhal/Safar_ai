import React from 'react';
import { cn } from '../lib/cn';

/**
 * BrandLogo — Official VibeVoyage Brand Logo.
 * Renders the glowing VibeVoyage globe flight mark alongside full VibeVoyage typography
 * and the official "EXPLORE • PLAN • VIBE" tagline.
 */
function BrandLogo({ compact = false, className, inverted = false }) {
  return (
    <span className={cn('group inline-flex items-center gap-3 select-none', className)}>
      {/* High-tech Glowing Icon Mark */}
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 border border-cyan-500/40 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 ease-spring group-hover:scale-105 group-hover:border-cyan-400 group-hover:shadow-[0_0_22px_rgba(6,182,212,0.5)]">
        <img
          src="/logo.jpg"
          alt="VibeVoyage Mark"
          className="h-full w-full rounded-lg object-cover"
        />
      </span>

      {!compact && (
        <span className="flex flex-col justify-center leading-none">
          <span className="flex items-center text-xl font-black tracking-tight">
            <span
              className={cn(
                'brand-title font-black tracking-tight',
                inverted ? 'text-white' : 'text-slate-900 dark:text-white'
              )}
            >
              Vibe
            </span>
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent font-black drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              Voyage
            </span>
          </span>
          <span
            className={cn(
              'mt-1 text-[9.5px] font-extrabold uppercase tracking-[0.18em]',
              inverted ? 'text-cyan-300/90' : 'text-cyan-600 dark:text-cyan-400'
            )}
          >
            EXPLORE • PLAN • VIBE
          </span>
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
