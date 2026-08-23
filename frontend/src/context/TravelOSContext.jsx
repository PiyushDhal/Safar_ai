import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { parseTravelIntent } from '../services/intentEngine';
import { rankDestinationsForIntent } from '../services/intelligenceEngine';
import { destinations } from '../data/destinations';

const TravelOSContext = createContext(null);

const DEFAULT_INTENT = {
  rawPrompt: '4 days in nature under ₹20,000 from Delhi',
  budget: 20000,
  duration: 4,
  departure: 'Delhi',
  category: 'Nature',
  travellers: 'Solo',
  groupType: 'Solo',
  mode: 'Explorer',
  interests: ['nature', 'mountains', 'trekking'],
  transportPref: 'Train/Flight',
};

export function TravelOSProvider({ children }) {
  const [intent, setIntentState] = useState(DEFAULT_INTENT);
  const [aiMode, setAIMode] = useState('Explorer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDestinationSlug, setSelectedDestinationSlug] = useState(null);

  // Compute ranked destinations automatically whenever intent or aiMode changes
  const rankedDestinations = useMemo(() => {
    return rankDestinationsForIntent(intent, aiMode);
  }, [intent, aiMode]);

  // Selected or top recommended destination
  const activeDestination = useMemo(() => {
    if (selectedDestinationSlug) {
      const found = rankedDestinations.find((d) => d.slug === selectedDestinationSlug || d.id === selectedDestinationSlug);
      if (found) return found;
    }
    return rankedDestinations[0] || destinations[0];
  }, [rankedDestinations, selectedDestinationSlug]);

  // Dynamic Live Budget Breakdown
  const budgetBreakdown = useMemo(() => {
    const total = intent.budget || 20000;
    return {
      total,
      hotels: Math.round(total * 0.35),
      transport: Math.round(total * 0.25),
      food: Math.round(total * 0.20),
      activities: Math.round(total * 0.12),
      buffer: Math.round(total * 0.08),
    };
  }, [intent.budget]);

  // Submit Intent Prompt Action
  const submitIntentPrompt = useCallback((promptText) => {
    setIsAnalyzing(true);
    const parsed = parseTravelIntent(promptText);
    setIntentState(parsed);

    // Simulate AI candidate evaluation sequence
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1800);
  }, []);

  const updateIntent = useCallback((patch) => {
    setIntentState((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectDestination = useCallback((destOrSlug) => {
    const slug = typeof destOrSlug === 'string' ? destOrSlug : destOrSlug?.slug || destOrSlug?.id;
    setSelectedDestinationSlug(slug);
  }, []);

  const value = useMemo(
    () => ({
      intent,
      setIntent: setIntentState,
      updateIntent,
      aiMode,
      setAIMode,
      isAnalyzing,
      setIsAnalyzing,
      rankedDestinations,
      activeDestination,
      selectDestination,
      budgetBreakdown,
      activeTab,
      setActiveTab,
      submitIntentPrompt,
    }),
    [
      intent,
      updateIntent,
      aiMode,
      isAnalyzing,
      rankedDestinations,
      activeDestination,
      selectDestination,
      budgetBreakdown,
      activeTab,
      submitIntentPrompt,
    ]
  );

  return <TravelOSContext.Provider value={value}>{children}</TravelOSContext.Provider>;
}

export function useTravelOS() {
  const context = useContext(TravelOSContext);
  if (!context) throw new Error('useTravelOS must be used inside <TravelOSProvider>');
  return context;
}

export default TravelOSContext;
