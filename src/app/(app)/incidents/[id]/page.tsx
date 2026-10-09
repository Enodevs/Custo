"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { Incident } from "@/data/types";
import { LANGUAGE_CODES, SOURCES } from "@/data/constants";
import { formatDateTime } from "@/lib/formatting";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProductContext } from "@/features/products/product-context";

type IncidentDetail = Incident & {
  productName: string;
  title: string;
  summary: string;
};

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { selectedProductId } = useProductContext();

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const searchParams = new URLSearchParams({ id });

        if (selectedProductId && selectedProductId !== "all") {
          searchParams.set("productId", selectedProductId);
        }

        const response = await fetch(
          `/api/incidents?${searchParams.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Couldn't load this incident.");
        }

        const result = (payload.incidents ?? [])[0] as
          | IncidentDetail
          | undefined;

        setIncident(result ?? null);

        if (!result) {
          setError("This incident wasn't found in your products.");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong loading this incident.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [id, selectedProductId]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-4 px-6 py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="container mx-auto space-y-4 px-6 py-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-sm text-muted-foreground">
          {error || "Incident not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-6 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
          <span className="text-sm font-medium">{incident.productName}</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">
            {incident.category}
          </span>
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize">
            {incident.status}
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {incident.title}
        </h1>

        {incident.summary && (
          <p className="max-w-3xl text-sm text-muted-foreground">
            {incident.summary}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Created {formatDateTime(incident.startTime)}
          {incident.endTime.getTime() !== incident.startTime.getTime() &&
            ` · Updated ${formatDateTime(incident.endTime)}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Recorded complaints
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {incident.count}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Severity
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {incident.severity}/10
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Sample complaints
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {incident.complaints.length}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Sample complaints</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent complaints associated with this product and category.
          </p>
        </div>

        {incident.complaints.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md bg-muted/30 p-4 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            No matching complaints were found for this incident.
          </div>
        ) : (
          <div className="space-y-4">
            {incident.complaints.map((complaint) => (
              <article
                key={complaint.id}
                className="rounded-md border border-border bg-muted/20 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium">
                      {LANGUAGE_CODES[complaint.language] ??
                        complaint.language}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {SOURCES[complaint.source] ?? complaint.source}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {formatDateTime(complaint.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">
                    Severity {complaint.severity}/10
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm">{complaint.text}</p>

                {complaint.translatedText && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    Translation: {complaint.translatedText}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
