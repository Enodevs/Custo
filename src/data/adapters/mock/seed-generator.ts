/**
 * Deterministic seed data generator for demo purposes.
 * Generates ~600 complaints over 7 days with realistic distribution.
 * Banking pack only - other industry packs have no seed data yet.
 */

import { HOME_ORGANIZATION, INDUSTRY_PACKS, LANGUAGES, SOURCES } from "@/data/constants";
import type { Complaint, SeverityLevel } from "@/data/types";

// Get banking pack categories
const BANKING_PACK = INDUSTRY_PACKS.banking;
const BANKING_CATEGORIES = BANKING_PACK.categories;

const EXAMPLE_COMPLAINTS: Record<
  string,
  { text: string; translation?: string }
> = {
  "en-Failed Transfer": {
    text: "Double debit on my POS transaction at 6pm, still no reversal after 3 days.",
  },
  "en-App Downtime": {
    text: "Your app has been down since morning. Cannot login to check my balance.",
  },
  "en-ATM Issue": {
    text: "ATM dispensed error but debited my account. This is unacceptable.",
  },
  "pcm-Failed Transfer": {
    text: "I send money since morning, dem don debit me but the person never receive am.",
    translation:
      "I sent money this morning, they debited me but the recipient hasn't received it.",
  },
  "pcm-ATM Issue": {
    text: "Abeg, ATM no gree give me cash but my account show say dem debit me 20,000.",
    translation:
      "Please, the ATM didn't dispense cash but my account shows a debit of 20,000.",
  },
  "yo-Failed Transfer": {
    text: "Won ti gba owo mi sugbon olugba ko ri i.",
    translation: "They've taken my money but the receiver hasn't seen it.",
  },
  "ha-Failed Transfer": {
    text: "An cire mini kudi amma mai karba bai samu ba.",
    translation: "Money was deducted from me but the receiver didn't get it.",
  },
};

/**
 * Simple seeded random number generator for deterministic output.
 */
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Get a random item from an array using seeded random.
 */
function randomChoice<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Get a weighted random item.
 */
function weightedChoice<T>(
  items: T[],
  weights: number[],
  rand: () => number,
): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = rand() * total;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }

  return items[items.length - 1];
}

/**
 * Generate a complaint text based on language and category.
 */
function generateComplaintText(
  language: string,
  category: string,
  rand: () => number,
): { text: string; translation?: string } {
  const key = `${language}-${category}`;
  if (EXAMPLE_COMPLAINTS[key]) {
    return EXAMPLE_COMPLAINTS[key];
  }

  // Fallback to English examples
  const fallbackKey = `en-${category}`;
  if (EXAMPLE_COMPLAINTS[fallbackKey]) {
    return EXAMPLE_COMPLAINTS[fallbackKey];
  }

  return {
    text: `Issue with ${category.toLowerCase()} - reference #${Math.floor(rand() * 100000)}`,
  };
}

/**
 * Generate seeded complaints data.
 * Only generates banking data - Wema Bank is the home organization.
 */
