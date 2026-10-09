
/**
 * POST /api/support/intake
 * Public AI-powered complaint intake with protected follow-ups
 * and optional customer contact collection.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/utils/supabase/service";
import { agent } from "@/lib/agent";
import { maskPII } from "@/lib/mask";

interface IntakeRequest {
  action?: string;
  product_id?: string;
  message?: string;
  complaint_id?: string;
  conversation_token?: string;
  customer_details?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface ComplaintMetadata {
  conversation_token?: string;
  conversation_history?: ConversationMessage[];
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    let body: IntakeRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const {
      action,
      product_id,
      message,
      complaint_id,
      conversation_token,
      customer_details,
    } = body;

    if (action && action !== "save_contact") {
      return NextResponse.json(
        { error: "Unsupported action." },
        { status: 400 },
      );
    }

    // Save optional contact details without calling the AI.
    if (action === "save_contact") {
      if (
        typeof product_id !== "string" ||
        !product_id.trim() ||
        typeof complaint_id !== "string" ||
        !complaint_id.trim() ||
        typeof conversation_token !== "string" ||
        !conversation_token ||
        !customer_details ||
        typeof customer_details !== "object" ||
        Array.isArray(customer_details)
      ) {
        return NextResponse.json(
          { error: "Invalid contact submission." },
          { status: 400 },
        );
      }

      const { name, email, phone } = customer_details;

      if (
        (name !== undefined && typeof name !== "string") ||
        (email !== undefined && typeof email !== "string") ||
        (phone !== undefined && typeof phone !== "string")
      ) {
        return NextResponse.json(
          { error: "Contact fields must be text." },
          { status: 400 },
        );
      }

      const cleanName = (name ?? "").trim();
      const cleanEmail = (email ?? "").trim();
      const cleanPhone = (phone ?? "").trim();

      if (
        cleanName.length > 120 ||
        cleanEmail.length > 254 ||
        cleanPhone.length > 40
      ) {
        return NextResponse.json(
          { error: "One or more contact fields are too long." },
          { status: 400 },
        );
      }

      if (!cleanName && !cleanEmail && !cleanPhone) {
        return NextResponse.json(
          { error: "Provide at least one contact detail." },
          { status: 400 },
        );
      }

      if (
        cleanEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
      ) {
        return NextResponse.json(
          { error: "Enter a valid email address." },
          { status: 400 },
        );
      }

      if (
        cleanPhone &&
        !/^\+?[\d\s().-]{7,39}\d$/.test(cleanPhone)
      ) {
        return NextResponse.json(
          { error: "Enter a valid phone number." },
          { status: 400 },
        );
      }

      const { data: complaint, error: lookupError } =
        await supabaseService
          .from("complaints")
          .select("id, metadata")
          .eq("id", complaint_id)
          .eq("product_id", product_id)
          .maybeSingle();

      if (lookupError) {
        console.error(
          "Contact complaint lookup failed:",
          lookupError.message,
        );

        return NextResponse.json(
          { error: "Unable to verify the complaint." },
          { status: 500 },
        );
      }

      if (!complaint) {
        return NextResponse.json(
          { error: "Complaint not found." },
          { status: 404 },
        );
      }

      const metadata =
        complaint.metadata &&
        typeof complaint.metadata === "object" &&
        !Array.isArray(complaint.metadata)
          ? (complaint.metadata as ComplaintMetadata)
          : {};

      if (
        typeof metadata.conversation_token !== "string" ||
        metadata.conversation_token !== conversation_token
      ) {
        return NextResponse.json(
          { error: "Invalid conversation token." },
          { status: 403 },
        );
      }

      // Update only the fields the customer supplied.
      const contactUpdate: Record<string, string> = {
        updated_at: new Date().toISOString(),
      };

      if (cleanName) contactUpdate.customer_name = cleanName;
      if (cleanEmail) contactUpdate.customer_email = cleanEmail;
      if (cleanPhone) contactUpdate.customer_phone = cleanPhone;

      const { error: updateError } = await supabaseService
        .from("complaints")
        .update(contactUpdate)
        .eq("id", complaint_id)
        .eq("product_id", product_id);

      if (updateError) {
        console.error("Contact save failed:", updateError.message);

        return NextResponse.json(
          { error: "Failed to save contact details." },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }

    // Existing complaint conversation flow.
    if (
      typeof product_id !== "string" ||
      !product_id.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "product_id and message are required." },
        { status: 400 },
      );
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length > 5000) {
      return NextResponse.json(
        { error: "Message must be 5,000 characters or fewer." },
        { status: 400 },
      );
    }

    const { data: product, error: productError } =
      await supabaseService
        .from("products")
        .select("id, name, bot_name, description")
        .eq("id", product_id)
        .maybeSingle();

    if (productError) {
      console.error("Product lookup failed:", productError.message);

      return NextResponse.json(
        { error: "Unable to load this product." },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    let existingComplaint: {
      id: string;
      metadata: ComplaintMetadata | null;
    } | null = null;

    let conversationHistory: ConversationMessage[] = [];
    let finalComplaintId: string;
    let token: string;

    if (complaint_id) {
      if (
        typeof complaint_id !== "string" ||
        typeof conversation_token !== "string" ||
        !conversation_token
      ) {
        return NextResponse.json(
          { error: "A valid conversation token is required for follow-ups." },
          { status: 401 },
        );
      }

      const { data: complaint, error: complaintError } =
        await supabaseService
          .from("complaints")
          .select("id, product_id, metadata")
          .eq("id", complaint_id)
          .eq("product_id", product_id)
          .maybeSingle();

      if (complaintError) {
        console.error(
          "Complaint lookup failed:",
          complaintError.message,
        );

        return NextResponse.json(
          { error: "Unable to load this conversation." },
          { status: 500 },
        );
      }

      if (!complaint) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 },
        );
      }

      const metadata =
        complaint.metadata &&
        typeof complaint.metadata === "object" &&
        !Array.isArray(complaint.metadata)
          ? (complaint.metadata as ComplaintMetadata)
          : {};

      if (
        typeof metadata.conversation_token !== "string" ||
        metadata.conversation_token !== conversation_token
      ) {
        return NextResponse.json(
          { error: "Invalid conversation token." },
          { status: 403 },
        );
      }

      existingComplaint = {
        id: complaint.id,
        metadata,
      };

      conversationHistory = Array.isArray(metadata.conversation_history)
        ? metadata.conversation_history.filter(
            (item): item is ConversationMessage =>
              item !== null &&
              typeof item === "object" &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string",
          )
        : [];

      finalComplaintId = complaint.id;
      token = metadata.conversation_token;
    } else {
      finalComplaintId = crypto.randomUUID();
      token = crypto.randomUUID();
    }

    let aiResult: Awaited<ReturnType<typeof agent>>;

    try {
      aiResult = await agent(cleanMessage, {
        productName: product.name,
        botName: product.bot_name || "Support Assistant",
        description: product.description,
        convo_history: conversationHistory,
      });
    } catch (error) {
      console.error("AI agent failed:", error);

      return NextResponse.json(
        { error: "AI service temporarily unavailable." },
        { status: 503 },
      );
    }

    const nextHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: "user", content: cleanMessage },
      { role: "assistant", content: aiResult.reply },
    ];

    const metadata: ComplaintMetadata = {
      ...(existingComplaint?.metadata ?? {}),
      conversation_token: token,
      conversation_history: nextHistory,
      last_message_masked: maskPII(cleanMessage),
    };

    if (!existingComplaint) {
      const { error } = await supabaseService
        .from("complaints")
        .insert({
          id: finalComplaintId,
          product_id: product.id,
          category: aiResult.category,
          language: aiResult.language,
          source: "in_app",
          text: cleanMessage,
          english_translation:
            aiResult.english_translation || cleanMessage,
          entity: aiResult.entity,
          severity: aiResult.severity,
          sentiment: aiResult.sentiment,
          amount_ngn: aiResult.amount_ngn,
          channel_hint: aiResult.channel_hint,
          is_genuine_complaint: aiResult.is_genuine_complaint,
          ready: aiResult.ready,
          ai_reply: aiResult.reply,
          ai_status: "completed",
          status: "open",
          confidence: 0.85,
          metadata,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error("Complaint insert failed:", error.message);

        return NextResponse.json(
          { error: "Failed to save complaint." },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabaseService
        .from("complaints")
        .update({
          category: aiResult.category,
          language: aiResult.language,
          english_translation:
            aiResult.english_translation || cleanMessage,
          entity: aiResult.entity,
          severity: aiResult.severity,
          sentiment: aiResult.sentiment,
          amount_ngn: aiResult.amount_ngn,
          channel_hint: aiResult.channel_hint,
          is_genuine_complaint: aiResult.is_genuine_complaint,
          ready: aiResult.ready,
          ai_reply: aiResult.reply,
          ai_status: "completed",
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", finalComplaintId)
        .eq("product_id", product.id);

      if (error) {
        console.error("Complaint update failed:", error.message);

        return NextResponse.json(
          { error: "Failed to update complaint." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      complaint_id: finalComplaintId,
      conversation_token: token,
      reply: aiResult.reply,
      ready: aiResult.ready,
      classification: {
        language: aiResult.language,
        category: aiResult.category,
        severity: aiResult.severity,
        sentiment: aiResult.sentiment,
        entity: aiResult.entity,
        amount_ngn: aiResult.amount_ngn,
        channel_hint: aiResult.channel_hint,
        is_genuine_complaint: aiResult.is_genuine_complaint,
      },
    });
  } catch (error) {
    console.error("Intake API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
