/**
 * Stat tile component with value, delta, and optional sparkline.
 */

import { TrendingDown, TrendingUp } from "lucide-react";
import type { StatTile as StatTileType } from "@/data/types";
import { cn } from "@/lib/utils";

interface StatTileProps {
  stat: StatTileType;
}

export function StatTile({ stat }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {stat.value}
          </p>
          {stat.delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium",
                stat.trend === "up"
                  ? "text-critical"
                  : stat.trend === "down"
                    ? "text-ok"
                    : "text-muted-foreground",
              )}
            >
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : stat.trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {Math.abs(stat.delta)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
