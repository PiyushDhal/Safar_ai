import React, { useState } from 'react';
import { useTravelOS } from '../../context/TravelOSContext';
import FunctionalGlobe3D from '../3d/FunctionalGlobe3D';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

const PROMPT_EXAMPLES = [
  '3 days in nature under ₹15,000',
  'Family trip from Delhi',
  'Romantic weekend near Bangalore',
  'Adventure trip under ₹25,000',
];

export default function HeroSection() {
  const { intent, submitIntentPrompt, isAnalyzing } = useTravelOS();
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    submitIntentPrompt(inputText);
  };

  const handleChipClick = (prompt) => {
    setInputText(prompt);
    submitIntentPrompt(prompt);
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden py-12 lg:py-0">
      {/* 3D FUNCTIONAL GLOBE BACKGROUND CANVAS */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
        <FunctionalGlobe3D />
      </div>

      {/* Radial Soft Dark Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/80" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(3,7,18,0.85)_100%)]" />

      {/* CENTRAL COMMAND CENTER CONTENT OVERLAY */}
      <div className="content-grid relative z-10 w-full">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 py-1.5 pl-2.5 pr-4 text-xs font-bold text-cyan-300 backdrop-blur-xl shadow-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-2.5 py-0.5 text-2xs font-extrabold uppercase tracking-wider text-white">
              <Icon name="sparkles" size="xs" /> SafarAI OS
            </span>
            Unified AI Travel Operating System
          </span>

          <h1 className="mt-6 text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.05] drop-shadow-2xl">
            Where do you want to go?
          </h1>

          <p className="mt-4 text-lg text-slate-200 sm:text-xl font-medium drop-shadow-md">
            Describe your trip and SafarAI will build it.
          </p>

          {/* AI Intent Command Bar */}
          <form onSubmit={handleSubmit} className="mt-8 relative max-w-xl">
            <div className="flex flex-col gap-2.5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-2.5 shadow-2xl backdrop-blur-2xl sm:flex-row sm:items-center">
              <div className="relative flex flex-1 items-center gap-2.5 px-3">
                <Icon name="search" size="md" className="text-cyan-400" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. 4 days from Delhi under ₹20,000 nature trip..."
                  className="h-12 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <Button
                type="submit"
                leadingIcon="sparkles"
                disabled={isAnalyzing}
                className="shrink-0 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black shadow-lg shadow-cyan-500/30 px-6 py-3"
              >
                {isAnalyzing ? 'Analyzing Intent...' : 'Build Trip OS'}
              </Button>
            </div>
          </form>

          {/* AI Input Prompt Examples Quick-Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">Try AI Prompts:</span>
            {PROMPT_EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => handleChipClick(example)}
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-500/50 hover:bg-slate-800"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
