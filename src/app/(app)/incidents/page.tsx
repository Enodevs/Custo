
"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Incident } from "@/data/types";
import { useProductContext } from "@/features/products/product-context";
import { IncidentCard } from "@/features/overview/components/incident-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentsPage() {
  const { selectedProductId } = useProductContext();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchIncidents = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (selectedProductId !== "all") {
        params.set("productId", selectedProductId);
      }

      const query = params.toString();
      const response = await fetch(
        `/api/incidents${query ? `?${query}` : ""}`,
        { cache: "no-store", signal },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Couldn't load incidents.");
      }

      if (!signal.aborted) {
        setIncidents(result.incidents ?? []);
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(
          err instanceof Error ? err.message : "Couldn't load incidents.",
        );
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchIncidents(controller.signal);

    return () => controller.abort();
  }, [fetchIncidents, refreshKey]);

  if (loading && incidents.length === 0) {
    return (
      <div className="container mx-auto space-y-4 px-6 py-8">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Incidents
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {incidents.length} stored incidents
            {loading ? " · Refreshing…" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!error && !loading && incidents.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <h2 className="font-medium">No stored incidents yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Incidents recorded for your selected product will appear here.
            Complaint spikes detected by the overview are separate from
            records stored in your incidents table.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}
