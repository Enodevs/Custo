/**
 * Accuracy metrics page.
 */

"use client";

import { useEffect, useState } from "react";
import type { AccuracyMetrics } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { formatPercentage, formatDateTime } from "@/lib/formatting";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function AccuracyPage() {
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await mockDataClient.getAccuracy();
      setMetrics(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Model Accuracy
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Classification performance metrics on gold-standard test set
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Banking Demo Data</p>
            <p className="text-sm text-muted-foreground">
              These metrics are evaluated on banking complaints only. Other
              industry packs will have separate accuracy metrics when available.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Gold Set Size
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {metrics.goldSetSize}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Hand-labelled samples
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Category Accuracy
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {formatPercentage(metrics.categoryAccuracy, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Overall classification
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Language Accuracy
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {formatPercentage(metrics.languageAccuracy, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Language detection
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Evaluated
          </p>
          <p className="text-lg font-semibold">
            {formatDateTime(metrics.evaluatedAt)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Last run</p>
        </div>
      </div>

      {/* Per-Category Metrics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Per-Category Performance
        </h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Precision
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Recall
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    F1 Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(metrics.perCategoryMetrics).map(
                  ([category, categoryMetrics]) => (
                    <tr key={category} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">
                        {category}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {formatPercentage(categoryMetrics.precision, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {formatPercentage(categoryMetrics.recall, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums font-medium">
                        {formatPercentage(categoryMetrics.f1, 0)}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-lg border border-border bg-muted/20 p-6">
        <h3 className="text-sm font-semibold mb-2">Methodology Note</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Metrics calculated on a hand-labelled gold-standard test set.
          Production systems would use larger test sets with regular updates to
          track model drift. Precision measures correctness of positive
          predictions, recall measures coverage of actual positives, and F1 is
          the harmonic mean of both.
        </p>
      </div>
    </div>
  );
}
