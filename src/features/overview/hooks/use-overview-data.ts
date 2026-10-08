/**
 * Hook to fetch overview dashboard data.
 */

"use client";

import { useEffect, useState } from "react";
import type { OverviewData } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";

export function useOverviewData() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await mockDataClient.getOverview();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
