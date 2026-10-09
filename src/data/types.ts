/**
 * Core type definitions for Custo.
 * Universal platform for any business type.
 */

export type SeverityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Product represents the entity customers are complaining about.
 */
export interface Product {
  id: string;
  name: string;
  bot_name?: string | null;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Conversation message in a complaint intake flow.
 */
export interface ConversationMessage {
  id: string;
  complaint_id: string;
  role: "user" | "assistant";
  content: string;
  masked_content: string;
  created_at: Date;
}

/**
 * AI classification result.
 */
export interface AIClassification {
  language: "en" | "pcm" | "yo" | "ha" | "mixed";
  english_translation?: string;
  entity?: string | null;
  category: string;
  severity: SeverityLevel;
  sentiment: "negative" | "neutral" | "positive";
  amount_ngn?: number | null;
  channel_hint?: string | null;
  is_genuine_complaint: boolean;
}

/**
 * Industry Pack defines categories and rules for a specific vertical.
 */
export interface IndustryPack {
  id: string;
  name: string;
  categories: string[];
  defaultSources: string[];
  isSample?: boolean; // True for packs that are shown but not implemented
}

/**
 * Organization configuration (formerly Bank).
 */
export interface BusinessConfig {
  id: string;
  name: string;
  industryPackId: string; // References an IndustryPack
  color: string;
  logo?: string;
  description?: string;
  categories: string[];
  languages: string[];
  sources: string[];
  createdAt?: Date;
}

export interface Complaint {
  id: string;
  product_id: string; // References Product
  organizationId?: string; // Legacy field for backward compatibility
  category: string;
  language: string;
  source: string;
  text: string;
  translatedText?: string;
  severity: SeverityLevel;
  timestamp: Date;
  ready?: boolean; // True when classification is complete
  classification?: AIClassification;
  metadata: {
    url?: string;
    username?: string;
    confidence: number;
  };
}

export interface Incident {
  id: string;
  product_id: string; // References Product
  organizationId?: string; // Legacy field for backward compatibility
  category: string;
  count: number;
  severity: number;
  baseline: number;
  ratio: number;
  startTime: Date;
  endTime: Date;
  isConfirmedByBoth: boolean;
  publicCount: number;
  inAppCount: number;
  complaints: Complaint[];
  peakTime: Date;
  status: "watching" | "flagged" | "resolved";
}

export interface StatTile {
  label: string;
  value: number | string;
  delta?: number;
  trend?: "up" | "down" | "stable";
  sparkline?: number[];
}

export interface LiveSignal {
  id: string;
  complaint: Complaint;
  timestamp: Date;
}

export interface OrganizationComparison {
  organizationId: string;
  name: string;
  color: string;
  activeIncidents: number;
  complaintsLast24h: number;
  avgSeverity: number;
  trend: "up" | "down" | "stable";
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
  avgSeverity: number;
  categories: Record<string, number>;
}

export interface AccuracyMetrics {
  goldSetSize: number;
  evaluatedAt: Date;
  categoryAccuracy: number;
  languageAccuracy: number;
  perCategoryMetrics: Record<
    string,
    {
      precision: number;
      recall: number;
      f1: number;
    }
  >;
  confusionMatrix: number[][];
}

export interface Settings {
  workspace: {
    name: string;
    role: string;
    organization: BusinessConfig; // Primary organization (formerly "home bank")
    industryPackId: string; // Active industry pack
  };
  rules: {
    spikeThreshold: number;
    minComplaints: number;
    timeWindowHours: number;
  };
  alerts: {
    email: boolean;
    slack: boolean;
    whatsapp: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
}

export interface OverviewData {
  stats: {
    activeIncidents: StatTile;
    complaintsLast24h: StatTile;
    confirmedByBoth: StatTile;
    medianTimeToDetect: StatTile;
  };
  activeIncidents: Incident[];
  liveSignals: LiveSignal[];
  categoryHeatmap: {
    hour: number;
    category: string;
    count: number;
  }[];
  organizationComparison: OrganizationComparison[];
}

// Legacy type alias for backward compatibility during migration
export type IndustryTemplate = IndustryPack;
