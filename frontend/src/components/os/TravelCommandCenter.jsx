import React from 'react';
import { useTravelOS } from '../../context/TravelOSContext';
import TravelModeSelector from './TravelModeSelector';
import WhyYatriAIChoseThis from './WhySafarAIChoseThis';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

export default function TravelCommandCenter() {
  const {
    intent,
    updateIntent,
    activeDestination,
    budgetBreakdown,
    activeTab,
    setActiveTab,
    rankedDestinations,
    selectDestination,
  } = useTravelOS();

  if (!activeDestination) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'sparkles' },
    { id: 'itinerary', label: 'Itinerary', icon: 'calendar' },
    { id: 'hotels', label: 'Hotels', icon: 'home' },
    { id: 'food', label: 'Food & Culture', icon: 'coffee' },
    { id: 'transport', label: 'Transport', icon: 'compass' },
    { id: 'budget', label: 'Live Budget', icon: 'wallet' },
    { id: 'safety', label: 'Safety Index', icon: 'shield' },
  ];

  return (
    <section className="space-y-8 my-12">
      {/* Top OS Command Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-white">
              <Icon name="sparkles" size="xs" /> Travel OS V2
            </span>
            <span className="text-xs font-bold text-cyan-400">
              Active Intent: {intent.duration} days from {intent.departure} · ₹{intent.budget?.toLocaleString()}
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-black text-white">
            Travel Command Center — {activeDestination.name}
          </h2>
        </div>

        <TravelModeSelector />
      </div>

      {/* Recommended Destination Selector Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
          AI Candidate Rank:
        </span>
        {rankedDestinations.slice(0, 5).map((dest, idx) => {
          const isSelected = activeDestination.slug === dest.slug || activeDestination.id === dest.id;
          return (
            <button
              key={dest.slug || dest.id}
              onClick={() => selectDestination(dest)}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-2xs font-black text-cyan-400">
                #{idx + 1}
              </span>
              <span>{dest.name}</span>
              <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-3xs font-extrabold text-emerald-400">
                {dest.intel?.overallScore || 90}pt
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 p-1.5 backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon name={tab.icon} size="xs" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <WhyYatriAIChoseThis />

            {/* Quick Destination Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-cyan-400">
                  Destination Telemetry
                </span>
                <h3 className="mt-1 text-2xl font-black text-white">{activeDestination.name}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  {activeDestination.description || activeDestination.tagline || 'Optimal travel destination matched to your trip intent.'}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <span className="text-2xs font-bold text-slate-400">Est. Daily Budget</span>
                    <p className="mt-0.5 text-lg font-black text-white">₹{activeDestination.intel?.dailyCost || 3500}/day</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-3">
                    <span className="text-2xs font-bold text-slate-400">Best Season</span>
                    <p className="mt-0.5 text-sm font-extrabold text-cyan-300">{activeDestination.bestTime || 'Oct - Mar'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button onClick={() => setActiveTab('itinerary')} leadingIcon="sparkles" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
                  View Full Itinerary
                </Button>
                <Button onClick={() => setActiveTab('budget')} variant="glass" className="border-cyan-500/30 text-white">
                  Adjust Budget
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === 'itinerary' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <h3 className="text-xl font-black text-white">Neural {intent.duration}-Day Itinerary for {activeDestination.name}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: intent.duration }).map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-cyan-400">Day {idx + 1}</span>
                    <span className="text-3xs font-bold text-slate-400">Morning & Afternoon</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-white">
                    {idx === 0
                      ? `Arrival in ${activeDestination.name} & Hotel Check-in`
                      : idx === 1
                      ? 'Local Cultural Sightseeing & Heritage Exploration'
                      : idx === 2
                      ? 'Nature Trail Trek & Sunset Viewpoint'
                      : 'Culinary Night Market & Departure Preparation'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Guided itinerary activities matched to {intent.category} travel preference.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIVE BUDGET ENGINE TAB */}
        {activeTab === 'budget' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Dynamic Budget Allocation Engine</h3>
              <p className="text-xs text-slate-400">Slide total budget to recalculate category allocations in real-time.</p>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <span>Total Trip Budget Cap</span>
                <span className="text-lg font-black text-cyan-400">₹{intent.budget?.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={intent.budget || 20000}
                onChange={(e) => updateIntent({ budget: parseInt(e.target.value, 10) })}
                className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Live Recalculated Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="rounded-2xl bg-slate-900/90 p-4 border border-cyan-500/20">
                <span className="text-2xs font-bold text-slate-400">Hotels (35%)</span>
                <p className="mt-1 text-lg font-black text-cyan-400">₹{budgetBreakdown.hotels.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-4 border border-indigo-500/20">
                <span className="text-2xs font-bold text-slate-400">Transport (25%)</span>
                <p className="mt-1 text-lg font-black text-indigo-400">₹{budgetBreakdown.transport.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-4 border border-emerald-500/20">
                <span className="text-2xs font-bold text-slate-400">Food (20%)</span>
                <p className="mt-1 text-lg font-black text-emerald-400">₹{budgetBreakdown.food.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-4 border border-purple-500/20">
                <span className="text-2xs font-bold text-slate-400">Activities (12%)</span>
                <p className="mt-1 text-lg font-black text-purple-400">₹{budgetBreakdown.activities.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-4 border border-amber-500/20">
                <span className="text-2xs font-bold text-slate-400">Buffer (8%)</span>
                <p className="mt-1 text-lg font-black text-amber-400">₹{budgetBreakdown.buffer.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* HOTELS TAB */}
        {activeTab === 'hotels' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <h3 className="text-xl font-black text-white">Recommended Stays in {activeDestination.name}</h3>
            <p className="text-xs text-slate-400">Curated accommodations matching ₹{budgetBreakdown.hotels.toLocaleString()} hotel budget cap.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {['Boutique Eco Resort', 'Heritage View Stay', 'Backpacker Social Hostel'].map((stay, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <span className="text-3xs font-bold text-cyan-400 uppercase">Option #{idx + 1}</span>
                  <h4 className="mt-1 text-sm font-extrabold text-white">{stay}</h4>
                  <p className="mt-1 text-xs text-emerald-400 font-bold">₹{Math.round(budgetBreakdown.hotels / intent.duration)} / night</p>
                  <p className="mt-2 text-2xs text-slate-400">Verified reviews · Free Wifi · Breakfast included</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOD TAB */}
        {activeTab === 'food' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <h3 className="text-xl font-black text-white">Food & Culinary Culture in {activeDestination.name}</h3>
            <p className="text-xs text-slate-400">Culinary rating {activeDestination.intel?.foodScore}/100 verified.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <h4 className="text-sm font-bold text-cyan-400">Local Must-Try Specialties</h4>
                <p className="mt-1 text-xs text-slate-300">Authentic regional dishes, traditional breakfast, and seasonal desserts.</p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <h4 className="text-sm font-bold text-indigo-400">Night Markets & Food Trails</h4>
                <p className="mt-1 text-xs text-slate-300">Popular street food hubs and recommended hygiene-verified eateries.</p>
              </div>
            </div>
          </div>
        )}

        {/* TRANSPORT TAB */}
        {activeTab === 'transport' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <h3 className="text-xl font-black text-white">Transit Routes from {intent.departure} to {activeDestination.name}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <span className="text-2xs font-bold text-cyan-400">Option 1 · Express Train</span>
                <p className="mt-1 text-sm font-bold text-white">Superfast Direct Train</p>
                <p className="mt-0.5 text-xs text-slate-400">Est. duration: 6h 30m · Approx ₹1,200</p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
                <span className="text-2xs font-bold text-indigo-400">Option 2 · Flight Link</span>
                <p className="mt-1 text-sm font-bold text-white">Direct Non-stop Flight</p>
                <p className="mt-0.5 text-xs text-slate-400">Est. duration: 1h 45m · Approx ₹3,800</p>
              </div>
            </div>
          </div>
        )}

        {/* SAFETY TAB */}
        {activeTab === 'safety' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-black text-white">Safety Telemetry — {activeDestination.name}</h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                Safety Index: {activeDestination.intel?.safetyScore}/100 (Verified Safe)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Verified local safety index, solo-traveler rating, emergency hotline access, and medical desk proximity.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
