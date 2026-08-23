import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../ui/Icon';

const STREAMING_LOGS = [
  '⚡ Synthesizing 14,820 historical flight vectors...',
  '🌡️ Cross-referencing monsoon predictive indices for Goa & Kerala...',
  '🏨 Filtering 4,200 verified boutique hotel suites with high rating...',
  '🛡️ Real-time safety telemetry updated: 94/100 index for Shimla region...',
  '💰 Budget optimizer running: 14% cost reduction identified on mid-week stays...',
  '🚆 Railway PNR intelligence synced: 98.2% confirmation probability...',
];

const METRICS = [
  { label: 'Neural Routes Evaluated', value: '142,850+', change: '+12.4%', icon: 'sparkles', color: 'from-cyan-500 to-blue-600' },
  { label: 'Predictive Price Precision', value: '98.4%', change: 'Real-time', icon: 'wallet', color: 'from-indigo-500 to-purple-600' },
  { label: 'Safety Telemetry Nodes', value: '1,240', change: 'Active', icon: 'shield', color: 'from-pink-500 to-rose-600' },
  { label: 'Average Plan Time', value: '1.4 sec', change: 'Instant AI', icon: 'zap', color: 'from-amber-400 to-orange-500' },
];

const AI_RECOMMENDATIONS = [
  {
    title: 'Manali Snow Pass & Solang Valley',
    matchScore: '99.2% AI Match',
    style: 'Adventure · Nature',
    days: '5 Days',
    estBudget: '₹18,500',
    tags: ['Best Season', 'High Safety Score', 'Instant Booking'],
    reasoning: 'AI detected low crowd density & optimal weather conditions for Solang paragliding over the next 14 days.',
  },
  {
    title: 'Jaipur & Udaipur Heritage Circuit',
    matchScore: '97.8% AI Match',
    style: 'Cultural · Luxury Stays',
    days: '6 Days',
    estBudget: '₹28,200',
    tags: ['Palace Hotels', 'Curated Food Route'],
    reasoning: 'Boutique heritage stays in Haveli quarter currently offering 18% off seasonal rates.',
  },
  {
    title: 'Coorg Tea Estates & Waterfalls',
    matchScore: '96.5% AI Match',
    style: 'Relaxation · Eco Stays',
    days: '4 Days',
    estBudget: '₹14,200',
    tags: ['Private Villa', 'Scenic Drive'],
    reasoning: 'Coffee blossom season peak starting this weekend with ideal driving conditions from Bengaluru.',
  },
];

export default function AITravelIntelligence() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % STREAMING_LOGS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative my-24 overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950/70 p-6 sm:p-12 shadow-2xl backdrop-blur-xl">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px]" />

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
          <Icon name="sparkles" size="xs" className="animate-spin text-cyan-400" />
          Autonomous Travel Intelligence Matrix
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Real-Time AI Trip Construction
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          SafarAI dynamically computes weather patterns, pricing fluctuations, safety feeds, and local crowds to build precision itineraries in seconds.
        </p>
      </div>

      {/* Live AI Telemetry Data Stream */}
      <div className="relative z-10 mt-8 rounded-2xl border border-line bg-slate-900/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-line/60 pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Neural Engine Live Log Stream
          </div>
          <span className="text-2xs font-mono text-slate-400">STATUS: ACTIVE · 60 FPS</span>
        </div>
        <div className="h-8 overflow-hidden relative">
          <motion.div
            key={logIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="text-xs sm:text-sm font-mono text-slate-200 flex items-center gap-2"
          >
            {STREAMING_LOGS[logIndex]}
          </motion.div>
        </div>
      </div>

      {/* Dynamic AI Metrics Grid */}
      <div className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {METRICS.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl border border-line bg-slate-900/60 p-5 backdrop-blur-md shadow-lg group hover:border-cyan-500/40 transition-all"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.color}`} />
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                {metric.change}
              </span>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation Cards Emerging from Depth */}
      <div className="relative z-10 mt-12 space-y-6">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Icon name="sparkles" size="sm" className="text-cyan-400" />
          Generative Travel Recommendations
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {AI_RECOMMENDATIONS.map((rec, idx) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-line bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-xl shadow-xl hover:border-cyan-400/50 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-2xs font-bold text-cyan-300">
                    {rec.matchScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{rec.days}</span>
                </div>
                <h4 className="mt-4 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {rec.title}
                </h4>
                <p className="mt-1 text-xs text-slate-400 font-medium">{rec.style}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-line/40">
                  "{rec.reasoning}"
                </p>
              </div>

              <div className="mt-6 border-t border-line/60 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Total</span>
                  <span className="text-base font-extrabold text-white">{rec.estBudget}</span>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95">
                  Plan This <Icon name="arrowRight" size="xs" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
