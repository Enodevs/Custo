/**
 * Settings page.
 */

"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/data/types";
import { mockDataClient } from "@/data/adapters/mock";
import { ORGANIZATIONS } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";

export default function SettingsPage() {
	const [settings, setSettings] = useState<Settings | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		async function fetchData() {
			const result = await mockDataClient.getSettings();
			setSettings(result);
			setLoading(false);
		}
		fetchData();
	}, []);

	const handleSave = async () => {
		if (!settings) return;
		setSaving(true);
		try {
			await mockDataClient.saveSettings(settings);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-6 space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96 w-full max-w-2xl" />
			</div>
		);
	}

	if (!settings) return null;

	return (
		<div className="container mx-auto py-8 px-6 space-y-8 max-w-3xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Configure your workspace and preferences
				</p>
			</div>

			{/* Workspace */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Workspace</h2>
				<div className="rounded-lg border border-border bg-card p-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="workspace-name">Workspace Name</Label>
						<Input
							id="workspace-name"
							value={settings.workspace.name}
							onChange={(e) =>
								setSettings({
									...settings,
									workspace: { ...settings.workspace, name: e.target.value },
								})
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role">Your Role</Label>
						<Input
							id="role"
							value={settings.workspace.role}
							onChange={(e) =>
								setSettings({
									...settings,
									workspace: { ...settings.workspace, role: e.target.value },
								})
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="organization">Home Organization</Label>
						<Input
							id="organization"
							value={settings.workspace.organization.name}
							disabled
							className="bg-muted"
						/>
						<p className="text-xs text-muted-foreground">
							Currently using {settings.workspace.organization.industryPackId} industry pack
						</p>
					</div>
				</div>
			</div>

			{/* Detection Rules */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Incident Detection</h2>
				<div className="rounded-lg border border-border bg-card p-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="min-complaints">
							Minimum Complaints: {settings.rules.minComplaints}
						</Label>
						<input
							type="range"
							id="min-complaints"
							min="3"
							max="10"
							value={settings.rules.minComplaints}
							onChange={(e) =>
								setSettings({
									...settings,
									rules: {
										...settings.rules,
										minComplaints: Number(e.target.value),
									},
								})
							}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="spike-threshold">
							Spike Threshold: {settings.rules.spikeThreshold}x
						</Label>
						<input
							type="range"
							id="spike-threshold"
							min="1.5"
							max="5"
							step="0.5"
							value={settings.rules.spikeThreshold}
							onChange={(e) =>
								setSettings({
									...settings,
									rules: {
										...settings.rules,
										spikeThreshold: Number(e.target.value),
									},
								})
							}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="time-window">
							Time Window: {settings.rules.timeWindowHours} hours
						</Label>
						<input
							type="range"
							id="time-window"
							min="1"
							max="24"
							value={settings.rules.timeWindowHours}
							onChange={(e) =>
								setSettings({
									...settings,
									rules: {
										...settings.rules,
										timeWindowHours: Number(e.target.value),
									},
								})
							}
							className="w-full"
						/>
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={saving}>
					{saving ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
							Saving...
						</>
					) : (
						<>
							<Save className="h-4 w-4 mr-2" />
							Save Changes
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
