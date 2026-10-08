/**
 * Incident detection logic.
 * An incident is flagged when count >= 5 and ratio >= 2x baseline.
 */

import { INCIDENT_RULES } from "@/data/constants";
import type { Complaint } from "@/data/types";

export interface IncidentCandidate {
  organizationId: string;
  category: string;
  complaints: Complaint[];
  startTime: Date;
  endTime: Date;
}

/**
 * Detect if a group of complaints constitutes an incident.
 * Returns true if the group meets threshold criteria.
 */
export function isIncident(
  count: number,
  baseline: number,
  minComplaints = INCIDENT_RULES.MIN_COMPLAINTS,
  spikeThreshold = INCIDENT_RULES.SPIKE_THRESHOLD,
): boolean {
  if (count < minComplaints) return false;
  if (baseline === 0) return count >= minComplaints;
  const ratio = count / baseline;
  return ratio >= spikeThreshold;
}

/**
 * Calculate the spike ratio relative to baseline.
 */
export function calculateRatio(count: number, baseline: number): number {
  if (baseline === 0) return count > 0 ? Number.POSITIVE_INFINITY : 0;
  return count / baseline;
}

/**
 * Determine incident status based on ratio and thresholds.
 */
export function getIncidentStatus(
  count: number,
  baseline: number,
): "watching" | "flagged" {
  return isIncident(count, baseline) ? "flagged" : "watching";
}

/**
 * Group complaints into incident candidates by organization and category within time windows.
 */
export function groupComplaintsIntoIncidents(
  complaints: Complaint[],
  timeWindowHours = INCIDENT_RULES.TIME_WINDOW_HOURS,
): IncidentCandidate[] {
  const groups = new Map<string, Complaint[]>();

  for (const complaint of complaints) {
    const key = `${complaint.organizationId}-${complaint.category}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)?.push(complaint);
  }

  const candidates: IncidentCandidate[] = [];

  for (const [key, groupComplaints] of groups) {
    const [organizationId, category] = key.split("-");
    const sorted = [...groupComplaints].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    let windowStart = 0;
    while (windowStart < sorted.length) {
      const startTime = sorted[windowStart].timestamp;
      const endTime = new Date(
        startTime.getTime() + timeWindowHours * 60 * 60 * 1000,
      );

      const windowComplaints = sorted.filter(
        (c) => c.timestamp >= startTime && c.timestamp <= endTime,
      );

      if (windowComplaints.length > 0) {
        candidates.push({
          organizationId,
          category,
          complaints: windowComplaints,
          startTime,
          endTime,
        });
      }

      windowStart += windowComplaints.length || 1;
    }
  }

  return candidates;
}
