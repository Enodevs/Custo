
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/utils/supabase/service";
import { createClient } from "@/utils/supabase/server";
import type {
  Complaint,
  Incident,
  OverviewData,
  OrganizationComparison,
  Product,
  SeverityLevel,
  complaintsTrendtype
} from "@/data/types";
import { unstable_rethrow } from "next/navigation";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user;
}

function mapComplaint(row: any): Complaint {
  const rawSeverity = Number(row.severity ?? 1);

  const severity = Math.min(
    10,
    Math.max(1, Math.round(rawSeverity)),
  ) as SeverityLevel;

  const timestamp = new Date(
    row.timestamp ?? row.created_at ?? Date.now(),
  );

  return {
    id: String(row.id),
    product_id: String(row.product_id),
    category: row.category ?? "Uncategorized",
    language: row.language ?? "unknown",
    source: row.source ?? "unknown",
    text: row.text ?? "",
    translatedText: row.english_translation ?? undefined,
    severity,
    timestamp: Number.isNaN(timestamp.getTime())
      ? new Date()
      : timestamp,
    ready: Boolean(row.ready),
    metadata: {
      url: row.metadata?.url,
      username: row.metadata?.username,
      confidence: Number(
        row.confidence ?? row.metadata?.confidence ?? 0,
      ),
    },
  };
}

