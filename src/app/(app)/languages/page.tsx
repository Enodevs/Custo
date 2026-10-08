/**
 * Languages statistics page.
 */

"use client";

import { useEffect, useState } from "react";
import type { LanguageStats } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { INDUSTRY_PACKS, LANGUAGES } from "@/data/constants";
import { formatPercentage } from "@/lib/formatting";
import { Skeleton } from "@/components/ui/skeleton";

// Get banking pack categories for demo
const BANKING_CATEGORIES = INDUSTRY_PACKS.banking.categories;

export default function LanguagesPage() {
  const [stats, setStats] = useState<LanguageStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await mockDataClient.getLanguageStats();
      setStats(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Languages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complaint distribution across Nigerian languages
        </p>
      </div>

      {/* Language Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((lang) => (
          <div
            key={lang.language}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {LANGUAGES[lang.language]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(lang.percentage)} of complaints
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Count</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {lang.count}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Average Severity
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {lang.avgSeverity.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown by Language */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Category Breakdown
        </h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Language
                  </th>
                  {BANKING_CATEGORIES.map((cat) => (
                    <th
                      key={cat}
                      className="px-4 py-3 text-right text-xs font-medium text-muted-foreground"
                    >
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.map((lang) => (
                  <tr key={lang.language} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">
                      {LANGUAGES[lang.language]}
                    </td>
                    {BANKING_CATEGORIES.map((cat) => (
                      <td
                        key={cat}
                        className="px-4 py-3 text-right text-sm tabular-nums"
                      >
                        {lang.categories[cat] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Example Translations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Built for how Nigerians write
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  NIGERIAN PIDGIN
                </span>
                <span className="text-xs font-mono font-medium">PCM</span>
              </div>
              <p className="text-sm">
                "I send money since morning, dem don debit me but the person
                never receive am."
              </p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Translation
                </p>
                <p className="text-sm italic">
                  "I sent money this morning, they debited me but the recipient
                  hasn't received it."
                </p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Classification
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Failed Transfer</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-ok">92% confidence</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  YORUBA
                </span>
                <span className="text-xs font-mono font-medium">YO</span>
              </div>
              <p className="text-sm">
                "Won ti gba owo mi sugbon olugba ko ri i."
              </p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Translation
                </p>
                <p className="text-sm italic">
                  "They've taken my money but the receiver hasn't seen it."
                </p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Classification
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Failed Transfer</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-ok">88% confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
