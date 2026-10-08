/**
 * Overview dashboard page.
 */

"use client";

import { StatTile } from "@/features/overview/components/stat-tile";
import { IncidentCard } from "@/features/overview/components/incident-card";
import { LiveFeed } from "@/features/overview/components/live-feed";
import { useOverviewData } from "@/features/overview/hooks/use-overview-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewPage() {
  const { data, loading } = useOverviewData();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time complaint intelligence across Nigerian banks
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatTile stat={data.stats.activeIncidents} />
        <StatTile stat={data.stats.complaintsLast24h} />
        <StatTile stat={data.stats.confirmedByBoth} />
        <StatTile stat={data.stats.medianTimeToDetect} />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Active Incidents
            </h2>
            <a
              href="/incidents"
              className="text-sm text-accent-primary hover:underline"
            >
              View all
            </a>
          </div>
          <div className="space-y-3">
            {data.activeIncidents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No active incidents. System is running smoothly.
                </p>
              </div>
            ) : (
              data.activeIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))
            )}
          </div>
        </div>

        {/* Live Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Live Feed</h2>
          <div className="rounded-lg border border-border bg-card p-4 max-h-[600px] overflow-y-auto">
            <LiveFeed />
          </div>
        </div>
      </div>

      {/* Organization Comparison */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Organization Comparison
        </h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Active Incidents
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Complaints (24h)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Avg Severity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.organizationComparison.map((org) => (
                  <tr key={org.organizationId} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className="inline-flex items-center gap-2">
                        {org.name}
                        {org.organizationId === "wema-bank" && (
                          <span className="text-xs text-accent-primary font-semibold">
                            HOME
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums">
                      {org.activeIncidents}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums">
                      {org.complaintsLast24h}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums">
                      {org.avgSeverity.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
