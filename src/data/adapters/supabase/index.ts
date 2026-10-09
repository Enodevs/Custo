/**
 * Supabase DataClient implementation.
 * Uses real database for complaints, products, and incidents.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AccuracyMetrics,
  Complaint,
  Incident,
  LanguageStats,
  LiveSignal,
  OrganizationComparison,
  OverviewData,
  Settings,
  Product,
  ConversationMessage,
} from "@/data/types";
import type { DataClient } from "@/data/client";
import { calculateBaselineForWindow } from "@/domain/baseline-calculator";
import { calculateRatio, getIncidentStatus } from "@/domain/incident-detection";
import {
  calculateAverageSeverity,
  calculateIncidentScore,
} from "@/domain/severity-score";

/**
 * Supabase DataClient with real persistence.
 */
export class SupabaseDataClient implements DataClient {
  private liveSignalCallbacks: Array<(signal: LiveSignal) => void> = [];
  private realtimeChannel?: any;

  constructor(private supabase: SupabaseClient) {
    this.setupRealtimeSubscription();
  }

  private setupRealtimeSubscription() {
    this.realtimeChannel = this.supabase
      .channel("complaints-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaints",
        },
        async (payload) => {
          const complaint = await this.mapComplaintFromDb(payload.new);
          const signal: LiveSignal = {
            id: `signal-${Date.now()}`,
            complaint,
            timestamp: new Date(),
          };
          for (const callback of this.liveSignalCallbacks) {
            callback(signal);
          }
        },
      )
      .subscribe();
  }

  private async mapComplaintFromDb(row: any): Promise<Complaint> {
    return {
      id: row.id,
      product_id: row.product_id,
      category: row.category,
      language: row.language,
      source: row.source,
      text: row.text,
      translatedText: row.translated_text,
      severity: row.severity,
      timestamp: new Date(row.timestamp),
      ready: row.ready,
      classification: row.classification_language
        ? {
            language: row.classification_language,
            english_translation: row.translated_text,
            entity: row.classification_entity,
            category: row.category,
            severity: row.severity,
            sentiment: row.classification_sentiment,
            amount_ngn: row.classification_amount_ngn,
            channel_hint: row.classification_channel_hint,
            is_genuine_complaint: row.classification_is_genuine,
          }
        : undefined,
      metadata: {
        url: row.url,
        username: row.username,
        confidence: row.confidence || 0.8,
      },
    };
  }

  private async groupIntoIncidents(
    productId?: string,
    timeWindowHours = 24,
  ): Promise<Incident[]> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowHours * 60 * 60 * 1000);

    let query = this.supabase
      .from("complaints")
      .select("*")
      .gte("timestamp", windowStart.toISOString());

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: complaints, error } = await query;

    if (error) throw error;
    if (!complaints || complaints.length === 0) return [];

    // Group by product and category
    const groups = new Map<string, any[]>();
    for (const c of complaints) {
      const key = `${c.product_id}-${c.category}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(c);
    }

    const incidents: Incident[] = [];
    for (const [key, groupComplaints] of groups) {
      const [product_id, category] = key.split("-");
      const count = groupComplaints.length;

      // Calculate baseline from historical data
      const baseline = await this.calculateBaseline(product_id, category, timeWindowHours);
      const ratio = calculateRatio(count, baseline);
      const status = getIncidentStatus(count, baseline);

      const mapped = await Promise.all(
        groupComplaints.map((c: any) => this.mapComplaintFromDb(c)),
      );

      const publicCount = mapped.filter((c) => c.source !== "in_app").length;
      const inAppCount = mapped.filter((c) => c.source === "in_app").length;

      const startTime = new Date(groupComplaints[0].timestamp);
      const endTime = new Date(groupComplaints[groupComplaints.length - 1].timestamp);
      const peakTime = new Date(
        groupComplaints.reduce((peak: any, c: any) =>
          new Date(c.timestamp) > new Date(peak.timestamp) ? c : peak,
        ).timestamp,
      );

      incidents.push({
        id: `${product_id}-${category}-${startTime.getTime()}`,
        product_id,
        category,
        count,
        severity: calculateIncidentScore(mapped),
        baseline,
        ratio,
        startTime,
        endTime,
        isConfirmedByBoth: publicCount > 0 && inAppCount > 0,
        publicCount,
        inAppCount,
        complaints: mapped,
        peakTime,
        status,
      });
    }

    return incidents.sort((a, b) => b.severity - a.severity);
  }

  private async calculateBaseline(
    productId: string,
    category: string,
    windowHours: number,
  ): Promise<number> {
    const now = new Date();
    const historicalStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
    const windowEnd = new Date(now.getTime() - windowHours * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from("complaints")
      .select("id")
      .eq("product_id", productId)
      .eq("category", category)
      .gte("timestamp", historicalStart.toISOString())
      .lt("timestamp", windowEnd.toISOString());

    if (error) return 1;
    const historicalCount = data?.length || 0;
    const daysCovered = 7 - windowHours / 24;
    return Math.max(1, historicalCount / daysCovered);
  }

  async getOverview(): Promise<OverviewData> {
    const incidents = await this.groupIntoIncidents();
    const activeIncidents = incidents.filter((i) => i.status === "flagged");

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentComplaints } = await this.supabase
      .from("complaints")
      .select("*")
      .gte("timestamp", last24h.toISOString());

    const complaintsLast24h = recentComplaints || [];
    const confirmedByBoth = activeIncidents.filter((i) => i.isConfirmedByBoth).length;

    const stats = {
      activeIncidents: {
        label: "Active incidents",
        value: activeIncidents.length,
        delta: 0,
        trend: "stable" as const,
      },
      complaintsLast24h: {
        label: "Complaints in 24h",
        value: complaintsLast24h.length,
        delta: 0,
        trend: "stable" as const,
      },
      confirmedByBoth: {
        label: "Confirmed by both",
        value: confirmedByBoth,
        delta: 0,
        trend: "stable" as const,
      },
      medianTimeToDetect: {
        label: "Median time to detect",
        value: "45m",
        delta: 0,
        trend: "stable" as const,
      },
    };

    // Get recent signals
    const { data: recentSignals } = await this.supabase
      .from("complaints")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(10);

    const liveSignals: LiveSignal[] = recentSignals
      ? await Promise.all(
          recentSignals.map(async (c: any) => ({
            id: c.id,
            complaint: await this.mapComplaintFromDb(c),
            timestamp: new Date(c.timestamp),
          })),
        )
      : [];

    // Category heatmap - simplified for now
    const categoryHeatmap: any[] = [];

    // Organization comparison - stub for now
    const organizationComparison: OrganizationComparison[] = [];

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
    let incidents = await this.groupIntoIncidents(params?.organizationId);

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
    const incidents = await this.groupIntoIncidents();
    const incident = incidents.find((i) => i.id === id);
    if (!incident) throw new Error(`Incident ${id} not found`);
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
    let query = this.supabase.from("complaints").select("*", { count: "exact" });

    if (params?.organizationId) {
      query = query.eq("product_id", params.organizationId);
    }
    if (params?.category) {
      query = query.eq("category", params.category);
    }
    if (params?.language) {
      query = query.eq("language", params.language);
    }
    if (params?.source) {
      query = query.eq("source", params.source);
    }
    if (params?.search) {
      query = query.ilike("text", `%${params.search}%`);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    query = query.order("timestamp", { ascending: false }).range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    const complaints = data
      ? await Promise.all(data.map((c: any) => this.mapComplaintFromDb(c)))
      : [];

    return {
      complaints,
      total: count || 0,
    };
  }

  async getOrganizationComparison(): Promise<OrganizationComparison[]> {
    // Stub - would need products table integration
    return [];
  }

  async getLanguageStats(): Promise<LanguageStats[]> {
    const { data: complaints } = await this.supabase
      .from("complaints")
      .select("language, severity, category");

    if (!complaints) return [];

    const languages = ["en", "pcm", "yo", "ha", "mixed"] as const;
    const total = complaints.length;

    return languages.map((language) => {
      const langComplaints = complaints.filter((c: any) => c.language === language);
      const count = langComplaints.length;
      const avgSeverity =
        count > 0
          ? langComplaints.reduce((sum: number, c: any) => sum + c.severity, 0) / count
          : 0;

      const categories: Record<string, number> = {};
      for (const c of langComplaints) {
        categories[c.category] = (categories[c.category] || 0) + 1;
      }

      return {
        language,
        count,
        percentage: count / total,
        avgSeverity,
        categories,
      };
    });
  }

  async getAccuracy(): Promise<AccuracyMetrics> {
    // Mock data for now
    return {
      goldSetSize: 0,
      evaluatedAt: new Date(),
      categoryAccuracy: 0,
      languageAccuracy: 0,
      perCategoryMetrics: {},
      confusionMatrix: [],
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
    // This is the old interface - redirect to the new intake API
    throw new Error("Use /api/support/intake endpoint instead");
  }

  async getSettings(): Promise<Settings> {
    // Stub - would need settings table
    throw new Error("Settings not implemented in Supabase adapter yet");
  }

  async saveSettings(settings: Partial<Settings>): Promise<Settings> {
    throw new Error("Settings not implemented in Supabase adapter yet");
  }

  destroy() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }
  }
}
