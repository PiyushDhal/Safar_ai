import React from 'react';
import { useTravelOS } from '../../context/TravelOSContext';
import Icon from '../ui/Icon';

export default function WhySafarAIChoseThis() {
  const { activeDestination, intent } = useTravelOS();

  if (!activeDestination?.intel) return null;

  const { overallScore, budgetScore, safetyScore, weatherScore, foodScore, accessibilityScore, explainableReasoning } =
    activeDestination.intel;

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Icon name="sparkles" size="sm" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-white">Why SafarAI Chose {activeDestination.name}</h3>
            <p className="text-2xs font-semibold text-slate-400">Explainable AI Recommendation Matrix</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 text-right">
          <span className="text-2xl font-black text-cyan-400">{overallScore}</span>
          <span className="text-3xs font-bold uppercase tracking-wider text-cyan-300">/ 100<br />Match</span>
        </div>
      </div>

      {/* 6 Dimension Score Progress Bars */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/80 p-3">
          <span className="text-2xs font-bold text-slate-400">Budget Score</span>
          <p className="mt-0.5 text-lg font-black text-emerald-400">{budgetScore}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-3">
          <span className="text-2xs font-bold text-slate-400">Safety Index</span>
          <p className="mt-0.5 text-lg font-black text-cyan-400">{safetyScore}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-3">
          <span className="text-2xs font-bold text-slate-400">Weather Index</span>
          <p className="mt-0.5 text-lg font-black text-amber-400">{weatherScore}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-3">
          <span className="text-2xs font-bold text-slate-400">Food Score</span>
          <p className="mt-0.5 text-lg font-black text-indigo-400">{foodScore}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-3">
          <span className="text-2xs font-bold text-slate-400">Accessibility</span>
          <p className="mt-0.5 text-lg font-black text-purple-400">{accessibilityScore}/100</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-3">
          <span className="text-2xs font-bold text-slate-400">Departure Link</span>
          <p className="mt-0.5 text-sm font-extrabold text-white">{intent.departure}</p>
        </div>
      </div>

      {/* Reasoning Bullet Points */}
      <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4">
        {explainableReasoning.map((reason, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-2xs">
              ✓
            </span>
            {reason}
          </div>
        ))}
      </div>
    </div>
  );
}
