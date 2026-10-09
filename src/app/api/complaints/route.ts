
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseService } from "@/utils/supabase/service";
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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const params = request.nextUrl.searchParams;
    const requestedProductId = params.get("productId");
    const search = (params.get("search") ?? "")
      .trim()
      .replace(/[,%()_*\\]/g, " ");
    const parsedLimit = Number(params.get("limit") ?? 100);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(200, Math.max(1, Math.floor(parsedLimit)))
      : 100;

    const { data: products, error: productsError } =
      await supabaseService
        .from("products")
        .select("id, name")
        .eq("user_id", user.id);

    if (productsError) {
      console.error("Complaints products query failed:", productsError.message);
      return NextResponse.json(
        { error: "Couldn't load your products." },
        { status: 500 },
      );
    }

    const ownedProducts = products ?? [];
    const ownedProductIds = ownedProducts.map((product) => product.id);
    const productNames = new Map(
      ownedProducts.map((product) => [product.id, product.name]),
    );

    if (ownedProductIds.length === 0) {
      return NextResponse.json({ complaints: [], total: 0 });
    }

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

    const selectedProductIds =
      requestedProductId && requestedProductId !== "all"
        ? [requestedProductId]
        : ownedProductIds;

    let query = supabaseService
      .from("complaints")
      .select("*", { count: "exact" })
      .in("product_id", selectedProductIds)
      .order("timestamp", { ascending: false });

    if (search) {
      query = query.or(
        [
          `text.ilike.%${search}%`,
          `category.ilike.%${search}%`,
          `source.ilike.%${search}%`,
          `language.ilike.%${search}%`,
        ].join(","),
      );
    }

    const { data, error, count } = await query.limit(limit);

    if (error) {
      console.error("Complaints query failed:", error.message);
      return NextResponse.json(
        { error: "Couldn't load complaints." },
        { status: 500 },
      );
    }

    const complaints = (data ?? []).map((row) => {
      const severity = Math.min(
        10,
        Math.max(1, Math.round(Number(row.severity ?? 1))),
      );

      return {
        id: String(row.id),
        product_id: String(row.product_id),
        productName:
          productNames.get(String(row.product_id)) ?? "Unknown product",
        category: row.category ?? "Uncategorized",
        language: row.language ?? "unknown",
        source: row.source ?? "unknown",
        text: row.text ?? "",
        translatedText: row.english_translation ?? undefined,
        severity,
        timestamp: row.timestamp ?? row.created_at,
        ready: Boolean(row.ready),
        metadata: {
          url: row.metadata?.url,
          username: row.metadata?.username,
          confidence: Number(
            row.confidence ?? row.metadata?.confidence ?? 0,
          ),
        },
      };
    });

    return NextResponse.json({
      complaints,
      total: count ?? complaints.length,
    });
  } catch (error) {
    unstable_rethrow(error);

    console.error("Complaints API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred loading complaints." },
      { status: 500 },
    );
  }
}
