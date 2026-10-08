/**
 * Mock DataClient implementation with seeded data.
 * Simulates API latency and provides demo data.
 */

import { calculateBaselineForWindow } from "@/domain/baseline-calculator";
import { calculateRatio, getIncidentStatus } from "@/domain/incident-detection";
import {
  calculateAverageSeverity,
  calculateIncidentScore,
} from "@/domain/severity-score";
import {
  HOME_ORGANIZATION,
  INCIDENT_RULES,
  INDUSTRY_PACKS,
  ORGANIZATIONS,
} from "@/data/constants";
import type {
  AccuracyMetrics,
  Complaint,
  Incident,
  LanguageStats,
  LiveSignal,
  OrganizationComparison,
  OverviewData,
  Settings,
} from "@/data/types";
import type { DataClient } from "@/data/client";
import { generateComplaints } from "./seed-generator";

/**
 * Simulate API latency.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock DataClient with seeded data.
 */
export class MockDataClient implements DataClient {
  private complaints: Complaint[];
  private settings: Settings;
  private liveSignalCallbacks: Array<(signal: LiveSignal) => void> = [];
  private liveSignalInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.complaints = generateComplaints();
    this.settings = this.getDefaultSettings();
    this.startLiveSignalSimulation();
  }

  private getDefaultSettings(): Settings {
    return {
      workspace: {
        name: "Wema Radar",
        role: "Head of Customer Experience",
        organization: HOME_ORGANIZATION,
        industryPackId: "banking",
      },
      rules: {
        spikeThreshold: INCIDENT_RULES.SPIKE_THRESHOLD,
        minComplaints: INCIDENT_RULES.MIN_COMPLAINTS,
        timeWindowHours: INCIDENT_RULES.TIME_WINDOW_HOURS,
      },
      alerts: {
        email: true,
        slack: false,
        whatsapp: false,
      },
    };
  }

  private startLiveSignalSimulation() {
    // Emit a new signal every 5-15 seconds
    this.liveSignalInterval = setInterval(() => {
      if (this.liveSignalCallbacks.length === 0) return;

      const recentComplaints = this.complaints.slice(-50);
      const randomComplaint =
        recentComplaints[Math.floor(Math.random() * recentComplaints.length)];

      const signal: LiveSignal = {
        id: `signal-${Date.now()}`,
        complaint: randomComplaint,
        timestamp: new Date(),
      };

      for (const callback of this.liveSignalCallbacks) {
        callback(signal);
      }
    }, 8000);
  }

  private groupIntoIncidents(): Incident[] {
    const now = new Date();
    const windowMs = this.settings.rules.timeWindowHours * 60 * 60 * 1000;

    // Group complaints by organization and category
    const groups = new Map<string, Complaint[]>();

    for (const complaint of this.complaints) {
      const key = `${complaint.organizationId}-${complaint.category}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(complaint);
    }

    const incidents: Incident[] = [];
    let incidentId = 1;

    for (const [key, groupComplaints] of groups) {
      const [organizationId, category] = key.split("-");

      // Find complaints within the time window
      const windowComplaints = groupComplaints.filter(
        (c) => c.timestamp.getTime() >= now.getTime() - windowMs,
      );

      if (windowComplaints.length === 0) continue;

      const count = windowComplaints.length;
      const baseline = calculateBaselineForWindow(
        this.complaints,
        organizationId,
        category,
        this.settings.rules.timeWindowHours,
      );
      const ratio = calculateRatio(count, baseline);
      const status = getIncidentStatus(count, baseline);

      const publicCount = windowComplaints.filter(
        (c) => c.source !== "in_app",
      ).length;
      const inAppCount = windowComplaints.filter(
        (c) => c.source === "in_app",
      ).length;

      const startTime = windowComplaints[0]?.timestamp || new Date();
      const endTime =
        windowComplaints[windowComplaints.length - 1]?.timestamp || new Date();

      // Find peak time
      const peakTime = windowComplaints.reduce(
        (peak, c) => (c.timestamp > peak ? c.timestamp : peak),
        startTime,
      );

      incidents.push({
        id: `incident-${incidentId++}`,
        organizationId,
        category,
        count,
        severity: calculateIncidentScore(windowComplaints),
        baseline,
        ratio,
        startTime,
        endTime,
        isConfirmedByBoth: publicCount > 0 && inAppCount > 0,
        publicCount,
        inAppCount,
        complaints: windowComplaints,
        peakTime,
        status,
      });
    }

    return incidents.sort((a, b) => b.severity - a.severity);
  }

  async getOverview(): Promise<OverviewData> {
    await delay(300);

    const incidents = this.groupIntoIncidents();
    const activeIncidents = incidents.filter((i) => i.status === "flagged");

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const complaintsLast24h = this.complaints.filter(
      (c) => c.timestamp >= last24h,
    );

    const confirmedByBoth = activeIncidents.filter(
      (i) => i.isConfirmedByBoth,
    ).length;

    // Mock time to detect (in minutes)
    const avgDetectionTime = 45;

    const stats = {
      activeIncidents: {
        label: "Active incidents",
        value: activeIncidents.length,
        delta: 12,
        trend: "up" as const,
      },
      complaintsLast24h: {
        label: "Complaints in 24h",
        value: complaintsLast24h.length,
        delta: -8,
        trend: "down" as const,
      },
      confirmedByBoth: {
        label: "Confirmed by both",
        value: confirmedByBoth,
        delta: 5,
        trend: "up" as const,
      },
      medianTimeToDetect: {
        label: "Median time to detect",
        value: `${avgDetectionTime}m`,
        delta: -15,
        trend: "down" as const,
      },
    };

    // Generate recent live signals
    const liveSignals: LiveSignal[] = this.complaints
      .slice(-10)
      .map((c, i) => ({
        id: `signal-${i}`,
        complaint: c,
        timestamp: c.timestamp,
      }));

    // Generate category heatmap (24 hours × categories)
    const categoryHeatmap = [];
    const activePack = INDUSTRY_PACKS[this.settings.workspace.industryPackId];
    const categories = activePack?.categories || INDUSTRY_PACKS.banking.categories;

    for (let hour = 0; hour < 24; hour++) {
      for (const category of categories) {
        const count = complaintsLast24h.filter(
          (c) => c.category === category && c.timestamp.getHours() === hour,
        ).length;
        categoryHeatmap.push({ hour, category, count });
      }
    }

    const organizationComparison = await this.getOrganizationComparison();

    return {
      stats,
      activeIncidents: activeIncidents.slice(0, 10),
      liveSignals,
      categoryHeatmap,
      organizationComparison,
    };
  }

  async getIncidents(params?: {
    organizationId?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ incidents: Incident[]; total: number }> {
    await delay(200);

    let incidents = this.groupIntoIncidents();

    if (params?.organizationId) {
      incidents = incidents.filter((i) => i.organizationId === params.organizationId);
    }
    if (params?.category) {
      incidents = incidents.filter((i) => i.category === params.category);
    }
    if (params?.status) {
      incidents = incidents.filter((i) => i.status === params.status);
    }

    const total = incidents.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      incidents: incidents.slice(start, end),
      total,
    };
  }

  async getIncident(id: string): Promise<Incident> {
    await delay(150);

    const incidents = this.groupIntoIncidents();
    const incident = incidents.find((i) => i.id === id);

    if (!incident) {
      throw new Error(`Incident ${id} not found`);
    }

    return incident;
  }

  async getComplaints(params?: {
    search?: string;
    organizationId?: string;
    category?: string;
    language?: string;
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    await delay(200);

    let filtered = [...this.complaints];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter((c) => c.text.toLowerCase().includes(search));
    }
    if (params?.organizationId) {
      filtered = filtered.filter((c) => c.organizationId === params.organizationId);
    }
    if (params?.category) {
      filtered = filtered.filter((c) => c.category === params.category);
    }
    if (params?.language) {
      filtered = filtered.filter((c) => c.language === params.language);
    }
    if (params?.source) {
      filtered = filtered.filter((c) => c.source === params.source);
    }

    const total = filtered.length;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      complaints: filtered.slice(start, end).reverse(),
      total,
    };
  }

  async getOrganizationComparison(): Promise<OrganizationComparison[]> {
    await delay(150);

    const orgIds = Object.keys(ORGANIZATIONS);
    const incidents = this.groupIntoIncidents();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return orgIds.map((orgId) => {
      const org = ORGANIZATIONS[orgId];
      const orgIncidents = incidents.filter(
        (i) => i.organizationId === orgId && i.status === "flagged",
      );
      const orgComplaints = this.complaints.filter(
        (c) => c.organizationId === orgId && c.timestamp >= last24h,
      );

      const avgSeverity =
        orgComplaints.length > 0
          ? calculateAverageSeverity(orgComplaints)
          : 0;

      return {
        organizationId: orgId,
        name: org.name,
        color: org.color,
        activeIncidents: orgIncidents.length,
        complaintsLast24h: orgComplaints.length,
        avgSeverity,
        trend: Math.random() > 0.5 ? "up" : ("down" as const),
      };
    });
  }

  async getLanguageStats(): Promise<LanguageStats[]> {
    await delay(150);

    const languages = ["en", "pcm", "yo", "ha", "mixed"] as const;
    const total = this.complaints.length;
    const activePack = INDUSTRY_PACKS[this.settings.workspace.industryPackId];
    const categories = activePack?.categories || INDUSTRY_PACKS.banking.categories;

    return languages.map((language) => {
      const langComplaints = this.complaints.filter(
        (c) => c.language === language,
      );
      const count = langComplaints.length;
      const percentage = count / total;
      const avgSeverity = calculateAverageSeverity(langComplaints);

      const categoryMap: Record<string, number> = {};
      for (const cat of categories) {
        categoryMap[cat] = 0;
      }

      for (const complaint of langComplaints) {
        if (categoryMap[complaint.category] !== undefined) {
          categoryMap[complaint.category]++;
        }
      }

      return {
        language,
        count,
        percentage,
        avgSeverity,
        categories: categoryMap,
      };
    });
  }

  async getAccuracy(): Promise<AccuracyMetrics> {
    await delay(100);

    // Demo accuracy metrics (banking pack only)
    return {
      goldSetSize: 50,
      evaluatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      categoryAccuracy: 0.87,
      languageAccuracy: 0.94,
      perCategoryMetrics: {
        "Failed Transfer": { precision: 0.89, recall: 0.91, f1: 0.9 },
        "App Downtime": { precision: 0.92, recall: 0.88, f1: 0.9 },
        "ATM Issue": { precision: 0.85, recall: 0.83, f1: 0.84 },
        "Card Fraud": { precision: 0.8, recall: 0.78, f1: 0.79 },
        "Poor Service": { precision: 0.84, recall: 0.86, f1: 0.85 },
      },
      confusionMatrix: [
        [45, 2, 1, 1, 1, 0],
        [3, 44, 2, 0, 1, 0],
        [2, 1, 42, 3, 2, 0],
        [1, 0, 4, 39, 4, 2],
        [1, 2, 3, 5, 38, 1],
        [2, 1, 1, 2, 3, 41],
      ],
    };
  }

  subscribeToSignals(callback: (signal: LiveSignal) => void): () => void {
    this.liveSignalCallbacks.push(callback);

    return () => {
      const index = this.liveSignalCallbacks.indexOf(callback);
      if (index > -1) {
        this.liveSignalCallbacks.splice(index, 1);
      }
    };
  }

  async submitInAppComplaint(complaint: {
    text: string;
    category?: string;
  }): Promise<Complaint> {
    await delay(500);

    const newComplaint: Complaint = {
      id: `complaint-${this.complaints.length + 1}`,
      organizationId: this.settings.workspace.organization.id,
      category: complaint.category || "Other",
      language: "en",
      source: "in_app",
      text: complaint.text,
      severity: 7,
      timestamp: new Date(),
      metadata: {
        confidence: 0.85,
        username: "demo-user",
      },
    };

    this.complaints.push(newComplaint);

    // Emit as live signal
    const signal: LiveSignal = {
      id: `signal-${Date.now()}`,
      complaint: newComplaint,
      timestamp: new Date(),
    };

    for (const callback of this.liveSignalCallbacks) {
      callback(signal);
    }

    return newComplaint;
  }

  async getSettings(): Promise<Settings> {
    await delay(100);
    return { ...this.settings };
  }

  async saveSettings(updates: Partial<Settings>): Promise<Settings> {
    await delay(200);

    this.settings = {
      ...this.settings,
      ...updates,
      workspace: { ...this.settings.workspace, ...updates.workspace },
      rules: { ...this.settings.rules, ...updates.rules },
      alerts: { ...this.settings.alerts, ...updates.alerts },
    };

    return { ...this.settings };
  }

  async simulateSpike(organizationId: string, category: string): Promise<void> {
    await delay(300);

    // Add 15 new complaints in rapid succession
    for (let i = 0; i < 15; i++) {
      const newComplaint: Complaint = {
        id: `spike-${Date.now()}-${i}`,
        organizationId,
        category,
        language: "en",
        source: i % 2 === 0 ? "x" : "in_app",
        text: `Simulated complaint for ${category} spike`,
        severity: (8 + Math.floor(Math.random() * 2)) as 8 | 9 | 10,
        timestamp: new Date(Date.now() - (15 - i) * 60 * 1000), // Last 15 minutes
        metadata: {
          confidence: 0.9,
          username: `spike-user-${i}`,
        },
      };

      this.complaints.push(newComplaint);
    }
  }

  async resetDemoData(): Promise<void> {
    await delay(200);
    this.complaints = generateComplaints();
  }

  destroy() {
    if (this.liveSignalInterval) {
      clearInterval(this.liveSignalInterval);
    }
  }
}

// Export singleton instance
export const mockDataClient = new MockDataClient();
