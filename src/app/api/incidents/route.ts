import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseService } from "@/utils/supabase/service";
import type { Complaint, Product, SeverityLevel } from "@/data/types";
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
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    category: row.category ?? "Uncategorized",
    language: row.language ?? "unknown",
    source: row.source ?? "unknown",
    text: row.text ?? "",
    translatedText: row.english_translation ?? undefined,
    severity: Math.min(
      10,
      Math.max(1, Math.round(Number(row.severity ?? 1))),
    ) as SeverityLevel,
    timestamp: new Date(row.timestamp ?? row.created_at),
    ready: Boolean(row.ready),
    metadata: {
      url: row.metadata?.url,
      username: row.metadata?.username,
      confidence: Number(row.confidence ?? row.metadata?.confidence ?? 0),
    },
  };
}

function normalizeStatus(value: unknown) {
  const status = String(value ?? "").toLowerCase();

  if (/resolved|closed|fixed|completed/.test(status)) return "resolved" as const;
  if (/flagged|active|open|investigating|critical/.test(status)) return "flagged" as const;

  return "watching" as const;
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

    const requestedProductId = request.nextUrl.searchParams.get("productId");
    const requestedIncidentId = request.nextUrl.searchParams.get("id");

    const { data: products, error: productsError } = await supabaseService
      .from("products")
      .select("id, name, description, bot_name, created_at, updated_at")
      .eq("user_id", user.id);

    if (productsError) {
      console.error("Incident products query failed:", productsError.message);
      return NextResponse.json(
        { error: "Couldn't load your products." },
        { status: 500 },
      );
    }

    const ownedProducts = (products ?? []) as Product[];
    const productIds = ownedProducts.map((product) => product.id);
    const productNames = new Map(
      ownedProducts.map((product) => [product.id, product.name]),
    );

    if (productIds.length === 0) {
      return NextResponse.json({ incidents: [] });
    }

    if (
      requestedProductId &&
      requestedProductId !== "all" &&
      !productIds.includes(requestedProductId)
    ) {
      return NextResponse.json(
        { error: "That product doesn't belong to your account." },
        { status: 403 },
      );
    }

    const selectedProductIds =
      requestedProductId && requestedProductId !== "all"
        ? [requestedProductId]
        : productIds;

    let query = supabaseService
      .from("incidents")
      .select(
        "id, product_id, title, category, severity, status, complaint_count, summary, created_at, updated_at",
      )
      .in("product_id", selectedProductIds)
      .order("created_at", { ascending: false });

    if (requestedIncidentId) {
      query = query.eq("id", requestedIncidentId);
    } else {
      query = query.limit(100);
    }

    const { data: rows, error: incidentsError } = await query;

    if (incidentsError) {
      console.error("Incidents query failed:", incidentsError.message);
      return NextResponse.json(
        { error: "Couldn't load incidents." },
        { status: 500 },
      );
    }

    const incidents = await Promise.all(
      (rows ?? []).map(async (row) => {
        const createdAt = new Date(row.created_at ?? Date.now());
        const updatedAt = new Date(row.updated_at ?? row.created_at ?? Date.now());

        const { data: complaintRows, error: complaintError } = await supabaseService
          .from("complaints")
          .select("*")
          .eq("product_id", row.product_id)
          .eq("category", row.category ?? row.title ?? "")
          .order("timestamp", { ascending: false })
          .limit(10);

        if (complaintError) {
          console.error(
            `Incident complaint lookup failed for ${row.id}:`,
            complaintError.message,
          );
        }

        const complaints = (complaintRows ?? []).map(mapComplaint);
        const sourceIsInApp = (source: string) =>
          /in.?app|widget|web.?form/i.test(source);

        const inAppCount = complaints.filter((complaint) =>
          sourceIsInApp(complaint.source),
        ).length;

        const publicCount = complaints.filter(
          (complaint) => !sourceIsInApp(complaint.source),
        ).length;

        const severity = Math.min(
          10,
          Math.max(1, Math.round(Number(row.severity ?? 1))),
        );

        return {
          id: String(row.id),
          product_id: String(row.product_id),
          productName: productNames.get(String(row.product_id)) ?? "Unknown product",
          title: row.title ?? row.category ?? "Incident",
          summary: row.summary ?? "",
          category: row.category ?? "Uncategorized",
          count: Math.max(0, Number(row.complaint_count ?? 0)),
          severity,
          baseline: 0,
          ratio: 0,
          startTime: createdAt,
          endTime: updatedAt,
          peakTime: createdAt,
          isConfirmedByBoth: false,
          publicCount,
          inAppCount,
          complaints,
          status: normalizeStatus(row.status),
        };
      }),
    );

    return NextResponse.json({ incidents });
  } catch (error) {
    unstable_rethrow(error);

    console.error("Incidents API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred loading incidents." },
      { status: 500 },
    );
  }
}
