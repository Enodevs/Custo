/**
 * Analytics page - compare across your businesses.
 */

"use client";

import { useEffect, useState } from "react";
import type { OrganizationComparison } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { DEMO_BUSINESSES } from "@/data/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
	const [comparison, setComparison] = useState<OrganizationComparison[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			const result = await mockDataClient.getOrganizationComparison();
			setComparison(result);
			setLoading(false);
		}
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-6 space-y-4">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<Skeleton key={i} className="h-48" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-6 space-y-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Compare complaint metrics across your businesses
				</p>
			</div>

			{/* Business Comparison Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{DEMO_BUSINESSES.map((business, idx) => {
					const stats = comparison[idx] || {
						activeIncidents: 0,
						complaintsLast24h: 0,
						avgSeverity: 0,
						trend: "stable" as const,
					};

					return (
						<div
							key={business.id}
							className="rounded-lg border border-border bg-card p-6"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div
										className="h-10 w-10 rounded flex items-center justify-center text-white font-semibold text-sm"
										style={{ backgroundColor: business.color }}
									>
										{business.name.charAt(0)}
									</div>
									<div>
										<h3 className="font-semibold">{business.name}</h3>
										<p className="text-xs text-muted-foreground">
											{business.industryPackId}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-1">
									{stats.trend === "up" ? (
										<TrendingUp className="h-3 w-3 text-critical" />
									) : stats.trend === "down" ? (
										<TrendingDown className="h-3 w-3 text-ok" />
									) : null}
								</div>
							</div>

							<div className="space-y-3">
								<div>
									<p className="text-xs text-muted-foreground mb-1">
										Active Incidents
									</p>
									<p className="text-2xl font-semibold tabular-nums">
										{stats.activeIncidents}
									</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">
										Complaints (24h)
									</p>
									<p className="text-lg font-semibold tabular-nums">
										{stats.complaintsLast24h}
									</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">
										Avg Severity
									</p>
									<p className="text-lg font-semibold tabular-nums">
										{stats.avgSeverity.toFixed(1)}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Comparison Table */}
			<div className="rounded-lg border border-border bg-card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-border bg-muted/50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
									Business
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
									Industry
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
									Active Incidents
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
									Complaints (24h)
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
									Avg Severity
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{DEMO_BUSINESSES.map((business, idx) => {
								const stats = comparison[idx] || {
									activeIncidents: 0,
									complaintsLast24h: 0,
									avgSeverity: 0,
								};

								return (
									<tr key={business.id} className="hover:bg-muted/30">
										<td className="px-4 py-3 text-sm font-medium">
											<div className="flex items-center gap-2">
												<div
													className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-semibold"
													style={{ backgroundColor: business.color }}
												>
													{business.name.charAt(0)}
												</div>
												{business.name}
											</div>
										</td>
										<td className="px-4 py-3 text-sm text-muted-foreground capitalize">
											{business.industryPackId}
										</td>
										<td className="px-4 py-3 text-right text-sm tabular-nums">
											{stats.activeIncidents}
										</td>
										<td className="px-4 py-3 text-right text-sm tabular-nums">
											{stats.complaintsLast24h}
										</td>
										<td className="px-4 py-3 text-right text-sm tabular-nums">
											{stats.avgSeverity.toFixed(1)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
