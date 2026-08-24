import { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import Icon from '../components/ui/Icon';
import SpaceBackgroundCanvas from '../components/3d/SpaceBackgroundCanvas';
import { useAssistant } from '../context/AssistantContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/cn';

const TravelAssistantChat = lazy(() => import('../components/TravelAssistantChat'));

function AssistantLauncher({ onClick }) {
  return (
    <div className="fixed bottom-4 right-4 z-[95] sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={onClick}
        aria-label="Open VibeVoyage assistant"
        className="group relative inline-flex items-center gap-2.5 rounded-full border border-cyan-400/40 bg-gradient-to-r from-cyan-500/90 to-indigo-600/90 py-3 pl-3 pr-4 text-sm font-bold text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-cyan-500/30 animate-ping" aria-hidden="true" />
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
          <Icon name="sparkles" size="sm" />
        </span>
        <span className="hidden sm:inline">Ask VibeVoyage</span>
      </button>
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-4 left-4 z-[92] inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/60 dark:border-white/15 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 sm:bottom-6 sm:left-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <Icon name="chevronUp" size="md" />
    </button>
  );
}

function MainLayout() {
  const location = useLocation();
  const { theme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [assistantMounted, setAssistantMounted] = useState(false);
  const { dockOpen, openDock } = useAssistant();

  useEffect(() => {
    if (dockOpen) setAssistantMounted(true);
  }, [dockOpen]);

  useEffect(() => {
    const preload = () => import('../components/TravelAssistantChat');
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = setTimeout(preload, 3500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !/input|textarea|select/i.test(event.target?.tagName || '') &&
        !event.target?.isContentEditable
      ) {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const showAssistant = location.pathname !== '/assistant';

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col relative transition-colors duration-300',
        theme === 'dark' ? 'dark text-slate-100 bg-slate-950' : 'light text-slate-900 bg-slate-50'
      )}
    >
      {/* 3D Cosmic Space Background */}
      {theme === 'dark' && <SpaceBackgroundCanvas />}

      <Navbar onOpenCommand={() => setCommandOpen(true)} />

      <main
        id="main-content"
        key={location.pathname}
        className={cn('flex-1 animate-fade-in relative z-10', isHome ? 'pb-0 pt-2' : 'content-grid pb-10 pt-6 sm:pt-8')}
      >
        <Outlet />
      </main>

      <Footer />

      {showAssistant &&
        (assistantMounted ? (
          <Suspense fallback={
            <AssistantLauncher
              onClick={() => {
                setAssistantMounted(true);
                openDock();
              }}
            />
          }>
            <TravelAssistantChat />
          </Suspense>
        ) : (
          <AssistantLauncher
            onClick={() => {
              setAssistantMounted(true);
              openDock();
            }}
          />
        ))}

      <BackToTop />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}

export default MainLayout;
