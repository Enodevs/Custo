"use client";

import { useEffect, useState } from "react";
import type { OverviewData } from "@/data/types";
import { useProductContext } from "@/features/products/product-context";

export function useOverviewData() {
  const { selectedProductId } = useProductContext();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (selectedProductId !== "all") {
          params.set("productId", selectedProductId);
        }

        const query = params.toString();
        const response = await fetch(
          `/api/dashboard/overview${query ? `?${query}` : ""}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Couldn't load dashboard data.",
          );
        }

        if (!controller.signal.aborted) {
          setData(result as OverviewData);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't load dashboard data.",
          );
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => controller.abort();
  }, [selectedProductId]);

  return { data, loading, error };
}
