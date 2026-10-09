import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/utils/supabase/service";
import { createClient } from "@/utils/supabase/server";

function createSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "product";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const { data: products, error } = await supabaseService
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products GET error:", error.message);

      return NextResponse.json(
        { error: "Failed to fetch products." },
        { status: 500 },
      );
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "A valid request body is required." },
        { status: 400 },
      );
    }

    const { name, bot_name, description } = body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "name and description are required" },
        { status: 400 },
      );
    }

    if (
      name.trim().length > 120 ||
      (typeof bot_name === "string" && bot_name.trim().length > 120) ||
      description.trim().length > 10000
    ) {
      return NextResponse.json(
        { error: "Product name or description exceeds the allowed length." },
        { status: 400 },
      );
    }

    const { data: product, error } = await supabaseService
      .from("products")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        name: name.trim(),
        bot_name:
          typeof bot_name === "string" && bot_name.trim()
            ? bot_name.trim()
            : name.trim(),
        description: description.trim(),
        slug: createSlug(name.trim())
      })
      .select()
      .single();

    if (error) {
      console.error("Products POST error:", error.message);

      return NextResponse.json(
        { error: "Failed to create product." },
        { status: 500 },
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
