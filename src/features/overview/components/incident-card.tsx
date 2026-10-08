/**
 * Incident card for displaying incident summary in lists.
 */

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Incident } from "@/data/types";
import { ORGANIZATIONS } from "@/data/constants";
import { formatRelativeTime } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const org = ORGANIZATIONS[incident.organizationId];
  const orgColor = org?.color || "#666";

  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: orgColor }}
            />
            <span className="text-sm font-semibold">
              {org?.name || "Unknown"}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {incident.category}
            </span>
            {incident.isConfirmedByBoth && (
              <>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-ok">
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmed by both
                </span>
              </>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold tabular-nums">
              {incident.count}
            </span>
            <span className="text-sm text-muted-foreground">complaints</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium text-critical">
              {incident.ratio.toFixed(1)}x baseline
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(incident.startTime)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              incident.status === "flagged"
                ? "bg-critical/10 text-critical"
                : "bg-warning/10 text-warning",
            )}
          >
            {incident.status === "flagged" ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Flagged
              </span>
            ) : (
              "Watching"
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">
              Severity {incident.severity.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {incident.publicCount} public • {incident.inAppCount} in-app
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
