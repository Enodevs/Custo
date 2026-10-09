import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Incident } from "@/data/types";
import { formatRelativeTime } from "@/lib/formatting";
import { cn } from "@/lib/utils";

type IncidentCardData = Incident & {
  productName?: string;
  title?: string;
};

interface IncidentCardProps {
  incident: IncidentCardData;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const statusLabel =
    incident.status === "flagged"
      ? "Flagged"
      : incident.status === "resolved"
        ? "Resolved"
        : "Watching";

  return (
    <Link
      href={`/incidents/${encodeURIComponent(incident.id)}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {incident.productName ?? "Product"}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {incident.title ?? incident.category}
            </span>

            {incident.isConfirmedByBoth && (
              <>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-ok">
                  <CheckCircle2 className="h-3 w-3" />
                  Confirmed by both
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold tabular-nums">
              {incident.count}
            </span>
            <span className="text-sm text-muted-foreground">
              recorded complaints
            </span>

            {incident.ratio > 0 && (
              <>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm font-medium text-critical">
                  {incident.ratio.toFixed(1)}× baseline
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(incident.startTime)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              incident.status === "flagged"
                ? "bg-critical/10 text-critical"
                : incident.status === "resolved"
                  ? "bg-muted text-muted-foreground"
                  : "bg-warning/10 text-warning",
            )}
          >
            {incident.status === "flagged" && (
              <AlertTriangle className="mr-1 inline h-3 w-3" />
            )}
            {statusLabel}
          </div>

          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">
              Severity {incident.severity.toFixed(1)}/10
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
