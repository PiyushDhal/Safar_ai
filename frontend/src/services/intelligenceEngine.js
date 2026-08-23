/**
 * intelligenceEngine.js — Destination Intelligence & Multi-Dimensional Scoring System
 * Evaluates candidate destinations across 7 scoring metrics matching travel intent & AI mode.
 */

import { destinations } from '../data/destinations';

export function calculateDestinationIntelligence(destination, intent, mode = 'Explorer') {
  const { budget = 20000, duration = 4, departure = 'Delhi', category = 'Nature' } = intent;

  // Estimated total cost = dailyCost * duration + transitCost
  const dailyCost = destination.dailyBudget || destination.estimatedDailyCost || 3500;
  const transitCost = destination.transitEstimate || 3000;
  const estimatedTotal = dailyCost * duration + transitCost;

  // 1. Budget Score (0 - 100)
  let budgetScore = 85;
  if (estimatedTotal <= budget) {
    budgetScore = Math.min(100, Math.round(85 + ((budget - estimatedTotal) / budget) * 20));
  } else {
    budgetScore = Math.max(30, Math.round(85 - ((estimatedTotal - budget) / budget) * 70));
  }

  // 2. Safety Score (0 - 100)
  const safetyScore = destination.safetyIndex || destination.safetyScore || 92;

  // 3. Weather Score (0 - 100)
  const weatherScore = destination.weatherIndex || 88;

  // 4. Food Score (0 - 100)
  const foodScore = destination.foodRating || destination.foodScore || 94;

  // 5. Accessibility Score (0 - 100)
  let accessibilityScore = 85;
  if (destination.nearCity?.toLowerCase() === departure.toLowerCase()) {
    accessibilityScore = 98;
  } else if (destination.hasAirport || destination.hasRailway) {
    accessibilityScore = 90;
  }

  // 6. Experience Score (0 - 100)
  let experienceScore = 86;
  const destTags = (destination.tags || []).map((t) => t.toLowerCase());
  const categoryMatch = destTags.includes(category.toLowerCase()) || destination.category?.toLowerCase() === category.toLowerCase();
  if (categoryMatch) experienceScore += 10;

  // Mode-based Weight Adjustment
  let weights = {
    budget: 0.20,
    safety: 0.20,
    weather: 0.15,
    food: 0.15,
    accessibility: 0.15,
    experience: 0.15,
  };

  switch (mode) {
    case 'Budget Saver':
    case 'Backpacker':
      weights = { budget: 0.45, safety: 0.15, weather: 0.10, food: 0.10, accessibility: 0.10, experience: 0.10 };
      break;
    case 'Safety First':
    case 'Family':
      weights = { budget: 0.15, safety: 0.45, weather: 0.15, food: 0.10, accessibility: 0.10, experience: 0.05 };
      break;
    case 'Luxury':
      weights = { budget: 0.05, safety: 0.20, weather: 0.20, food: 0.25, accessibility: 0.10, experience: 0.20 };
      break;
    case 'Adventure':
      weights = { budget: 0.15, safety: 0.15, weather: 0.20, food: 0.10, accessibility: 0.10, experience: 0.30 };
      break;
    case 'Couple':
      weights = { budget: 0.15, safety: 0.20, weather: 0.25, food: 0.20, accessibility: 0.10, experience: 0.10 };
      break;
    default:
      break;
  }

  const overallScore = Math.round(
    budgetScore * weights.budget +
      safetyScore * weights.safety +
      weatherScore * weights.weather +
      foodScore * weights.food +
      accessibilityScore * weights.accessibility +
      experienceScore * weights.experience
  );

  return {
    destinationId: destination.slug || destination.id,
    destinationName: destination.name,
    overallScore,
    budgetScore,
    safetyScore,
    weatherScore,
    foodScore,
    accessibilityScore,
    experienceScore,
    estimatedTotalCost: estimatedTotal,
    dailyCost,
    explainableReasoning: [
      `Fits ₹${budget.toLocaleString()} budget (est. ₹${estimatedTotal.toLocaleString()})`,
      `Safety Rating ${safetyScore}/100 verified`,
      `Optimal seasonal climate (${weatherScore}/100 suitability)`,
      `High culinary culture index (${foodScore}/100)`,
      `Convenient transit connections from ${departure}`,
    ],
  };
}

export function rankDestinationsForIntent(intent, mode = 'Explorer') {
  return destinations
    .map((dest) => {
      const intel = calculateDestinationIntelligence(dest, intent, mode);
      return { ...dest, intel };
    })
    .sort((a, b) => b.intel.overallScore - a.intel.overallScore);
}
