/**
 * Live signal feed component showing recent complaints.
 */

"use client";

import { useEffect, useState } from "react";
import type { LiveSignal } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { ORGANIZATIONS, LANGUAGE_CODES } from "@/data/constants";
import { formatRelativeTime } from "@/lib/formatting";

export function LiveFeed() {
  const [signals, setSignals] = useState<LiveSignal[]>([]);

  useEffect(() => {
    // Load initial signals
    mockDataClient.getOverview().then((data) => {
      setSignals(data.liveSignals);
    });

    // Subscribe to new signals
    const unsubscribe = mockDataClient.subscribeToSignals((signal) => {
      setSignals((prev) => [signal, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, []);

  return (
    <div className="space-y-1">
      {signals.map((signal) => {
        const org = ORGANIZATIONS[signal.complaint.organizationId];
        const orgColor = org?.color || "#666";
        return (
          <div
            key={signal.id}
            className="rounded-md border border-border bg-card p-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-start gap-2">
              <div
                className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: orgColor }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {org?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {signal.complaint.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {LANGUAGE_CODES[signal.complaint.language]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {signal.complaint.text}
                </p>
                <p className="text-[10px] text-faint mt-1">
                  {formatRelativeTime(signal.timestamp)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
