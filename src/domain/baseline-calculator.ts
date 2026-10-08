/**
 * Baseline calculation logic.
 * Calculates 7-day baseline for comparison.
 */

import type { Complaint } from "@/data/types";

/**
 * Calculate the baseline complaint count for an organization and category over a period.
 * Uses the average daily count over the baseline period (typically 7 days).
 */
export function calculateBaseline(
  complaints: Complaint[],
  organizationId: string,
  category: string,
  baselineDays = 7,
): number {
  const filtered = complaints.filter(
    (c) => c.organizationId === organizationId && c.category === category,
  );

  if (filtered.length === 0) return 0;

  const now = new Date();
  const baselineStart = new Date(
    now.getTime() - baselineDays * 24 * 60 * 60 * 1000,
  );

  const baselineComplaints = filtered.filter(
    (c) => c.timestamp >= baselineStart && c.timestamp <= now,
  );

  return baselineComplaints.length / baselineDays;
}

/**
 * Calculate baseline over a specific time window (e.g., 6 hours).
 */
export function calculateBaselineForWindow(
  complaints: Complaint[],
  organizationId: string,
  category: string,
  windowHours: number,
  baselineDays = 7,
): number {
  const dailyBaseline = calculateBaseline(
    complaints,
    organizationId,
    category,
    baselineDays,
  );

  return (dailyBaseline / 24) * windowHours;
}

/**
 * Get the percentage change from baseline.
 */
export function getChangeFromBaseline(
  current: number,
  baseline: number,
): number {
  if (baseline === 0) return current > 0 ? 100 : 0;
  return ((current - baseline) / baseline) * 100;
}
