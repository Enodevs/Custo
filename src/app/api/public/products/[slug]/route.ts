
import { NextResponse } from "next/server";
import { supabaseService } from "@/utils/supabase/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const { data: product, error } = await supabaseService
      .from("products")
      .select("id, slug, name, bot_name, description")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Public product lookup failed:", error.message);

      return NextResponse.json(
        { error: "Unable to load this support page." },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Support page not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Public product API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
