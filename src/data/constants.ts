/**
 * Application constants.
 * Industry packs and default configurations.
 */

import type { IndustryPack, BusinessConfig } from "./types";

/**
 * Industry Packs define categories and configurations for different verticals.
 * NOW: Banking is fully implemented with seed data.
 * NEXT: Telecom and Power are sample packs (shown in onboarding, no data yet).
 */
export const INDUSTRY_PACKS: Record<string, IndustryPack> = {
  banking: {
    id: "banking",
    name: "Banking & Finance",
    categories: [
      "Failed Transfer",
      "App Downtime",
      "ATM Issue",
      "Card Fraud",
      "Poor Service",
      "Account Access",
    ],
    defaultSources: ["play_store", "x", "nairaland", "in_app", "email"],
    isSample: false,
  },
  telecom: {
    id: "telecom",
    name: "Telecommunications",
    categories: [
      "Network Issue",
      "Billing Problem",
      "Poor Service",
      "Data Issue",
      "Activation Problem",
      "Coverage Issue",
    ],
    defaultSources: ["x", "play_store", "email", "in_app"],
    isSample: true, // Sample pack - no seed data yet
  },
  power: {
    id: "power",
    name: "Power Distribution",
    categories: [
      "Outage",
      "Billing Issue",
      "Poor Service",
      "Meter Problem",
      "Reconnection Delay",
      "Overcharging",
    ],
    defaultSources: ["x", "email", "phone", "in_app"],
    isSample: true, // Sample pack - no seed data yet
  },
};

/**
 * Legacy industry templates for migration compatibility.
 * New code should use INDUSTRY_PACKS instead.
 */
export const INDUSTRIES: Record<string, IndustryPack> = {
  banking: INDUSTRY_PACKS.banking,
  telecom: INDUSTRY_PACKS.telecom,
  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce",
    categories: [
      "Delivery Delay",
      "Wrong Item",
      "Damaged Product",
      "Payment Issue",
      "Poor Quality",
      "Return Request",
    ],
    defaultSources: ["email", "x", "play_store", "in_app", "web"],
    isSample: true,
  },
  saas: {
    id: "saas",
    name: "SaaS / Software",
    categories: [
      "Bug Report",
      "Feature Request",
      "Performance Issue",
      "Login Problem",
      "Billing Issue",
      "Integration Error",
    ],
    defaultSources: ["in_app", "email", "x", "web"],
    isSample: true,
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare",
    categories: [
      "Appointment Issue",
      "Billing Problem",
      "Long Wait Time",
      "Poor Service",
      "Medical Records",
      "Insurance Issue",
    ],
    defaultSources: ["email", "phone", "in_app", "web"],
    isSample: true,
  },
  hospitality: {
    id: "hospitality",
    name: "Hotels & Hospitality",
    categories: [
      "Room Issue",
      "Service Quality",
      "Booking Problem",
      "Cleanliness",
      "Staff Behavior",
      "Amenities",
    ],
    defaultSources: ["email", "x", "play_store", "web"],
    isSample: true,
  },
};

export const LANGUAGES: Record<string, string> = {
  en: "English",
  pcm: "Nigerian Pidgin",
  yo: "Yoruba",
  ha: "Hausa",
  ig: "Igbo",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  mixed: "Mixed",
};

export const LANGUAGE_CODES: Record<string, string> = {
  en: "EN",
  pcm: "PCM",
  yo: "YO",
  ha: "HA",
  ig: "IG",
  fr: "FR",
  es: "ES",
  ar: "AR",
  mixed: "MIX",
};

export const SOURCES: Record<string, string> = {
  play_store: "Play Store",
  app_store: "App Store",
  x: "X (Twitter)",
  facebook: "Facebook",
  instagram: "Instagram",
  nairaland: "Nairaland",
  in_app: "In-App",
  email: "Email",
  phone: "Phone",
  web: "Web Form",
  whatsapp: "WhatsApp",
};

export const INCIDENT_RULES = {
  MIN_COMPLAINTS: 5,
  SPIKE_THRESHOLD: 2.0,
  TIME_WINDOW_HOURS: 6,
  IN_APP_MULTIPLIER: 1.5,
} as const;

// Demo businesses for initial setup
export const DEMO_BUSINESSES: BusinessConfig[] = [
  {
    id: "wema-bank",
    name: "Wema Bank",
    industryPackId: "banking",
    color: "#7C3AED",
    description: "Leading Nigerian digital bank",
    categories: [
      "Failed Transfer",
      "App Downtime",
      "ATM Issue",
      "Card Fraud",
      "Poor Service",
    ],
    languages: ["en", "pcm", "yo", "ha"],
    sources: ["play_store", "x", "nairaland", "in_app"],
  },
  {
    id: "jumia-nigeria",
    name: "Jumia Nigeria",
    industryPackId: "ecommerce",
    color: "#F97316",
    description: "Leading online marketplace",
    categories: [
      "Delivery Delay",
      "Wrong Item",
      "Damaged Product",
      "Payment Issue",
      "Poor Quality",
    ],
    languages: ["en", "pcm"],
    sources: ["play_store", "x", "email", "in_app"],
  },
  {
    id: "paystack",
    name: "Paystack",
    industryPackId: "saas",
    color: "#06B6D4",
    description: "Payment infrastructure for businesses",
    categories: [
      "Payment Failed",
      "Integration Issue",
      "Settlement Delay",
      "API Error",
      "Dashboard Bug",
    ],
    languages: ["en"],
    sources: ["email", "x", "in_app"],
  },
];

/**
 * Home organization (Wema Bank) - the primary demo organization.
 */
export const HOME_ORGANIZATION = DEMO_BUSINESSES[0];

/**
 * Map of all demo organizations by ID for easy lookup.
 */
export const ORGANIZATIONS: Record<string, BusinessConfig> =
  DEMO_BUSINESSES.reduce(
    (acc, org) => {
      acc[org.id] = org;
      return acc;
    },
    {} as Record<string, BusinessConfig>,
  );
