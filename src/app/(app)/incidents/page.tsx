/**
 * Incidents list page.
 */

"use client";

import { useEffect, useState } from "react";
import type { Incident } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { IncidentCard } from "@/features/overview/components/incident-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await mockDataClient.getIncidents();
      setIncidents(result.incidents);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {incidents.length} incidents detected
        </p>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}
