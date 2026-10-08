/**
 * Severity scoring logic.
 * Score = count × average severity × 1.5 if any in-app signal exists.
 */

import { INCIDENT_RULES } from "@/data/constants";
import type { Complaint } from "@/data/types";

/**
 * Calculate the average severity from a list of complaints.
 */
export function calculateAverageSeverity(complaints: Complaint[]): number {
  if (complaints.length === 0) return 0;
  const sum = complaints.reduce((acc, c) => acc + c.severity, 0);
  return sum / complaints.length;
}

/**
 * Check if any complaints are from in-app source.
 */
export function hasInAppSignal(complaints: Complaint[]): boolean {
  return complaints.some((c) => c.source === "in_app");
}

/**
 * Calculate incident severity score.
 * Formula: count × avgSeverity × (1.5 if in-app exists, else 1.0)
 */
export function calculateIncidentScore(complaints: Complaint[]): number {
  if (complaints.length === 0) return 0;

  const count = complaints.length;
  const avgSeverity = calculateAverageSeverity(complaints);
  const hasInApp = hasInAppSignal(complaints);

  const multiplier = hasInApp ? INCIDENT_RULES.IN_APP_MULTIPLIER : 1.0;

  return count * avgSeverity * multiplier;
}

/**
 * Normalize a severity score to a 1-10 scale for display.
 */
export function normalizeScore(score: number, maxScore = 100): number {
  const normalized = (score / maxScore) * 10;
  return Math.min(Math.max(normalized, 1), 10);
}
