/**
 * Demo data tag indicator.
 */

"use client";

export function DemoTag() {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
      <div className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
      Demo data
    </div>
  );
}
