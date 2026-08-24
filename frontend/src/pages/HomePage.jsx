import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import HeroSection from '../components/home/HeroSection';
import DestinationExplorer from '../components/home/DestinationExplorer';
import WorldMapSection from '../components/home/WorldMapSection';
import FeatureCards from '../components/home/FeatureCards';
import AITravelIntelligence from '../components/home/AITravelIntelligence';
import InteractiveTravelGlobeSection from '../components/home/InteractiveTravelGlobeSection';
import { HowItWorks, Testimonials, TrustBar } from '../components/home/Sections';
import { SectionHeader, Reveal } from '../components/ui/Section';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import DestinationImage from '../components/DestinationImage';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAssistant } from '../context/AssistantContext';
import { destinations } from '../data/destinations';

function ContinuePlanning() {
  const { recent, trips, favourites } = useWorkspace();
  const items = [
    ...trips.slice(-2).reverse().map((trip) => ({
      id: `trip-${trip.id}`,
      title: `${trip.destination} · ${trip.days} days`,
      subtitle: 'Saved itinerary',
      icon: 'luggage',
      href: '/my-trips',
    })),
    ...recent.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: 'Recently viewed',
      icon: 'history',
      href: item.href,
    })),
    ...favourites.slice(0, 2).map((item) => ({
      id: `fav-${item.id}`,
      title: item.title,
      subtitle: 'Saved',
      icon: 'heart',
      href: item.href,
    })),
  ].slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Pick up where you left off"
        icon="history"
        title="Your travel workspace"
        action={
          <Button to="/profile" variant="secondary" size="sm" trailingIcon="arrowRight">
            Open dashboard
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href || '/'}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-line/70 bg-white/90 dark:bg-slate-900/80 p-4 shadow-lg dark:shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Icon name={item.icon} size="md" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span>
            </span>
            <Icon
              name="arrowRight"
              size="sm"
              className="shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-500 dark:group-hover:text-cyan-400"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

function AssistantPromo() {
  const { openDock } = useAssistant();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-cyan-500/30 bg-white/90 dark:bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10 my-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(50rem_28rem_at_15%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(40rem_24rem_at_90%_110%,rgba(6,182,212,0.2),transparent)]"
      />
      <div className="absolute inset-0 bg-hero-grid bg-[size:22px_22px] opacity-[0.08] dark:opacity-[0.12]" aria-hidden="true" />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-2xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-300 backdrop-blur-md">
            <Icon name="bot" size="xs" /> Neural Travel Assistant
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ask anything. Get a plan, not a paragraph.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Yatri AI knows your saved trips, preferred style and recently viewed destinations — so answers arrive already tailored to the exact way you travel.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={openDock} variant="glass" leadingIcon="sparkles" className="border-cyan-500/40 text-cyan-700 dark:text-white bg-cyan-500/10 dark:bg-cyan-500/20 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30">
              Open Assistant
            </Button>
            <Button to="/assistant" variant="ghost" trailingIcon="arrowUpRight" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              Full Screen Chat
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { q: 'Cheapest week in Ladakh?', a: 'Mid-September — permits open, ₹6.2k/day average, fewer crowds.' },
            { q: 'Kerala with parents, 6 days?', a: 'Kochi 2 · Munnar 2 · Alleppey 2, houseboat on night 5.' },
            { q: 'Is Goa safe in monsoon?', a: 'Yes, with caveats: red-flag beaches, safety score dips to 74.' },
          ].map((item, index) => (
            <div
              key={item.q}
              className="rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50/90 dark:bg-white/10 p-4 backdrop-blur-md animate-fade-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.q}</p>
              <p className="mt-1.5 flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                <Icon name="sparkles" size="xs" className="mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeasonalRail() {
  const month = new Date().getMonth() + 1;
  const inSeason = destinations.filter((item) => item.months.includes(month)).slice(0, 6);
  if (inSeason.length === 0) return null;

  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long' });

  return (
    <section className="space-y-5 my-12">
      <SectionHeader
        eyebrow="Right season"
        icon="calendar"
        title={`Perfect to visit in ${monthName}`}
        description="Weather, crowd levels and pricing all line up this month."
      />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
        {inSeason.map((destination) => (
          <Link
            key={destination.slug}
            to={`/destination/${destination.slug}`}
            className="group relative h-60 w-64 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-line/80 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
          >
            <DestinationImage
              destination={destination}
              width={800}
              className="h-full w-full"
              imgClassName="transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-base font-extrabold text-white">{destination.name}</p>
              <p className="text-xs text-slate-300">{destination.tagline}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-950/60 px-2.5 py-1 text-2xs font-bold text-cyan-300 backdrop-blur border border-line/40">
                <Icon name="star" size="xs" filled className="text-amber-400" />
                {destination.rating} · {destination.budget}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  usePageMeta(
    'Yatri AI | Cinematic AI Travel Intelligence Platform',
    'Yatri AI helps travelers plan smarter and safer with AI itinerary generation, 3D destination intelligence, transport tools, and personalized recommendations.'
  );

  return (
    <div>
      <HeroSection />

      <div className="content-grid space-y-20 pb-16 sm:space-y-24">
        <Reveal>
          <TrustBar />
        </Reveal>

        <ContinuePlanning />
        <AITravelIntelligence />
        <DestinationExplorer />
        <InteractiveTravelGlobeSection />
        <SeasonalRail />
        <WorldMapSection />
        <HowItWorks />
        <FeatureCards />
        <Reveal>
          <AssistantPromo />
        </Reveal>
        <Testimonials />
      </div>
    </div>
  );
}

export default HomePage;