function emptyOverview(): OverviewData {
  return {
    stats: {
      activeIncidents: {
        label: "Active incidents",
        value: 0,
        trend: "stable",
      },
      complaintsLast24h: {
        label: "Complaints in 24h",
        value: 0,
        trend: "stable",
      },
      confirmedByBoth: {
        label: "Multi-source incidents",
        value: 0,
        trend: "stable",
      },
      medianTimeToDetect: {
        label: "Median time to detect",
        value: "—",
        trend: "stable",
      },
    },
    activeIncidents: [],
    liveSignals: [],
    categoryHeatmap: [],
    organizationComparison: [],
    complaintsTrend: [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const { data: products, error: productsError } =
      await supabaseService
        .from("products")
        .select(
          "id, name, description, bot_name, created_at, updated_at",
        )
        .eq("user_id", user.id);

    if (productsError) {
      console.error(
        "Dashboard products query failed:",
        productsError.message,
      );

      return NextResponse.json(
        { error: "Couldn't load your products." },
        { status: 500 },
      );
    }

    const ownedProducts = (products ?? []) as Product[];
    const ownedProductIds = ownedProducts.map(
      (product) => product.id,
    );

    const requestedProductId =
      request.nextUrl.searchParams.get("productId");

    if (
      requestedProductId &&
      requestedProductId !== "all" &&
      !ownedProductIds.includes(requestedProductId)
    ) {
      return NextResponse.json(
        { error: "That product doesn't belong to your account." },
        { status: 403 },
      );
    }

    if (ownedProductIds.length === 0) {
      return NextResponse.json(emptyOverview());
    }

    const selectedIds =
      requestedProductId && requestedProductId !== "all"
        ? [requestedProductId]
        : ownedProductIds;

    const now = new Date();
    const last24h = new Date(
      now.getTime() - 24 * 60 * 60 * 1000,
    );
    const last7Days = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const { data: rows, error: complaintsError } =
      await supabaseService
        .from("complaints")
        .select("*")
        .in("product_id", selectedIds)
        .gte("timestamp", last7Days.toISOString())
        .order("timestamp", { ascending: false })
        .limit(5000);

    if (complaintsError) {
      console.error(
        "Dashboard complaints query failed:",
        complaintsError.message,
      );

      return NextResponse.json(
        { error: "Couldn't load complaint data." },
        { status: 500 },
      );
    }

    const complaints = (rows ?? []).map(mapComplaint);

    const recent = complaints.filter(
      (complaint) =>
        complaint.timestamp.getTime() >= last24h.getTime(),
    );

    // Build 24 hourly buckets for the dashboard chart.
    // The labels use Nigeria time.
    const complaintsTrend = Array.from(
      { length: 24 },
      (_, index) => {
        const bucketStart = new Date(
          now.getTime() -
            (23 - index) * 60 * 60 * 1000,
        );

        const bucketEnd = new Date(
          bucketStart.getTime() + 60 * 60 * 1000,
        );

        const count = recent.filter((complaint) => {
          const timestamp = complaint.timestamp.getTime();

          return (
            timestamp >= bucketStart.getTime() &&
            timestamp < bucketEnd.getTime()
          );
        }).length;

        return {
          hour: bucketStart.toLocaleTimeString("en-NG", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Africa/Lagos",
          }),
          complaints: count,
        };
      },
    );

    // Group complaints by product and category to identify unusual spikes.
    // These are heuristic alerts, not proof of an outage.
    const groups = new Map<string, Complaint[]>();

    for (const complaint of complaints) {
      const key = JSON.stringify([
        complaint.product_id,
        complaint.category,
      ]);

      const group = groups.get(key) ?? [];
      group.push(complaint);
      groups.set(key, group);
    }

    const incidents: Incident[] = [];

    for (const group of groups.values()) {
      const current = group.filter(
        (complaint) =>
          complaint.timestamp.getTime() >= last24h.getTime(),
      );

      if (current.length < 3) continue;

      const historicalCount = group.filter(
        (complaint) =>
          complaint.timestamp.getTime() < last24h.getTime(),
      ).length;

      const baseline = Math.max(
        historicalCount / 6,
        0.5,
      );

      const ratio = current.length / baseline;

      if (ratio < 2) continue;

      const productId = current[0].product_id;
      const category = current[0].category;

      const inAppCount = current.filter((complaint) =>
        /in.?app|widget|web.?form/i.test(
          complaint.source,
        ),
      ).length;

      const publicCount = current.length - inAppCount;

      const peakTime = current.reduce(
        (latest, complaint) =>
          complaint.timestamp.getTime() >
          latest.getTime()
            ? complaint.timestamp
            : latest,
        current[0].timestamp,
      );

      const averageSeverity =
        current.reduce(
          (sum, complaint) =>
            sum + complaint.severity,
          0,
        ) / current.length;

      incidents.push({
        id: `${productId}:${category}`,
        product_id: productId,
        category,
        count: current.length,
        severity: averageSeverity,
        baseline,
        ratio,
        startTime: current.reduce(
          (earliest, complaint) =>
            complaint.timestamp.getTime() <
            earliest.getTime()
              ? complaint.timestamp
              : earliest,
          current[0].timestamp,
        ),
        endTime: now,
        isConfirmedByBoth:
          inAppCount > 0 && publicCount > 0,
        publicCount,
        inAppCount,
        complaints: current,
        peakTime,
        status: "flagged",
      });
    }

    incidents.sort(
      (a, b) =>
        b.ratio * b.severity -
        a.ratio * a.severity,
    );

    const multiSourceCount = incidents.filter(
      (incident) => incident.isConfirmedByBoth,
    ).length;

    const comparison: OrganizationComparison[] =
      ownedProducts
        .filter((product) =>
          selectedIds.includes(product.id),
        )
        .map((product) => {
          const productRecent = recent.filter(
            (complaint) =>
              complaint.product_id === product.id,
          );

          const productIncidents = incidents.filter(
            (incident) =>
              incident.product_id === product.id,
          );

          const avgSeverity = productRecent.length
            ? productRecent.reduce(
                (sum, complaint) =>
                  sum + complaint.severity,
                0,
              ) / productRecent.length
            : 0;

          return {
            organizationId: product.id,
            name: product.name,
            color: "#64748b",
            activeIncidents: productIncidents.length,
            complaintsLast24h: productRecent.length,
            avgSeverity,
            trend: "stable",
          };
        });

    const signals = recent
      .slice(0, 10)
      .map((complaint) => ({
        id: complaint.id,
        complaint,
        timestamp: complaint.timestamp,
      }));

    const result: OverviewData = {
      stats: {
        activeIncidents: {
          label: "Active incidents",
          value: incidents.length,
          trend: "stable",
        },
        complaintsLast24h: {
          label: "Complaints in 24h",
          value: recent.length,
          trend: "stable",
        },
        confirmedByBoth: {
          label: "Multi-source incidents",
          value: multiSourceCount,
          trend: "stable",
        },
        medianTimeToDetect: {
          label: "Median time to detect",
          value: "—",
          trend: "stable",
        },
      },
      activeIncidents: incidents.slice(0, 10),
      liveSignals: signals,
      categoryHeatmap: [],
      organizationComparison: comparison,
      complaintsTrend,
    };

    return NextResponse.json(result);
  } catch (error) {
    unstable_rethrow(error);

    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred loading the dashboard.",
      },
      { status: 500 },
    );
  }
}
