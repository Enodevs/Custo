/**
 * Incident detail page.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Incident } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { ORGANIZATIONS, LANGUAGE_CODES, SOURCES } from "@/data/constants";
import { formatDateTime } from "@/lib/formatting";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function IncidentDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const [incident, setIncident] = useState<Incident | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await mockDataClient.getIncident(id);
				setIncident(result);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-6">
				<Skeleton className="h-8 w-64 mb-6" />
				<div className="space-y-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-48" />
				</div>
			</div>
		);
	}

	if (!incident) {
		return (
			<div className="container mx-auto py-8 px-6">
				<p>Incident not found</p>
			</div>
		);
	}

	const org = ORGANIZATIONS[incident.organizationId];
	const orgColor = org?.color || "#666";

	return (
		<div className="container mx-auto py-8 px-6 space-y-6">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => router.back()}
				className="mb-4"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back
			</Button>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<div
						className="h-3 w-3 rounded-full"
						style={{ backgroundColor: orgColor }}
					/>
					<h1 className="text-2xl font-semibold tracking-tight">
						{org?.name || "Unknown"} • {incident.category}
					</h1>
					{incident.isConfirmedByBoth && (
						<span className="inline-flex items-center gap-1 text-sm font-medium text-ok">
							<CheckCircle2 className="h-4 w-4" />
							Confirmed by both
						</span>
					)}
				</div>
				<p className="text-sm text-muted-foreground">
					{formatDateTime(incident.startTime)} -{" "}
					{formatDateTime(incident.endTime)}
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm font-medium text-muted-foreground mb-2">
						Total Complaints
					</p>
					<p className="text-3xl font-semibold tabular-nums">{incident.count}</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm font-medium text-muted-foreground mb-2">
						Spike Ratio
					</p>
					<p className="text-3xl font-semibold tabular-nums text-critical">
						{incident.ratio.toFixed(1)}x
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm font-medium text-muted-foreground mb-2">
						Severity Score
					</p>
					<p className="text-3xl font-semibold tabular-nums">
						{incident.severity.toFixed(1)}
					</p>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="text-lg font-semibold mb-4">Sample Complaints</h2>
				<div className="space-y-4">
					{incident.complaints.slice(0, 10).map((complaint) => (
						<div
							key={complaint.id}
							className="rounded-md border border-border bg-muted/20 p-4"
						>
							<div className="flex items-start justify-between mb-2">
								<div className="flex items-center gap-2 text-xs">
									<span className="font-medium">
										{LANGUAGE_CODES[complaint.language]}
									</span>
									<span className="text-muted-foreground">•</span>
									<span className="text-muted-foreground">
										{SOURCES[complaint.source]}
									</span>
								</div>
								<span className="text-xs font-medium tabular-nums">
									Severity {complaint.severity}
								</span>
							</div>
							<p className="text-sm">{complaint.text}</p>
							{complaint.translatedText && (
								<p className="text-sm text-muted-foreground mt-2 italic">
									Translation: {complaint.translatedText}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
