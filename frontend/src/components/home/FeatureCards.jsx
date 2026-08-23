import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Icon from '../ui/Icon';
import Tabs from '../ui/Tabs';
import { SectionHeader, Reveal } from '../ui/Section';
import { modules, moduleCategories } from '../../data/modules';

function TiltGlassCard({ module, index }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="relative h-full perspective-1000"
    >
      <Link
        to={module.route}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-line/60 bg-white/90 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-950/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10"
      >
        {/* Mouse Follow Glow Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl transition-all duration-500 group-hover:bg-cyan-400/20 dark:group-hover:bg-cyan-400/30"
        />

        <div className="relative mb-4 flex items-center justify-between gap-3" style={{ transform: 'translateZ(20px)' }}>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-6">
            <Icon name={module.icon} size="md" />
          </span>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
            {module.category}
          </span>
        </div>

        <h3 className="relative text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors" style={{ transform: 'translateZ(15px)' }}>
          {module.title}
        </h3>
        <p className="relative mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300" style={{ transform: 'translateZ(10px)' }}>
          {module.description}
        </p>

        <div className="relative mt-3 grid grid-rows-[0fr] overflow-hidden transition-all duration-300 ease-smooth group-hover:grid-rows-[1fr]">
          <p className="overflow-hidden text-xs leading-5 text-slate-500 dark:text-slate-400">{module.detail}</p>
        </div>

        <span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-300" style={{ transform: 'translateZ(15px)' }}>
          Launch Module
          <Icon
            name="arrowRight"
            size="xs"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </Link>
    </motion.div>
  );
}

export default function FeatureCards() {
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () => (category === 'All' ? modules : modules.filter((module) => module.category === category)),
    [category]
  );

  const tabs = moduleCategories.map((item) => ({
    value: item,
    label: item,
    count: item === 'All' ? modules.length : modules.filter((module) => module.category === item).length,
  }));

  return (
    <section aria-labelledby="modules-heading" className="space-y-6 my-16">
      <SectionHeader
        eyebrow="AI Core Architecture"
        icon="layers"
        title="Connected Travel Intelligence Suite"
        description="Nine specialized modules operating on unified real-time destination data."
        action={<Tabs tabs={tabs} value={category} onChange={setCategory} size="sm" />}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((module, index) => (
          <TiltGlassCard key={module.id} module={module} index={index} />
        ))}
      </div>
    </section>
  );
}
