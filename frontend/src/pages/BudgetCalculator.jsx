import { useEffect, useMemo, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { PageHeader } from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import EmptyState from '../components/ui/EmptyState';
import { Field, Input, Select, RangeSlider } from '../components/ui/Input';
import { DonutChart } from '../components/charts/Charts';
import { destinationCosts } from '../data/budgetDatabase';
import { stateHotelCosts } from '../data/stateHotelCosts';
import { transportCosts } from '../data/transportCosts';
import { seasonMultipliers } from '../data/seasonMultipliers';
import { formatINR } from '../lib/format';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { useAssistant } from '../context/AssistantContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';

/* Configuration & Data Definitions ----------------------------------------- */

const STYLE_CONFIG = {
  Budget: { multiplier: 0.8, tone: 'success', icon: 'leaf', blurb: 'Hostels, buses, street food' },
  Standard: { multiplier: 1, tone: 'brand', icon: 'compass', blurb: '3-star stays, mixed transport' },
  Luxury: { multiplier: 1.6, tone: 'violet', icon: 'sparkles', blurb: 'Premium hotels, private cabs' },
};

const DESTINATION_STATE_MAP = {
  goa: 'goa',
  manali: 'himachal_pradesh',
  jaipur: 'rajasthan',
  delhi: 'delhi',
  mumbai: 'maharashtra',
  kerala: 'kerala',
  'leh ladakh': 'ladakh',
  rishikesh: 'uttarakhand',
  udaipur: 'rajasthan',
  shimla: 'himachal_pradesh',
  darjeeling: 'west_bengal',
  gangtok: 'sikkim',
  amritsar: 'punjab',
  varanasi: 'uttar_pradesh',
  pondicherry: 'tamil_nadu',
  hampi: 'karnataka',
  ooty: 'tamil_nadu',
  munnar: 'kerala',
  andaman: 'andaman_nicobar',
  lakshadweep: 'lakshadweep',
};

const CATEGORY_META = {
  hotel: { label: 'Stay & Lodging', icon: 'hotel', color: '#6366f1' },
  food: { label: 'Food & Dining', icon: 'utensils', color: '#06b6d4' },
  travel: { label: 'Intercity Transport', icon: 'train', color: '#f59e0b' },
  activities: { label: 'Activities & Tours', icon: 'camera', color: '#10b981' },
  shopping: { label: 'Shopping & Souvenirs', icon: 'bag', color: '#ec4899' },
  buffer: { label: 'Emergency & Buffer Fund', icon: 'shield', color: '#8b5cf6' },
};

const CURRENCIES = {
  INR: { symbol: '₹', rate: 1, label: 'INR (₹)' },
  USD: { symbol: '$', rate: 1 / 83, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 1 / 90, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 1 / 105, label: 'GBP (£)' },
  AED: { symbol: 'AED ', rate: 1 / 22.6, label: 'AED' },
};

const DESTINATION_SAVINGS_TIPS = {
  goa: [
    'Rent a scooter (₹350/day) instead of hiring taxi cabs to save up to ₹1,500 daily.',
    'Eat at local beach shacks or Goan thali spots in Panjim for authentic, low-cost meals.',
    'Travel during shoulder months (Oct/Nov or Mar/Apr) for up to 35% lower beachfront resort prices.'
  ],
  manali: [
    'Take the Volvo night bus from Delhi/Chandigarh to save one night accommodation cost.',
    'Book adventure sports packages directly in Solang Valley rather than through hotel agents.',
    'Stay in Old Manali or Vashisht for budget-friendly homestays with stunning views.'
  ],
  jaipur: [
    'Purchase the Jaipur Composite Ticket (₹300 for students/Indians) covering 8 major monuments.',
    'Use Jaipur Metro and e-rickshaws for fast, budget-friendly local transit around Pink City.',
    'Savor street food at Masala Chowk for multi-cuisine Rajasthani delicacies under ₹300/person.'
  ],
  kerala: [
    'Opt for a day cruise on Alleppey backwaters instead of an overnight houseboat to save 60%.',
    'Stay in approved homestays in Munnar for home-cooked meals included.',
    'Use state-run KSRTC buses or ferry boats for local travel across Kochi & Fort Kochi.'
  ],
  'leh ladakh': [
    'Rent motorcycles in Leh city with group split rather than private SUVs for Pangong/Nubra.',
    'Carry refillable water bottles with purification tablets to avoid buying bottled water.',
    'Book inner line permits online directly on official portal to avoid agent commission.'
  ],
  delhi: [
    'Use Delhi Metro for all sightseeing — get a Tourist Smart Card for unlimited rides.',
    'Eat street food at Chandni Chowk and Connaught Place state bhavans for budget meals.',
    'Visit free attractions like India Gate, Lotus Temple, Lodhi Gardens, and Akshardham.'
  ],
  mumbai: [
    'Travel by Local Train (1st Class pass) or BEST AC buses for lightning fast budget transport.',
    'Explore South Mumbai on foot — Marine Drive, Colaba Causeway, and Fort are walkable.',
    'Enjoy iconic street food: Vada Pav, Pav Bhaji at Juhu, and Irani Cafe bun maska.'
  ],
  default: [
    'Book train tickets 120 days in advance (Tatkal as fallback) to avoid expensive last-minute flights.',
    'Choose stays with complimentary breakfast to eliminate morning dining costs.',
    'Travel off-peak (Mon–Thu) to secure better lodging rates and fewer crowds.'
  ]
};

const destinationOptions = Object.keys(destinationCosts).map((key) => ({
  value: key,
  label: key
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
}));

const SEASON_LABELS = { off: 'Off season (×0.85)', normal: 'Normal season (×1.0)', peak: 'Peak season (×1.35)' };

function formatCost(amountInINR, currencyKey = 'INR', compact = false) {
  const currency = CURRENCIES[currencyKey] || CURRENCIES.INR;
  const converted = amountInINR * currency.rate;
  if (currencyKey === 'INR') {
    return formatINR(amountInINR, { compact });
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyKey,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(converted);
}

function BudgetCalculator() {
  usePageMeta('Budget Calculator | VibeVoyage', 'Estimate destination-based travel cost using smart trip budget calculations.');

  const { logActivity } = useWorkspace();
  const toast = useToast();
  const { send, openDock } = useAssistant();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    destination: destinationOptions[0]?.value || '',
    days: '4',
    travelers: '2',
    style: 'Standard',
    travelMode: 'train',
    distance: 'medium',
    season: 'normal',
    includeIntercity: true,
    shoppingFund: 3000,
    includeBuffer: true,
  });
  const [cap, setCap] = useState(50000);
  const [currency, setCurrency] = useState('INR');
  const [result, setResult] = useState(null);

  const selectedDestinationLabel = useMemo(
    () => destinationOptions.find((option) => option.value === form.destination)?.label || form.destination,
    [form.destination]
  );

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  /* Compute full budget breakdown based on inputs */
  function calculateForStyle(targetStyle = form.style) {
    const days = Math.max(1, parseInt(form.days, 10) || 1);
    const travelers = Math.max(1, parseInt(form.travelers, 10) || 1);

    const destination = destinationCosts[form.destination];
    const destinationState = DESTINATION_STATE_MAP[form.destination];
    const hotelCost = stateHotelCosts[destinationState] || destination?.hotelCost || 3000;
    const styleMultiplier = STYLE_CONFIG[targetStyle]?.multiplier || 1;
    const seasonMultiplier = seasonMultipliers[form.season] || 1;

    const modeKey = form.travelMode === 'flight' ? 'flight' : 'train';
    const distanceKey = form.distance in transportCosts ? form.distance : 'medium';
    const transportCost = transportCosts[distanceKey]?.[modeKey] || 0;

    if (!destination) return null;

    const baseHotel = hotelCost * days;
    const baseFood = destination.foodCost * travelers * days;
    const baseActivities = destination.activityCost * days;
    const travelCost = form.includeIntercity ? transportCost * travelers : 0;

    const hotel = Math.round(baseHotel * styleMultiplier * seasonMultiplier);
    const food = Math.round(baseFood * styleMultiplier * seasonMultiplier);
    const activities = Math.round(baseActivities * styleMultiplier * seasonMultiplier);
    const travel = Math.round(travelCost * styleMultiplier * seasonMultiplier);

    const shopping = (parseInt(form.shoppingFund, 10) || 0) * travelers;
    const subtotal = hotel + food + activities + travel + shopping;
    const buffer = form.includeBuffer ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + buffer;

    return {
      hotel,
      food,
      travel,
      activities,
      shopping,
      buffer,
      total,
      days,
      travelers,
      style: targetStyle,
      destination: selectedDestinationLabel,
      destinationKey: form.destination,
      travelMode: form.travelMode === 'flight' ? 'Flight' : 'Train',
      distance: form.distance.charAt(0).toUpperCase() + form.distance.slice(1),
      season: SEASON_LABELS[form.season] || 'Normal season',
      styleMultiplier,
      seasonMultiplier,
    };
  }

  const preview = useMemo(() => calculateForStyle(form.style), [form, selectedDestinationLabel]);
  const shown = result || preview;

  /* Tier Comparisons (Budget vs Standard vs Luxury) */
  const styleComparisons = useMemo(() => {
    return Object.keys(STYLE_CONFIG).map((st) => ({
      style: st,
      data: calculateForStyle(st),
    }));
  }, [form, selectedDestinationLabel]);

  useEffect(() => {
    if (result) setResult(calculateForStyle(form.style));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  function handleCalculate(event) {
    event.preventDefault();
    const next = calculateForStyle(form.style);
    if (!next) return;
    setResult(next);
    logActivity({
      type: 'budget',
      title: `Estimated ${formatCost(next.total, currency)} for ${next.destination}`,
      href: '/budget',
      icon: 'wallet',
    });
    toast.success('Budget calculated', {
      description: `${formatCost(next.total, currency)} for ${next.days} days · ${next.travelers} traveller(s).`,
    });
  }

  /* Auto-optimize budget when user exceeds cap */
  function autoOptimizeBudget() {
    if (!shown) return;
    // Attempt optimizations: lower style, switch to train, or off-season
    let newStyle = form.style;
    let newMode = form.travelMode;
    let newSeason = form.season;
    let newBuffer = form.includeBuffer;

    if (form.style === 'Luxury') newStyle = 'Standard';
    else if (form.style === 'Standard') newStyle = 'Budget';
    else if (form.travelMode === 'flight') newMode = 'train';
    else if (form.season === 'peak') newSeason = 'normal';
    else if (form.season === 'normal') newSeason = 'off';

    setForm((prev) => ({
      ...prev,
      style: newStyle,
      travelMode: newMode,
      season: newSeason,
    }));

    toast.success('Budget Auto-Optimized', {
      description: `Adjusted to ${newStyle} tier, ${newMode === 'train' ? 'Train' : 'Flight'}, and ${SEASON_LABELS[newSeason]}.`,
    });
  }

  /* Export budget breakdown as formatted text */
  function exportBudgetReport() {
    if (!shown) return;
    const text = `===========================================
VibeVoyage — Trip Budget Estimate
===========================================
Destination: ${shown.destination}
Duration: ${shown.days} Days
Travellers: ${shown.travelers}
Travel Style: ${shown.style} (×${shown.styleMultiplier})
Season: ${shown.season}
Transport: ${shown.travelMode} (${shown.distance})
-------------------------------------------
COST BREAKDOWN:
  • Stay & Lodging:        ${formatCost(shown.hotel, currency)}
  • Food & Dining:         ${formatCost(shown.food, currency)}
  • Intercity Travel:      ${formatCost(shown.travel, currency)}
  • Activities & Tours:    ${formatCost(shown.activities, currency)}
  • Shopping & Souvenirs:  ${formatCost(shown.shopping, currency)}
  • Emergency Buffer:      ${formatCost(shown.buffer, currency)}
-------------------------------------------
ESTIMATED TOTAL:           ${formatCost(shown.total, currency)}
  • Per Person:            ${formatCost(Math.round(shown.total / shown.travelers), currency)}
  • Per Day:               ${formatCost(Math.round(shown.total / shown.days), currency)}
===========================================
Generated via VibeVoyage Budget Intelligence
https://vibevoyage.app`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VibeVoyage-Budget-${shown.destination.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    toast.success('Budget report downloaded!');
  }

  const donutData = shown
    ? Object.entries(CATEGORY_META)
        .filter(([key]) => shown[key] > 0)
        .map(([key, meta]) => ({
          label: meta.label,
          value: shown[key],
          display: formatCost(shown[key], currency, true),
          color: meta.color,
        }))
    : [];

  const perPerson = shown ? Math.round(shown.total / shown.travelers) : 0;
  const perDay = shown ? Math.round(shown.total / shown.days) : 0;
  const capUsage = shown ? Math.min(100, Math.round((shown.total / cap) * 100)) : 0;
  const isOverCap = shown && shown.total > cap;
  const overCapAmount = isOverCap ? shown.total - cap : 0;

  const destinationTips =
    DESTINATION_SAVINGS_TIPS[shown?.destinationKey] || DESTINATION_SAVINGS_TIPS.default;

  return (
    <div className="space-y-8">
      {/* ----------------------------------------------------------- Header */}
      <PageHeader
        eyebrow="Budget planner"
        icon="wallet"
        title="Know the real cost before you book"
        description="Smart destination averages, hotel price intelligence, transport mode and season multipliers combined into one live estimate."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-900/90 text-white px-3.5 py-2 shadow-md backdrop-blur-md transition-all hover:border-cyan-400">
              <Icon name="globe" size="sm" className="text-cyan-400" />
              <span className="text-2xs font-extrabold uppercase tracking-wider text-cyan-300">Currency</span>
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-950 text-xs font-black text-white outline-none cursor-pointer border border-slate-800 rounded-lg px-2 py-1 focus:ring-2 focus:ring-cyan-500/50"
              >
                {Object.entries(CURRENCIES).map(([code, item]) => (
                  <option key={code} value={code} className="bg-slate-950 text-white font-bold py-1">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <Button to="/trip-planner" variant="secondary" leadingIcon="sparkles">
              Plan itinerary
            </Button>
            <Button to="/hotels" variant="ghost" leadingIcon="hotel">
              Compare stays
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        {/* ------------------------------------------------------------ Form */}
        <Card padding="lg" as="form" onSubmit={handleCalculate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Destination" htmlFor="destination" className="sm:col-span-2">
              <Select id="destination" name="destination" icon="mapPin" value={form.destination} onChange={handleChange}>
                {destinationOptions.map((destination) => (
                  <option key={destination.value} value={destination.value}>
                    {destination.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Number of days" htmlFor="days">
              <Input id="days" name="days" type="number" min="1" max="60" value={form.days} onChange={handleChange} icon="calendar" />
            </Field>

            <Field label="Number of travellers" htmlFor="travelers">
              <Input
                id="travelers"
                name="travelers"
                type="number"
                min="1"
                max="50"
                value={form.travelers}
                onChange={handleChange}
                icon="users"
              />
            </Field>
          </div>

          {/* Travel Style Tier Selection */}
          <fieldset className="mt-5">
            <legend className="mb-2.5 text-xs font-bold uppercase tracking-wide text-fg-muted">Travel style</legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {Object.entries(STYLE_CONFIG).map(([key, config]) => {
                const active = form.style === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, style: key }))}
                    aria-pressed={active}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all duration-200',
                      active
                        ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-float'
                        : 'border-line bg-surface hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-sm'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={config.icon} size="md" className={active ? 'text-white' : 'text-cyan-500'} />
                      <span className={cn('text-sm font-bold', active ? 'text-white' : 'text-fg')}>{key}</span>
                    </span>
                    <span className={cn('text-2xs', active ? 'text-white/80' : 'text-fg-subtle')}>{config.blurb}</span>
                    <span className={cn('text-2xs font-bold', active ? 'text-white' : 'text-cyan-600 dark:text-cyan-300')}>
                      ×{config.multiplier} multiplier
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Travel Mode, Distance, Season */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Intercity Mode" htmlFor="travelMode">
              <Select id="travelMode" name="travelMode" icon="train" value={form.travelMode} onChange={handleChange}>
                <option value="train">Train / Rail</option>
                <option value="flight">Flight / Airline</option>
              </Select>
            </Field>

            <Field label="Distance" htmlFor="distance">
              <Select id="distance" name="distance" icon="map" value={form.distance} onChange={handleChange}>
                <option value="short">Short (&lt; 500 km)</option>
                <option value="medium">Medium (500–1200 km)</option>
                <option value="long">Long (&gt; 1200 km)</option>
              </Select>
            </Field>

            <Field label="Season" htmlFor="season">
              <Select id="season" name="season" icon="sun" value={form.season} onChange={handleChange}>
                <option value="off">Off season (×0.85)</option>
                <option value="normal">Normal (×1.0)</option>
                <option value="peak">Peak (×1.35)</option>
              </Select>
            </Field>
          </div>

          {/* Customizable Add-ons */}
          <div className="mt-6 space-y-4 rounded-2xl border border-line bg-surface-muted/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-fg-muted">Custom Add-ons & Outlay</span>
              <Badge tone="neutral" icon="sparkles">Smart Parameters</Badge>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="shoppingFund" className="text-xs font-semibold text-fg">
                  Shopping & Souvenirs / person: <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{formatCost(form.shoppingFund, currency)}</span>
                </label>
              </div>
              <input
                id="shoppingFund"
                name="shoppingFund"
                type="range"
                min="0"
                max="25000"
                step="500"
                value={form.shoppingFund}
                onChange={handleChange}
                className="h-2 w-full accent-cyan-500 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-xs font-semibold text-fg cursor-pointer hover:border-cyan-500/40">
                  <input
                    type="checkbox"
                    name="includeBuffer"
                    checked={form.includeBuffer}
                    onChange={handleChange}
                    className="h-4 w-4 rounded accent-cyan-500"
                  />
                  <span>10% Emergency Fund</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-xs font-semibold text-fg cursor-pointer hover:border-cyan-500/40">
                  <input
                    type="checkbox"
                    name="includeIntercity"
                    checked={form.includeIntercity}
                    onChange={handleChange}
                    className="h-4 w-4 rounded accent-cyan-500"
                  />
                  <span>Include Transport Ticket</span>
                </label>
              </div>
            </div>
          </div>

          {/* Budget Cap Range Slider */}
          <div className="mt-5 rounded-2xl border border-line bg-surface-muted p-4">
            <RangeSlider
              id="budget-cap"
              label="Target Budget Cap"
              min={10000}
              max={300000}
              step={5000}
              value={cap}
              onChange={setCap}
              format={(value) => formatCost(value, currency, true)}
            />
            {shown && (
              <div className="mt-3">
                <Progress
                  value={capUsage}
                  tone={shown.total <= cap ? 'success' : 'danger'}
                  label={shown.total <= cap ? 'Within your target cap' : 'Exceeds budget cap'}
                  showValue
                />
                <p className="mt-1.5 text-xs text-fg-muted">
                  {shown.total <= cap
                    ? `${formatCost(cap - shown.total, currency)} remaining in your target limit.`
                    : `${formatCost(overCapAmount, currency)} above your cap — try adjusting style, season, or auto-optimize.`}
                </p>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" fullWidth className="mt-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-cyan-500/25 border-0" leadingIcon="chart">
            Calculate trip budget
          </Button>
        </Card>

        {/* --------------------------------------------------------- Results */}
        <div className="space-y-4 lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
          {!shown ? (
            <EmptyState
              icon="wallet"
              title="Pick a destination to see the estimate"
              description="We combine state-level hotel pricing, per-day food and activity averages, and your transport mode."
            />
          ) : (
            <>
              {/* Total Estimated Cost Card */}
              <Card tone="gradient" padding="lg" className="border border-cyan-500/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xs font-extrabold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                      Estimated Total Cost
                    </p>
                    <p className="mt-2 text-4xl font-black tracking-tight text-fg">{formatCost(shown.total, currency)}</p>
                    <p className="mt-1 text-sm font-medium text-fg-muted">
                      {shown.destination} · {shown.days} days · {shown.travelers} traveller
                      {shown.travelers > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge tone={STYLE_CONFIG[shown.style]?.tone || 'brand'} icon={STYLE_CONFIG[shown.style]?.icon}>
                    {shown.style}
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-surface/90 px-4 py-3 shadow-sm">
                    <p className="text-2xs font-bold uppercase tracking-wide text-fg-subtle">Per Person Outlay</p>
                    <p className="mt-1 text-lg font-black text-fg">{formatCost(perPerson, currency)}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface/90 px-4 py-3 shadow-sm">
                    <p className="text-2xs font-bold uppercase tracking-wide text-fg-subtle">Per Day Outlay</p>
                    <p className="mt-1 text-lg font-black text-fg">{formatCost(perDay, currency)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-2xs">
                  {form.includeIntercity && (
                    <Badge tone="neutral" icon="train">
                      {shown.travelMode} · {shown.distance}
                    </Badge>
                  )}
                  <Badge tone="neutral" icon="sun">
                    {shown.season}
                  </Badge>
                  <Badge tone="neutral" icon="target">
                    Tier Multiplier ×{shown.styleMultiplier}
                  </Badge>
                </div>
              </Card>

              {/* Cap Alert & Auto-Optimizer Banner */}
              {isOverCap && (
                <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 font-bold">
                      ⚠️
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-extrabold text-amber-500 dark:text-amber-400">
                        {formatCost(overCapAmount, currency)} Over Target Budget Cap
                      </h4>
                      <p className="mt-0.5 text-xs text-fg-muted">
                        Your total estimated cost exceeds your set cap of {formatCost(cap, currency)}.
                      </p>
                      <button
                        type="button"
                        onClick={autoOptimizeBudget}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-orange-500 transition-all"
                      >
                        <Icon name="sparkles" size="sm" />
                        <span>⚡ Auto-Optimize Budget</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Allocation Chart */}
              <Card padding="lg">
                <h3 className="text-base font-bold text-fg">Expense Allocation</h3>
                <div className="mt-4">
                  <DonutChart
                    data={donutData}
                    size={150}
                    thickness={20}
                    centerLabel="Total"
                    centerValue={formatCost(shown.total, currency, true)}
                  />
                </div>
              </Card>

              {/* Line Items Detail */}
              <Card padding="lg">
                <h3 className="text-base font-bold text-fg">Line Item Breakdown</h3>
                <ul className="mt-3 space-y-2.5">
                  {Object.entries(CATEGORY_META)
                    .filter(([key]) => shown[key] > 0)
                    .map(([key, meta]) => (
                      <li key={key} className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted p-3">
                        <span
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                          style={{ background: meta.color }}
                        >
                          <Icon name={meta.icon} size="sm" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-fg">{meta.label}</span>
                          <span className="block text-2xs text-fg-subtle">
                            {key === 'hotel' && `${shown.days} night${shown.days > 1 ? 's' : ''} stay`}
                            {key === 'food' && `${shown.days} days × ${shown.travelers} traveller${shown.travelers > 1 ? 's' : ''}`}
                            {key === 'travel' && `${shown.travelMode} (${shown.distance}) × ${shown.travelers}`}
                            {key === 'activities' && `${shown.days} day${shown.days > 1 ? 's' : ''} of experiences`}
                            {key === 'shopping' && `Shopping & souvenir allowance`}
                            {key === 'buffer' && `10% emergency safety fund`}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-extrabold text-fg">{formatCost(shown[key], currency)}</span>
                      </li>
                    ))}
                </ul>

                {/* 3-Tier Comparison Matrix */}
                <div className="mt-5 border-t border-line pt-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-fg-muted">Tier Comparison</h4>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {styleComparisons.map((item) => (
                      <button
                        key={item.style}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, style: item.style }))}
                        className={cn(
                          'flex flex-col items-center justify-between rounded-xl border p-2.5 text-center transition-all',
                          form.style === item.style
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 font-extrabold shadow-sm'
                            : 'border-line bg-surface-muted text-fg hover:border-cyan-500/40'
                        )}
                      >
                        <span className="text-3xs font-bold uppercase">{item.style}</span>
                        <span className="mt-1 text-xs font-black">{formatCost(item.data.total, currency, true)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Smart Savings Tips */}
                <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                    <Icon name="lightbulb" size="sm" />
                    <span>Smart Savings Tips for {shown.destination}</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-2xs text-fg-muted">
                    {destinationTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon="bot"
                    onClick={() => {
                      openDock();
                      send(
                        `How can I reduce a ${formatCost(shown.total, currency)} budget for ${shown.days} days in ${
                          shown.destination
                        } with ${shown.travelers} travellers? Give specific budget swaps.`
                      );
                    }}
                  >
                    Ask AI to cut costs
                  </Button>
                  <Button
                    size="sm"
                    variant="glass"
                    leadingIcon="sparkles"
                    onClick={() => {
                      navigate(
                        `/trip-planner?${new URLSearchParams({
                          destination: shown.destination,
                          days: String(shown.days),
                          style: shown.style,
                        }).toString()}`
                      );
                    }}
                  >
                    Generate itinerary
                  </Button>
                  <Button size="sm" variant="ghost" leadingIcon="download" onClick={exportBudgetReport}>
                    Export report
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetCalculator;
