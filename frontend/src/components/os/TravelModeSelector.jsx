import React from 'react';
import { useTravelOS } from '../../context/TravelOSContext';
import Icon from '../ui/Icon';

const AI_MODES = [
  { id: 'Explorer', label: 'Explorer', icon: 'compass' },
  { id: 'Budget Saver', label: 'Budget Saver', icon: 'wallet' },
  { id: 'Adventure', label: 'Adventure', icon: 'sparkles' },
  { id: 'Couple', label: 'Couple', icon: 'heart' },
  { id: 'Family', label: 'Family', icon: 'users' },
  { id: 'Backpacker', label: 'Backpacker', icon: 'luggage' },
  { id: 'Weekend Escape', label: 'Weekend Escape', icon: 'calendar' },
  { id: 'Luxury', label: 'Luxury', icon: 'award' },
];

export default function TravelModeSelector() {
  const { aiMode, setAIMode } = useTravelOS();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-2 backdrop-blur-xl shadow-2xl">
      <span className="px-3 text-2xs font-extrabold uppercase tracking-wider text-cyan-400">
        AI Travel Mode:
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {AI_MODES.map((mode) => {
          const isActive = aiMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setAIMode(mode.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon name={mode.icon} size="xs" />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
