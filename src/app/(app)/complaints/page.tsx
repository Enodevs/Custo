/**
 * Complaints page with searchable table.
 */

"use client";

import { useEffect, useState } from "react";
import type { Complaint } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { ORGANIZATIONS, LANGUAGE_CODES, SOURCES } from "@/data/constants";
import { formatDateTime } from "@/lib/formatting";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const result = await mockDataClient.getComplaints({
        search,
        limit: 100,
      });
      setComplaints(result.complaints);
      setTotal(result.total);
      setLoading(false);
    }
    fetchData();
  }, [search]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Complaints</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} complaints tracked
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Text
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Language
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Source
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">
                    {ORGANIZATIONS[complaint.organizationId]?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {complaint.category}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-md">
                    <p className="line-clamp-2">{complaint.text}</p>
                    {complaint.translatedText && (
                      <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">
                        {complaint.translatedText}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">
                    {LANGUAGE_CODES[complaint.language]}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {SOURCES[complaint.source]}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums font-medium">
                    {complaint.severity}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(complaint.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
