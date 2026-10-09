
"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { LANGUAGE_CODES, SOURCES } from "@/data/constants";
import { formatDateTime } from "@/lib/formatting";
import { useProductContext } from "@/features/products/product-context";

interface ComplaintRow {
  id: string;
  product_id: string;
  productName: string;
  category: string;
  language: string;
  source: string;
  text: string;
  translatedText?: string;
  severity: number;
  timestamp: string | Date;
}

export default function ComplaintsPage() {
  const { selectedProductId } = useProductContext();
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchComplaints() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          search,
          limit: "100",
        });

        if (selectedProductId !== "all") {
          params.set("productId", selectedProductId);
        }

        const response = await fetch(
          `/api/complaints?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Couldn't load complaints.",
          );
        }

        if (!controller.signal.aborted) {
          setComplaints(result.complaints ?? []);
          setTotal(result.total ?? 0);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load complaints.",
          );
          setComplaints([]);
          setTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchComplaints();

    return () => controller.abort();
  }, [search, selectedProductId]);

  if (loading && complaints.length === 0) {
    return (
      <div className="container mx-auto space-y-4 px-6 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Complaints
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total.toLocaleString()} complaints tracked
          {loading ? " · Refreshing…" : ""}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10"
        />
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => setSearch((value) => value)}
            className="inline-flex shrink-0 items-center gap-2 text-foreground hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Complaint",
                  "Language",
                  "Source",
                  "Severity",
                  "Time",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground ${
                      heading === "Severity" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {complaints.map((complaint) => {
                const language =
                  LANGUAGE_CODES[
                    complaint.language as keyof typeof LANGUAGE_CODES
                  ] ?? complaint.language;

                const source =
                  SOURCES[
                    complaint.source as keyof typeof SOURCES
                  ] ?? complaint.source;

                return (
                  <tr
                    key={complaint.id}
                    className="hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {complaint.productName}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {complaint.category}
                    </td>

                    <td className="max-w-md px-4 py-3 text-sm">
                      <p className="line-clamp-2">
                        {complaint.text || "No complaint text"}
                      </p>

                      {complaint.translatedText && (
                        <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">
                          {complaint.translatedText}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs">
                      {language}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {source}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium tabular-nums">
                      {complaint.severity}/10
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(new Date(complaint.timestamp))}
                    </td>
                  </tr>
                );
              })}

              {!error && !loading && complaints.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center"
                  >
                    <p className="font-medium">No complaints found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search
                        ? "Try a different search term."
                        : "Complaints will appear here when your product receives them."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing up to 100 matching complaints, newest first.
      </p>
    </div>
  );
}
