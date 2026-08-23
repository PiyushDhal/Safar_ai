import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import DestinationImage from '../DestinationImage';
import HeroGlobe3D from '../3d/HeroGlobe3D';
import useCountUp from '../../hooks/useCountUp';
import { destinations } from '../../data/destinations';
import { cn } from '../../lib/cn';

const ROTATING_WORDS = ['smarter', 'safer', 'cheaper', 'together'];

const HERO_STATS = [
  { value: 120, suffix: '+', label: 'Destinations mapped' },
  { value: 38, suffix: 'k', label: 'Itineraries generated' },
  { value: 94, suffix: '%', label: 'Plan-to-trip rate' },
];

function Stat({ value, suffix, label }) {
  const [ref, animated] = useCountUp(value);
  return (
    <div ref={ref} className="text-left">
      <p className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
        {animated}
        <span className="text-cyan-400">{suffix}</span>
      </p>
      <p className="mt-0.5 text-xs font-semibold text-slate-300">{label}</p>
    </div>
  );
}

function FloatingCard({ className, style, children, delay = 0 }) {
  return (
    <div
      className={cn(
        'absolute hidden rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl animate-float-slow lg:block z-20 pointer-events-auto',
        className
      )}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [days, setDays] = useState('4');
  const [suggestOpen, setSuggestOpen] = useState(false);

  const heroContainerRef = useRef(null);
  const headlineRef = useRef(null);
  const searchRef = useRef(null);
  const buttonsRef = useRef(null);

  // GSAP Entrance Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.0 } });

      tl.fromTo(
        headlineRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0 }
      )
        .fromTo(
          searchRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1 },
          '-=0.6'
        )
        .fromTo(
          buttonsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1 },
          '-=0.5'
        );
    }, heroContainerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const suggestions = query.trim()
    ? destinations
        .filter((item) =>
          `${item.name} ${item.country} ${item.state || ''} ${item.tags.join(' ')}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 5)
    : destinations.slice(0, 5);

  const startPlanning = (destinationName) => {
    const value = (destinationName || query).trim();
    navigate(
      `/trip-planner?${new URLSearchParams({
        ...(value ? { destination: value } : {}),
        days,
      }).toString()}`
    );
  };

  return (
    <section
      ref={heroContainerRef}
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden py-12 lg:py-0"
    >
      {/* FULL SCREEN 3D GLOBE CANVAS BACKGROUND */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
        <HeroGlobe3D />
      </div>

      {/* Atmospheric Soft Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/80" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(3,7,18,0.75)_100%)]" />

      {/* Floating Glass Intelligence Cards */}
      <FloatingCard className="left-8 top-28 w-52" delay={0}>
        <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-cyan-400">
          <Icon name="sparkles" size="xs" /> Neural Itinerary
        </p>
        <p className="mt-1 text-sm font-extrabold text-white">Day 3 · Munnar</p>
        <p className="mt-0.5 text-xs text-slate-300">Tea estate sunrise, Eravikulam trek</p>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
        </div>
      </FloatingCard>

      <FloatingCard className="right-10 top-36 w-48" delay={900}>
        <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-emerald-400">
          <Icon name="wallet" size="xs" /> Live Budget
        </p>
        <p className="mt-1 text-lg font-black text-white">₹42,800</p>
        <p className="text-xs text-emerald-400">12% under budget cap</p>
      </FloatingCard>

      <FloatingCard className="right-12 bottom-20 w-48" delay={1800}>
        <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-purple-400">
          <Icon name="shield" size="xs" /> Safety Index
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-black text-white">91/100</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-2xs font-bold text-emerald-300">
            Verified Safe
          </span>
        </div>
      </FloatingCard>

      {/* HERO CONTENT OVERLAY */}
      <div className="content-grid relative z-10 w-full">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 py-1.5 pl-2.5 pr-4 text-xs font-bold text-cyan-300 backdrop-blur-xl shadow-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-2.5 py-0.5 text-2xs font-extrabold uppercase tracking-wider text-white">
              <Icon name="sparkles" size="xs" /> AI-Native 3D
            </span>
            Full-screen global travel intelligence
          </span>

          <div ref={headlineRef}>
            <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-2xl">
              Plan your next journey{' '}
              <span className="relative inline-flex h-[1.1em] overflow-hidden align-bottom">
                <span className="invisible">together</span>
                {ROTATING_WORDS.map((word, index) => (
                  <span
                    key={word}
                    className={cn(
                      'bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent absolute inset-0 transition-all duration-500 ease-smooth font-black',
                      index === wordIndex
                        ? 'translate-y-0 opacity-100'
                        : index === (wordIndex - 1 + ROTATING_WORDS.length) % ROTATING_WORDS.length
                        ? '-translate-y-full opacity-0'
                        : 'translate-y-full opacity-0'
                    )}
                  >
                    {word}
                  </span>
                ))}
              </span>
              <br /> with SafarAI.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg drop-shadow-md">
              An award-winning command center for instant itineraries, live budgets, boutique stays, train booking intelligence and real-time safety scores.
            </p>
          </div>

          {/* Glassmorphic Search Panel */}
          <div ref={searchRef} className="relative mt-8 max-w-xl">
            <div className="flex flex-col gap-2.5 rounded-2xl border border-cyan-500/30 bg-slate-950/85 p-2.5 shadow-2xl backdrop-blur-2xl sm:flex-row sm:items-center">
              <div className="relative flex flex-1 items-center gap-2.5 px-3">
                <Icon name="search" size="md" className="text-cyan-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSuggestOpen(true);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setSuggestOpen(false), 140)}
                  onKeyDown={(e) => e.key === 'Enter' && startPlanning()}
                  placeholder="Where to? Try Goa, Ladakh, Kerala..."
                  aria-label="Destination"
                  className="h-11 w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 border-slate-800 pl-3 sm:border-l">
                <select
                  id="hero-days"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  aria-label="Trip length in days"
                  className="h-11 cursor-pointer rounded-xl border-0 bg-slate-900/90 px-3 text-sm font-bold text-white outline-none"
                >
                  {[2, 3, 4, 5, 6, 7, 10].map((val) => (
                    <option key={val} value={val} className="bg-slate-950 text-white">
                      {val} days
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => startPlanning()}
                  leadingIcon="sparkles"
                  className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/30"
                >
                  Plan Trip
                </Button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl animate-slide-down">
                <p className="px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400">
                  {query.trim() ? 'Matching destinations' : 'Trending this season'}
                </p>
                {suggestions.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(item.name);
                      startPlanning(item.name);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-900/80"
                  >
                    <DestinationImage
                      destination={item}
                      width={160}
                      compact
                      rounded="rounded-lg"
                      className="h-9 w-9 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-white">{item.name}</span>
                      <span className="block truncate text-xs text-slate-400">{item.tagline}</span>
                    </span>
                    <span className="hidden text-xs font-semibold text-cyan-400 sm:block">
                      {item.bestTime}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div ref={buttonsRef} className="mt-6 flex flex-wrap items-center gap-3">
            <Button to="/explore" variant="glass" trailingIcon="arrowRight" className="border-cyan-500/40 text-white bg-slate-950/60 hover:bg-cyan-500/20 backdrop-blur-xl">
              Explore Destinations
            </Button>
            <Button to="/assistant" variant="ghost" leadingIcon="bot" className="text-slate-300 hover:text-white bg-slate-950/40 backdrop-blur-md">
              Ask AI Assistant
            </Button>
          </div>

          {/* Stats Row */}
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-800/80 pt-6">
            {HERO_STATS.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
