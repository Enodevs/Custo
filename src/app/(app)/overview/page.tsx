"use client";

import { useOverviewData } from "@/features/overview/hooks/use-overview-data";
import { useProductContext } from "@/features/products/product-context";
import { StatTile } from "@/features/overview/components/stat-tile";
import { IncidentCard } from "@/features/overview/components/incident-card";
import { LiveFeed } from "@/features/overview/components/live-feed";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  complaints: {
    label: "Complaints",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function OverviewPage() {
  const { data, loading, error } = useOverviewData();
  const { products, selectedProductId } = useProductContext();

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId,
  );

  if (loading) {
    return (
      <div className="container mx-auto space-y-8 px-6 py-8">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-[360px] w-full" />

        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="rounded-lg border border-destructive/30 p-6">
          <h2 className="font-semibold">
            Couldn&apos;t load your overview
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">{error}</p>

          <button
            type="button"
            className="mt-4 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">
          No dashboard data is available right now.
        </p>
      </div>
    );
  }

  const hasProducts = products.length > 0;

  return (
    <div className="container mx-auto space-y-8 px-6 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Overview
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {selectedProduct
            ? `Complaint intelligence for ${selectedProduct.name}`
            : "Complaint intelligence across all your products"}
        </p>
      </header>

      {!hasProducts ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <h2 className="font-semibold">No products yet</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a product to start viewing its complaint intelligence.
          </p>

          <a
            href="/businesses"
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Set up a product
          </a>
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <section
            aria-label="Overview statistics"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatTile stat={data.stats.activeIncidents} />
            <StatTile stat={data.stats.complaintsLast24h} />
            <StatTile stat={data.stats.confirmedByBoth} />
            <StatTile stat={data.stats.medianTimeToDetect} />
          </section>

          {/* Real complaint activity chart */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-6">
              <h2 className="text-lg font-semibold tracking-tight">
                Complaint Activity
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Complaints recorded per hour over the last 24 hours.
              </p>
            </div>

            {data.complaintsTrend.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  No complaint activity data is available yet.
                </p>
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="h-[280px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={data.complaintsTrend}
                  margin={{
                    left: 0,
                    right: 12,
                    top: 12,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="complaintFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-complaints)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-complaints)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={32}
                    tick={{ fontSize: 11 }}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />

                  <Area
                    dataKey="complaints"
                    type="monotone"
                    stroke="var(--color-complaints)"
                    strokeWidth={2}
                    fill="url(#complaintFill)"
                    fillOpacity={1}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </section>

          {/* Incidents and recent complaints */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">
                  Active Incidents
                </h2>

                <a
                  href="/incidents"
                  className="text-sm text-accent-primary hover:underline"
                >
                  View all
                </a>
              </div>

              <div className="space-y-3">
                {data.activeIncidents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                    <p className="text-sm font-medium">
                      No active incidents detected
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      No complaint spikes currently meet the detection
                      threshold for this selection.
                    </p>
                  </div>
                ) : (
                  data.activeIncidents.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Recent Complaints
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Latest complaints from your selected products.
                </p>
              </div>

              <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-card p-4">
                {data.liveSignals.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No complaints recorded in the last 24 hours.
                  </p>
                ) : (
                  <LiveFeed />
                )}
              </div>
            </div>
          </section>

          {/* Product comparison */}
          {selectedProductId === "all" &&
            data.organizationComparison.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Product Comparison
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Compare complaint activity across your products.
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                            Product
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                            Active Incidents
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                            Complaints (24h)
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                            Average Severity
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {data.organizationComparison.map((product) => (
                          <tr
                            key={product.organizationId}
                            className="hover:bg-muted/30"
                          >
                            <td className="px-4 py-3 text-sm font-medium">
                              {product.name}
                            </td>

                            <td className="px-4 py-3 text-right text-sm tabular-nums">
                              {product.activeIncidents}
                            </td>

                            <td className="px-4 py-3 text-right text-sm tabular-nums">
                              {product.complaintsLast24h}
                            </td>

                            <td className="px-4 py-3 text-right text-sm tabular-nums">
                              {product.avgSeverity.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
        </>
      )}
    </div>
  );
}
