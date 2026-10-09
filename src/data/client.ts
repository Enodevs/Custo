/**
 * DataClient interface - the seam between components and data adapters.
 * Components call these methods; adapters (mock or http) implement them.
 */

import type {
  AccuracyMetrics,
  OrganizationComparison,
  Complaint,
  Incident,
  LanguageStats,
  LiveSignal,
  OverviewData,
  Settings,
  Product,
} from "./types";

export interface DataClient {
  /**
   * Get overview dashboard data including stats, incidents, live feed, and charts.
   */
  getOverview(): Promise<OverviewData>;

  /**
   * Get paginated list of incidents with optional filters.
   */
  getIncidents(params?: {
    organizationId?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ incidents: Incident[]; total: number }>;

  /**
   * Get a single incident by ID with full details.
   */
  getIncident(id: string): Promise<Incident>;

  /**
   * Get paginated complaints with search and filters.
   */
  getComplaints(params?: {
    search?: string;
    organizationId?: string;
    category?: string;
    language?: string;
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<{ complaints: Complaint[]; total: number }>;

  /**
   * Get organization comparison data across all organizations.
   */
  getOrganizationComparison(): Promise<OrganizationComparison[]>;

  /**
   * Get language distribution and statistics.
   */
  getLanguageStats(): Promise<LanguageStats[]>;

  /**
   * Get model accuracy metrics.
   */
  getAccuracy(): Promise<AccuracyMetrics>;

  /**
   * Subscribe to live signal updates. Returns unsubscribe function.
   */
  subscribeToSignals(callback: (signal: LiveSignal) => void): () => void;

  /**
   * Submit a new in-app complaint (for live demo).
   * @deprecated Use /api/support/intake endpoint instead
   */
  submitInAppComplaint(complaint: {
    text: string;
    category?: string;
  }): Promise<Complaint>;

  /**
   * Get current settings.
   */
  getSettings(): Promise<Settings>;

  /**
   * Save settings.
   */
  saveSettings(settings: Partial<Settings>): Promise<Settings>;

  /**
   * Get all products.
   */
  getProducts?(): Promise<Product[]>;

  /**
   * Simulate a spike for demo purposes.
   */
  simulateSpike?(organizationId: string, category: string): Promise<void>;

  /**
   * Reset demo data.
   */
  resetDemoData?(): Promise<void>;
}
