/**
 * Organizations comparison page.
 * Demo currently shows banking data only.
 */

"use client";

import { useEffect, useState } from "react";
import type { OrganizationComparison } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { ORGANIZATIONS, HOME_ORGANIZATION } from "@/data/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await mockDataClient.getOrganizationComparison();
      setOrganizations(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const homeOrg = organizations.find((o) => o.organizationId === HOME_ORGANIZATION.id);
  const otherOrgs = organizations.filter((o) => o.organizationId !== HOME_ORGANIZATION.id);

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Banking Demo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare complaint metrics across demo organizations (banking data only)
        </p>
      </div>

      {/* Home Organization (Wema Bank) */}
      {homeOrg && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Your Organization
          </h2>
          <div className="rounded-lg border-2 border-accent-primary bg-accent-primary/5 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {homeOrg.name}
                </h3>
                <p className="text-sm text-accent-primary font-medium mt-1">
                  HOME ORGANIZATION
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {homeOrg.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-critical" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-ok" />
                )}
                <span className="text-muted-foreground">
                  {homeOrg.trend === "up" ? "Increasing" : "Decreasing"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Incidents
                </p>
                <p className="text-3xl font-semibold tabular-nums">
                  {homeOrg.activeIncidents}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Complaints (24h)
                </p>
                <p className="text-3xl font-semibold tabular-nums">
                  {homeOrg.complaintsLast24h}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg Severity
                </p>
                <p className="text-3xl font-semibold tabular-nums">
                  {homeOrg.avgSeverity.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Organizations */}
      {otherOrgs.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Other Organizations
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherOrgs.map((org) => (
              <div
                key={org.organizationId}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {org.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {org.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-critical" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-ok" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Active Incidents
                    </p>
                    <p className="text-2xl font-semibold tabular-nums">
                      {org.activeIncidents}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Complaints (24h)
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {org.complaintsLast24h}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Avg Severity
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {org.avgSeverity.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
