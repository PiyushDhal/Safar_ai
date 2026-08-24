import React from 'react';
import { cn } from '../../lib/cn';

/**
 * CloudAtmosphere — Ethereal, GPU-accelerated animated cloud backdrop layer.
 * Creates organic drifting clouds and misty sky depth for hero and page backdrops.
 */
export default function CloudAtmosphere({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none z-0 opacity-75 dark:opacity-45 transition-opacity duration-1000',
        className
      )}
    >
      {/* Drifting Soft Cloud 1 */}
      <div className="absolute -top-12 left-[-10%] h-[32rem] w-[50rem] rounded-full bg-gradient-to-r from-sky-200/40 via-cyan-100/30 to-indigo-100/20 blur-3xl dark:from-sky-900/30 dark:via-indigo-950/20 dark:to-cyan-900/10 animate-cloud-drift-slow" />

      {/* Drifting Soft Cloud 2 */}
      <div className="absolute top-[20%] right-[-15%] h-[28rem] w-[45rem] rounded-full bg-gradient-to-l from-indigo-200/35 via-sky-100/25 to-blue-200/20 blur-3xl dark:from-indigo-900/30 dark:via-sky-950/20 dark:to-slate-900/10 animate-cloud-drift-medium" />

      {/* Central Ethereal Fog Layer */}
      <div className="absolute top-[40%] left-[15%] h-[24rem] w-[40rem] rounded-full bg-gradient-to-tr from-white/40 via-cyan-100/20 to-transparent blur-[100px] dark:from-cyan-950/25 dark:via-slate-900/15 animate-cloud-pulse" />

      {/* Atmospheric Mist Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(255,255,255,0.4),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(15,23,42,0.6),transparent)]" />
    </div>
  );
}
