/**
 * intentEngine.js — AI Travel Intent Parsing Engine
 * Converts unstructured natural language prompts into a structured TravelIntent object.
 */

export function parseTravelIntent(promptString) {
  const prompt = String(promptString || '').trim();

  // Default Intent
  const intent = {
    rawPrompt: prompt,
    budget: 20000,
    duration: 4,
    departure: 'Delhi',
    category: 'Nature',
    travellers: 'Solo',
    groupType: 'Solo',
    mode: 'Explorer',
    interests: ['nature', 'scenery', 'photography'],
    transportPref: 'Train/Flight',
    parsedAt: new Date().toISOString(),
  };

  if (!prompt) return intent;

  const lower = prompt.toLowerCase();

  // 1. Budget extraction (e.g., "under ₹15,000", "under 20k", "under 25,000", "15k budget", "50000")
  const budgetMatch =
    lower.match(/(?:under|<|budget of|₹|rs\.?|inr|\$)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(k|thousand|lakh|l)?/i) ||
    lower.match(/(\d+)\s*k/i);

  if (budgetMatch) {
    let num = parseFloat(budgetMatch[1].replace(/,/g, ''));
    const unit = (budgetMatch[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') num *= 1000;
    else if (unit === 'lakh' || unit === 'l') num *= 100000;

    if (num > 1000 && num < 1000000) {
      intent.budget = num;
    }
  }

  // 2. Duration extraction (e.g., "3 days", "4 day", "weekend", "1 week")
  const daysMatch = lower.match(/(\d+)\s*(?:day|days|night|nights)/i);
  if (daysMatch) {
    intent.duration = Math.min(14, Math.max(1, parseInt(daysMatch[1], 10)));
  } else if (lower.includes('weekend')) {
    intent.duration = 2;
  } else if (lower.includes('week')) {
    intent.duration = 7;
  }

  // 3. Departure city extraction
  const cities = ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'kochi'];
  for (const city of cities) {
    if (lower.includes(`from ${city}`) || lower.includes(`near ${city}`)) {
      intent.departure = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // 4. Category & AI Mode mapping
  if (lower.includes('nature') || lower.includes('mountain') || lower.includes('green') || lower.includes('forest')) {
    intent.category = 'Nature';
    intent.mode = 'Explorer';
    intent.interests = ['nature', 'mountains', 'trekking'];
  } else if (lower.includes('romantic') || lower.includes('couple') || lower.includes('honeymoon')) {
    intent.category = 'Romantic';
    intent.mode = 'Couple';
    intent.groupType = 'Couple';
    intent.interests = ['romance', 'boutique', 'fine dining'];
  } else if (lower.includes('family') || lower.includes('kids') || lower.includes('parents')) {
    intent.category = 'Family';
    intent.mode = 'Family';
    intent.groupType = 'Family';
    intent.interests = ['sightseeing', 'family friendly', 'resort'];
  } else if (lower.includes('adventure') || lower.includes('trek') || lower.includes('rafting')) {
    intent.category = 'Adventure';
    intent.mode = 'Adventure';
    intent.interests = ['adventure', 'trekking', 'thrill'];
  } else if (lower.includes('beach') || lower.includes('ocean') || lower.includes('coastal')) {
    intent.category = 'Beach';
    intent.mode = 'Explorer';
    intent.interests = ['beach', 'water sports', 'sunset'];
  } else if (lower.includes('cheap') || lower.includes('budget') || lower.includes('backpacker')) {
    intent.category = 'Budget';
    intent.mode = 'Budget Saver';
    intent.interests = ['hostels', 'street food', 'budget travel'];
  } else if (lower.includes('luxury') || lower.includes('5 star') || lower.includes('resort')) {
    intent.category = 'Luxury';
    intent.mode = 'Luxury';
    intent.interests = ['5-star resorts', 'spa', 'luxury'];
  }

  return intent;
}
