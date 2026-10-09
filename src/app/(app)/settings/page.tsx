"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface CustoSettings {
  workspaceName: string;
  role: string;
  minComplaints: number;
  spikeThreshold: number;
  timeWindowHours: number;
  emailNotifications: boolean;
  incidentNotifications: boolean;
  multiSourceNotifications: boolean;
}

const DEFAULT_SETTINGS: CustoSettings = {
  workspaceName: "My Workspace",
  role: "Owner",
  minComplaints: 3,
  spikeThreshold: 2,
  timeWindowHours: 24,
  emailNotifications: true,
  incidentNotifications: true,
  multiSourceNotifications: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [settings, setSettings] = useState<CustoSettings | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/auth");
        return;
      }

      const metadata = user.user_metadata ?? {};
      const saved = metadata.Custo_settings ?? {};

      setEmail(user.email ?? "");
      setName(
        typeof metadata.full_name === "string"
          ? metadata.full_name
          : typeof metadata.name === "string"
            ? metadata.name
            : "",
      );

      setSettings({
        workspaceName:
          typeof saved.workspaceName === "string"
            ? saved.workspaceName
            : DEFAULT_SETTINGS.workspaceName,
        role:
          typeof metadata.role === "string"
            ? metadata.role
            : DEFAULT_SETTINGS.role,
        minComplaints: clampNumber(
          saved.minComplaints,
          3,
          10,
          DEFAULT_SETTINGS.minComplaints,
        ),
        spikeThreshold: clampNumber(
          saved.spikeThreshold,
          1.5,
          5,
          DEFAULT_SETTINGS.spikeThreshold,
        ),
        timeWindowHours: clampNumber(
          saved.timeWindowHours,
          1,
          24,
          DEFAULT_SETTINGS.timeWindowHours,
        ),
        emailNotifications:
          typeof saved.emailNotifications === "boolean"
            ? saved.emailNotifications
            : DEFAULT_SETTINGS.emailNotifications,
        incidentNotifications:
          typeof saved.incidentNotifications === "boolean"
            ? saved.incidentNotifications
            : DEFAULT_SETTINGS.incidentNotifications,
        multiSourceNotifications:
          typeof saved.multiSourceNotifications === "boolean"
            ? saved.multiSourceNotifications
            : DEFAULT_SETTINGS.multiSourceNotifications,
      });
    } catch {
      setError("Couldn't load your settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  function clampNumber(
    value: unknown,
    min: number,
    max: number,
    fallback: number,
  ) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }

  function updateSetting<K extends keyof CustoSettings>(
    key: K,
    value: CustoSettings[K],
  ) {
    setSettings((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setMessage("");
    setError("");
  }

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/auth");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          role: settings.role,
          Custo_settings: {
            ...settings,
            workspaceName: settings.workspaceName.trim(),
          },
        },
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Your settings have been saved.");
    } catch {
      setError("Couldn't save your settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/auth");
      router.refresh();
    } catch {
      setError("Couldn't sign you out. Please try again.");
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl space-y-6 px-6 py-8">
        {" "}
        <Skeleton className="h-8 w-48" /> <Skeleton className="h-24 w-full" />{" "}
        <Skeleton className="h-64 w-full" />{" "}
        <Skeleton className="h-64 w-full" />{" "}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-8">
        {" "}
        <p className="text-sm text-muted-foreground">
          Your settings couldn't be loaded.{" "}
        </p>{" "}
        <Button className="mt-4" variant="outline" onClick={fetchSettings}>
          Try again{" "}
        </Button>{" "}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-6 py-8">
      {" "}
      <div>
        {" "}
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>{" "}
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, detection rules, and notification
          preferences.{" "}
        </p>{" "}
      </div>
      {(message || error) && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            error
              ? "border-destructive/30 text-destructive"
              : "border-emerald-500/30 text-emerald-600"
          }`}
        >
          {error ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          )}
          {error || message}
        </div>
      )}
      {/* Account */}
      <section className="space-y-4">
        <SectionHeading
          icon={<UserRound className="size-4" />}
          title="Account"
          description="Your profile and sign-in information."
        />

        <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="account-name">Full name</Label>
            <Input
              id="account-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-email">Email address</Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your sign-in email is managed by your authentication provider.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-role">Role</Label>
            <Input
              id="account-role"
              value={settings.role}
              onChange={(event) => updateSetting("role", event.target.value)}
              placeholder="e.g. Owner, Developer, Analyst"
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground">
              This is a profile label, not an access-control permission.
            </p>
          </div>
        </div>
      </section>
      {/* Workspace */}
      <section className="space-y-4">
        <SectionHeading
          icon={<ShieldCheck className="size-4" />}
          title="Workspace"
          description="Personalize your Custo workspace."
        />

        <div className="space-y-2 rounded-xl border bg-card p-5 sm:p-6">
          <Label htmlFor="workspace-name">Workspace display name</Label>
          <Input
            id="workspace-name"
            value={settings.workspaceName}
            onChange={(event) =>
              updateSetting("workspaceName", event.target.value)
            }
            placeholder="My Workspace"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            This name is saved to your account preferences. It does not rename a
            product in your database.
          </p>
        </div>
      </section>
      {/* Detection */}
      <section className="space-y-4">
        <SectionHeading
          icon={<SlidersHorizontal className="size-4" />}
          title="Incident detection"
          description="Configure thresholds for identifying complaint spikes."
        />

        <div className="space-y-6 rounded-xl border bg-card p-5 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="min-complaints">Minimum complaints</Label>
              <span className="text-sm font-medium tabular-nums">
                {settings.minComplaints}
              </span>
            </div>
            <input
              id="min-complaints"
              type="range"
              min={3}
              max={10}
              step={1}
              value={settings.minComplaints}
              onChange={(event) =>
                updateSetting("minComplaints", Number(event.target.value))
              }
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Minimum complaints required before a potential incident is
              considered.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="spike-threshold">Spike threshold</Label>
              <span className="text-sm font-medium tabular-nums">
                {settings.spikeThreshold.toFixed(1)}×
              </span>
            </div>
            <input
              id="spike-threshold"
              type="range"
              min={1.5}
              max={5}
              step={0.5}
              value={settings.spikeThreshold}
              onChange={(event) =>
                updateSetting("spikeThreshold", Number(event.target.value))
              }
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              How much complaint volume must exceed its baseline to qualify as a
              spike.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="time-window">Detection time window</Label>
              <span className="text-sm font-medium tabular-nums">
                {settings.timeWindowHours}{" "}
                {settings.timeWindowHours === 1 ? "hour" : "hours"}
              </span>
            </div>
            <input
              id="time-window"
              type="range"
              min={1}
              max={24}
              step={1}
              value={settings.timeWindowHours}
              onChange={(event) =>
                updateSetting("timeWindowHours", Number(event.target.value))
              }
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              The time window used by your detection preferences.
            </p>
          </div>

          <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            These preferences are persisted to your account metadata. Your
            current dashboard API uses its own detection thresholds until those
            settings are wired into the detection logic.
          </p>
        </div>
      </section>
      {/* Notifications */}
      <section className="space-y-4">
        <SectionHeading
          icon={<Bell className="size-4" />}
          title="Notifications"
          description="Choose which notification preferences to keep enabled."
        />

        <div className="divide-y rounded-xl border bg-card px-5 sm:px-6">
          <PreferenceRow
            title="Email notifications"
            description="Allow email notifications for your account."
            checked={settings.emailNotifications}
            onChange={(checked) => updateSetting("emailNotifications", checked)}
          />

          <PreferenceRow
            title="Incident alerts"
            description="Enable your preference for incident notifications."
            checked={settings.incidentNotifications}
            onChange={(checked) =>
              updateSetting("incidentNotifications", checked)
            }
          />

          <PreferenceRow
            title="Multi-source confirmation"
            description="Enable your preference for incidents reported through multiple sources."
            checked={settings.multiSourceNotifications}
            onChange={(checked) =>
              updateSetting("multiSourceNotifications", checked)
            }
          />

          <p className="py-3 text-xs text-muted-foreground">
            These preferences are saved to your account. Actual email delivery
            and alert dispatch still need to be connected to a notification
            service.
          </p>
        </div>
      </section>
      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || loggingOut}>
          {saving ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
      {/* Danger zone */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Sign out</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign out of your Custo account on this device.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-destructive/20 bg-card p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-sm font-medium">Sign out of Custo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You will need to sign in again to access your dashboard.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut || saving}
          >
            {loggingOut ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 size-4" />
            )}
            {loggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <span className="text-muted-foreground">{icon}</span>{" "}
        <h2 className="text-base font-semibold">{title}</h2>{" "}
      </div>{" "}
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>{" "}
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {" "}
      <div className="space-y-1">
        {" "}
        <p className="text-sm font-medium">{title}</p>{" "}
        <p className="text-sm text-muted-foreground">{description}</p>{" "}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
