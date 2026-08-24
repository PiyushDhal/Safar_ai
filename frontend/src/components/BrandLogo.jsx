import React from 'react';
import { cn } from '../lib/cn';

/**
 * BrandLogo — Official Yatri AI Brand Logo.
 * Displays the high-tech globe flight mark alongside full YATRI AI typography 
 * and the "HAR YATRA, SMART YATRA" slogan to fill the navigation bar header.
 */
function BrandLogo({ compact = false, className, inverted = false }) {
  return (
    <span className={cn('group inline-flex items-center gap-3 select-none', className)}>
      {/* High-tech Glowing Icon Container */}
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 border border-cyan-500/40 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 ease-spring group-hover:scale-105 group-hover:border-cyan-400 group-hover:shadow-[0_0_22px_rgba(6,182,212,0.5)]">
        <img
          src="/logo.jpg"
          alt="Yatri AI Mark"
          className="h-full w-full rounded-lg object-cover"
        />
      </span>

      {!compact && (
        <span className="flex flex-col justify-center leading-none">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                'brand-title font-black text-xl tracking-tight',
                inverted ? 'text-white' : 'text-slate-900 dark:text-white'
              )}
            >
              YATRI
            </span>
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent text-xl font-black drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              AI
            </span>
          </span>
          <span
            className={cn(
              'mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em]',
              inverted ? 'text-cyan-300/90' : 'text-cyan-600 dark:text-cyan-400'
            )}
          >
            HAR YATRA, SMART YATRA
          </span>
        </span>
      )}
    </span>
  );
}

export default BrandLogo;
