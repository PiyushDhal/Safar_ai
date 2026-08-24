/**
 * VibeVoyage AI service — Node.js / backend edition.
 *
 * Uses process.env / config.js.
 * Does NOT use dangerouslyAllowBrowser — runs in trusted Node context.
 *
 * Primary path  : Groq (llama-3.3-70b-versatile)
 * Fallback path : deterministic, data-grounded answer built from local datasets.
 */

import { config } from '../config.js';
import { destinations, findDestination } from '../data/destinations.js';
import { hotelsDatabase } from '../data/hotelsDatabase.js';
import { foodCultureDatabase } from '../data/foodCultureDatabase.js';

export function getAiStatus() {
  const key = config.groqApiKey;
  return {
    configured: Boolean(key),
    model: 'llama-3.3-70b-versatile',
  };
}

export const aiStatus = getAiStatus();

let clientPromise = null;

function getClient() {
  const apiKey = config.groqApiKey;
  if (!apiKey) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('groq-sdk')
      .then(({ default: Groq }) => new Groq({ apiKey }))
      .catch((error) => {
        console.error('[VibeVoyage AI] Failed to load the Groq SDK:', error);
        return null;
      });
  }
  return clientPromise;
}

const SYSTEM_PROMPT = `You are VibeVoyage, an expert AI travel assistant built by TravelCore. You help users plan detailed trip itineraries, discover destinations, explore local food and culture, suggest safe travel routes, and estimate travel budgets. Always be friendly, specific, and practical in your advice.

Formatting rules:
- Reply in short markdown sections with bold labels.
- Prefer bullet lists over long paragraphs.
- Include concrete numbers (₹ costs, durations, distances) when relevant.
- End with one short, useful follow-up suggestion.`;

/* ------------------------------------------------------------------ helpers */

function inr(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function offlineAnswer(message) {
  const text = String(message || '').toLowerCase();
  const destination = findDestination(
    destinations.find((item) => text.includes(item.name.toLowerCase()))?.name || ''
  );

  const wantsBudget = /budget|cost|price|cheap|expensive|money|₹/.test(text);
  const wantsFood = /food|eat|dish|restaurant|cuisine|breakfast|dinner/.test(text);
  const wantsStay = /hotel|stay|resort|hostel|accommodation/.test(text);
  const wantsSafety = /safe|safety|risk|solo|women|emergency/.test(text);

  if (destination) {
    const stays = hotelsDatabase.filter(
      (hotel) => hotel.city.toLowerCase() === destination.name.toLowerCase()
    );
    const food = foodCultureDatabase.filter((item) =>
      item.city.toLowerCase().includes(destination.name.toLowerCase())
    );

    const lines = [
      `### ${destination.name} — quick brief`,
      '',
      `${destination.description}`,
      '',
      `**Best time:** ${destination.bestTime}  `,
      `**Ideal length:** ${destination.duration}  `,
      `**Typical budget:** ${destination.budget} (about ${inr(destination.dailyCost)}/day)  `,
      `**Safety score:** ${destination.safetyScore}/100`,
      '',
      '**Do not miss**',
      ...destination.highlights.map((item) => `- ${item}`),
    ];

    if (wantsStay && stays.length) {
      lines.push(
        '',
        '**Where to stay**',
        ...stays.map(
          (hotel) =>
            `- ${hotel.name} — ${inr(hotel.pricePerNight)}/night · ${hotel.rating}★ (${hotel.tier})`
        )
      );
    }
    if (wantsFood && food.length) {
      lines.push(
        '',
        '**What to eat**',
        ...food.slice(0, 4).map((item) => `- ${item.dish} at ${item.place}`)
      );
    }
    if (wantsBudget) {
      lines.push(
        '',
        '**Budget snapshot (per person, 4 days)**',
        `- Stay: ${inr(destination.dailyCost * 0.45 * 4)}`,
        `- Food: ${inr(destination.dailyCost * 0.25 * 4)}`,
        `- Local transport: ${inr(destination.dailyCost * 0.15 * 4)}`,
        `- Activities: ${inr(destination.dailyCost * 0.15 * 4)}`
      );
    }
    if (wantsSafety) {
      lines.push(
        '',
        '**Safety notes**',
        `- Overall score ${destination.safetyScore}/100 based on traveller reports.`,
        '- Share your live location with one contact for late-night travel.',
        '- Use the in-app Safety page for emergency numbers and a saved SOS list.'
      );
    }

    lines.push(
      '',
      `_Want a full day-by-day plan? Open the Trip Planner and pick ${destination.name}._`
    );
    return lines.join('\n');
  }

  if (wantsBudget) {
    const cheapest = [...destinations].sort((a, b) => a.dailyCost - b.dailyCost).slice(0, 4);
    return [
      '### Best value destinations right now',
      '',
      ...cheapest.map(
        (item) => `- **${item.name}** — from ${inr(item.dailyCost)}/day · ${item.bestTime}`
      ),
      '',
      'Open **Budget Calculator** to model exact cost by travel style, season and group size.',
    ].join('\n');
  }

  return [
    '### I can help you plan that',
    '',
    'Here is what I do best:',
    '- **Itineraries** — a realistic day-by-day plan for any Indian destination',
    '- **Budgets** — season-aware cost estimates by travel style',
    '- **Stays & food** — curated hotels and signature dishes per city',
    '- **Safety & transport** — risk notes, train options and route advice',
    '',
    '**Popular right now:** ' + destinations.slice(0, 4).map((item) => item.name).join(' · '),
    '',
    'Tell me a destination and how many days you have, and I will draft the plan.',
  ].join('\n');
}

/* --------------------------------------------------------------- public API */

/**
 * Generate an AI travel response using Groq, with offline fallback.
 *
 * @param {string} message            The user question
 * @param {object} [options]
 * @param {Array}  [options.history]  Prior turns ({ role, text })
 * @param {string} [options.context]  Extra grounding context
 * @returns {Promise<string>} Markdown-formatted response
 */
export async function generateAITravelResponse(message, options = {}) {
  const { history = [], context = '' } = options;
  const client = await getClient();

  if (!client) {
    // No API key — return a useful, grounded offline answer immediately.
    await new Promise((resolve) => setTimeout(resolve, 200));
    return offlineAnswer(message);
  }

  try {
    const messages = [
      {
        role: 'system',
        content: context ? `${SYSTEM_PROMPT}\n\nTraveller context: ${context}` : SYSTEM_PROMPT,
      },
      ...history.slice(-6).map((entry) => ({
        role: entry.role === 'user' ? 'user' : 'assistant',
        content: entry.text,
      })),
      { role: 'user', content: message },
    ];

    const response = await client.chat.completions.create({
      model: getAiStatus().model,
      messages,
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content?.trim() || offlineAnswer(message);
  } catch (error) {
    console.error('[VibeVoyage AI] Groq API Error:', error.message);
    return offlineAnswer(message);
  }
}

export default generateAITravelResponse;