export function generateComplaints(seed = 12345): Complaint[] {
  const rand = seededRandom(seed);
  const complaints: Complaint[] = [];

  const organizationId = HOME_ORGANIZATION.id;
  const categories = BANKING_CATEGORIES;
  const languages = Object.keys(LANGUAGES);
  const sources = Object.keys(SOURCES);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Generate base complaints (~540 spread across 7 days)
  for (let i = 0; i < 540; i++) {
    // Random timestamp with evening peaks (6pm-9pm)
    const dayOffset = rand() * 7;
    const hour = Math.floor(rand() * 24);
    const isPeakHour = hour >= 18 && hour <= 21;

    // Skip some non-peak hours to create realistic distribution
    if (!isPeakHour && rand() > 0.4) continue;

    const timestamp = new Date(
      sevenDaysAgo.getTime() +
        dayOffset * 24 * 60 * 60 * 1000 +
        hour * 60 * 60 * 1000 +
        rand() * 60 * 60 * 1000,
    );

    // Weighted category distribution
    const category = weightedChoice(
      categories,
      [30, 20, 15, 10, 10, 15], // Failed Transfer, App Downtime, ATM Issue, Card Fraud, Poor Service, Account Access
      rand,
    );

    // Weighted language distribution
    const language = weightedChoice(
      languages,
      [45, 35, 10, 6, 4], // en, pcm, yo, ha, mixed
      rand,
    );

    // Weighted source distribution
    const source = weightedChoice(
      sources,
      [25, 30, 20, 25], // play_store, x, nairaland, in_app
      rand,
    );

    const { text, translation } = generateComplaintText(language, category, rand);
    const severity = (Math.floor(rand() * 7) + 3) as SeverityLevel; // 3-10

    complaints.push({
      id: `complaint-${i + 1}`,
      organizationId,
      category,
      language,
      source,
      text,
      translatedText: translation,
      severity,
      timestamp,
      metadata: {
        confidence: 0.75 + rand() * 0.2,
        username: `user${Math.floor(rand() * 1000)}`,
      },
    });
  }

  // Add seeded incident 1: Wema Failed Transfers (flagged, confirmed by both)
  const wemaIncidentStart = new Date(now.getTime() - 8 * 60 * 60 * 1000); // 8 hours ago
  for (let i = 0; i < 18; i++) {
    const minuteOffset = i * 20 + rand() * 10; // Spread over 6 hours
    const source =
      i < 12
        ? randomChoice(["play_store", "x", "nairaland"], rand)
        : "in_app";

    complaints.push({
      id: `wema-incident-${i + 1}`,
      organizationId,
      category: "Failed Transfer",
      language: i % 3 === 0 ? "pcm" : i % 3 === 1 ? "en" : "yo",
      source,
      text: EXAMPLE_COMPLAINTS["pcm-Failed Transfer"].text,
      translatedText: EXAMPLE_COMPLAINTS["pcm-Failed Transfer"].translation,
      severity: (7 + Math.floor(rand() * 3)) as SeverityLevel,
      timestamp: new Date(
        wemaIncidentStart.getTime() + minuteOffset * 60 * 1000,
      ),
      metadata: {
        confidence: 0.85 + rand() * 0.1,
        username: `user${Math.floor(rand() * 1000)}`,
      },
    });
  }

  // Add seeded incident 2: Wema App Downtime (flagged, public only)
  const appIncidentStart = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
  for (let i = 0; i < 22; i++) {
    const minuteOffset = i * 11 + rand() * 5; // Spread over 4 hours

    complaints.push({
      id: `app-incident-${i + 1}`,
      organizationId,
      category: "App Downtime",
      language: i % 2 === 0 ? "en" : "pcm",
      source: randomChoice(["play_store", "x", "nairaland"], rand),
      text: EXAMPLE_COMPLAINTS["en-App Downtime"].text,
      severity: (8 + Math.floor(rand() * 2)) as SeverityLevel,
      timestamp: new Date(appIncidentStart.getTime() + minuteOffset * 60 * 1000),
      metadata: {
        confidence: 0.9 + rand() * 0.08,
        username: `user${Math.floor(rand() * 1000)}`,
      },
    });
  }

  // Add seeded incident 3: Wema ATM Issues (watching level, not flagged yet)
  const atmIncidentStart = new Date(now.getTime() - 10 * 60 * 60 * 1000);
  for (let i = 0; i < 7; i++) {
    const minuteOffset = i * 60 + rand() * 20; // Spread over 8 hours

    complaints.push({
      id: `atm-incident-${i + 1}`,
      organizationId,
      category: "ATM Issue",
      language: i % 2 === 0 ? "en" : "pcm",
      source: randomChoice(["play_store", "x", "in_app"], rand),
      text: EXAMPLE_COMPLAINTS["pcm-ATM Issue"].text,
      translatedText: EXAMPLE_COMPLAINTS["pcm-ATM Issue"].translation,
      severity: (4 + Math.floor(rand() * 2)) as SeverityLevel,
      timestamp: new Date(
        atmIncidentStart.getTime() + minuteOffset * 60 * 1000,
      ),
      metadata: {
        confidence: 0.8 + rand() * 0.15,
        username: `user${Math.floor(rand() * 1000)}`,
      },
    });
  }

  return complaints.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );
}
