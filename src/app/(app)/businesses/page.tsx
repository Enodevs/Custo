/**
 * Businesses management page.
 */

"use client";

import { useState } from "react";
import { Plus, Building2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_BUSINESSES, INDUSTRIES } from "@/data/constants";
import type { BusinessConfig } from "@/data/types";

export default function BusinessesPage() {
	const [businesses] = useState<BusinessConfig[]>(DEMO_BUSINESSES);

	return (
		<div className="container mx-auto py-8 px-6 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Businesses</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your businesses and their complaint tracking
					</p>
				</div>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Add Business
				</Button>
			</div>

			{/* Business Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{businesses.map((business) => (
					<div
						key={business.id}
						className="rounded-lg border border-border bg-card p-6 hover:border-accent-primary/50 transition-colors"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center gap-3">
								{business.logo ? (
									<img
										src={business.logo}
										alt={business.name}
										className="h-10 w-10 rounded"
									/>
								) : (
									<div
										className="h-10 w-10 rounded flex items-center justify-center text-white font-semibold"
										style={{ backgroundColor: business.color }}
									>
										{business.name.charAt(0)}
									</div>
								)}
								<div>
									<h3 className="font-semibold">{business.name}</h3>
									<p className="text-xs text-muted-foreground">
										{INDUSTRIES[business.industryPackId]?.name || business.industryPackId}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="sm">
									<Edit className="h-3 w-3" />
								</Button>
								<Button variant="ghost" size="sm">
									<Trash2 className="h-3 w-3 text-critical" />
								</Button>
							</div>
						</div>

						{business.description && (
							<p className="text-sm text-muted-foreground mb-4">
								{business.description}
							</p>
						)}

						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Categories</span>
								<span className="font-medium">{business.categories.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Languages</span>
								<span className="font-medium">{business.languages.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Sources</span>
								<span className="font-medium">{business.sources.length}</span>
							</div>
						</div>

						<div className="mt-4 pt-4 border-t border-border">
							<Button variant="outline" size="sm" className="w-full">
								<Building2 className="h-3 w-3 mr-2" />
								View Dashboard
							</Button>
						</div>
					</div>
				))}
			</div>

			{/* Empty State */}
			{businesses.length === 0 && (
				<div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
					<Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Get started by adding your first business to track complaints
					</p>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Your First Business
					</Button>
				</div>
			)}

			{/* Quick Stats */}
			<div className="rounded-lg border border-border bg-card p-6">
				<h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<div>
						<p className="text-sm text-muted-foreground mb-1">
							Total Businesses
						</p>
						<p className="text-2xl font-semibold tabular-nums">
							{businesses.length}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground mb-1">
							Total Categories
						</p>
						<p className="text-2xl font-semibold tabular-nums">
							{businesses.reduce((sum, b) => sum + b.categories.length, 0)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground mb-1">Industries</p>
						<p className="text-2xl font-semibold tabular-nums">
							{new Set(businesses.map((b) => b.industryPackId)).size}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
