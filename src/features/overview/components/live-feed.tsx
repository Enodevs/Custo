
"use client";

import { useEffect, useState } from "react";
import type { LiveSignal } from "@/data/types";
import { useProductContext } from "@/features/products/product-context";
import { LANGUAGE_CODES } from "@/data/constants";
import { formatRelativeTime } from "@/lib/formatting";

export function LiveFeed() {
  const { selectedProductId, products } = useProductContext();

  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSignals() {
      try {
        const params = new URLSearchParams();

        if (selectedProductId !== "all") {
          params.set("productId", selectedProductId);
        }

        const query = params.toString();
        const response = await fetch(
          `/api/dashboard/overview${query ? `?${query}` : ""}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Couldn't load the live feed.",
          );
        }

        if (!controller.signal.aborted) {
          setSignals(result.liveSignals ?? []);
          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load the live feed.",
          );
        }
      }
    }

    void fetchSignals();

    const interval = setInterval(() => {
      void fetchSignals();
    }, 30_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [selectedProductId]);

  return (
    <div className="space-y-1">
      {error && (
        <div className="rounded-md border border-destructive/30 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {signals.map((signal) => {
        const complaint = signal.complaint;

        const productName =
          products.find(
            (product) => product.id === complaint.product_id,
          )?.name ?? "Unknown product";

        const language =
          LANGUAGE_CODES[
            complaint.language as keyof typeof LANGUAGE_CODES
          ] ?? complaint.language;

        return (
          <div
            key={signal.id}
            className="animate-in fade-in slide-in-from-top-2 rounded-md border border-border bg-card p-3 text-sm duration-300"
          >
            <div className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium">
                    {productName}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {complaint.category}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {language}
                  </span>
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {complaint.text || "No complaint text"}
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatRelativeTime(signal.timestamp)}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {!error && signals.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium">No recent complaints</p>
          <p className="mt-1 text-xs text-muted-foreground">
            New complaints will appear here when available.
          </p>
        </div>
      )}

      <p className="px-1 pt-2 text-[10px] text-muted-foreground">
        Refreshes every 30 seconds
      </p>
    </div>
  );
}
