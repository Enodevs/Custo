// agent.ts: one call replies to the customer AND classifies the complaint.
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 20_000, maxRetries: 2 });

// primary model first, fallback second
const MODELS = [
  process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
  process.env.GROQ_FALLBACK_MODEL ?? "openai/gpt-oss-120b",
];

const CATEGORIES = [
  "payment_issue",
  "service_outage",
  "product_defect",
  "delivery_delay",
  "account_access",
  "fraud_security",
  "poor_support",
  "other",
];

type Turn = { role: "user" | "assistant"; content: string };

// hide personal data before it goes to the model or the database
const mask = (t: string) =>
  t
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/(?:\+?234|0)[789][01]\d{8}\b/g, "[phone]")
    .replace(/\b\d{13,19}\b/g, "[card]")
    .replace(/\b\d{11}\b/g, "[id]")
    .replace(/\b\d{10}\b/g, "[account]");

const prompt = (context: string, categories: string[]) => `You are a complaint intake assistant.
${context ? `Business: ${context}` : ""}
Reply in the customer's language (English, Pidgin, Yoruba or Hausa).
Ask ONE short question at a time (amount, when it happened, channel), max 2 follow-ups.
Never ask for PIN, OTP, password or full card number. Never promise a refund.
Set "ready" to true once you have enough detail; then your reply confirms the case is filed.
Classify the complaint using the WHOLE conversation.

Return ONLY JSON:
{
  "reply": string,
  "ready": boolean,
  "language": "en" | "pcm" | "yo" | "ha" | "mixed",
  "english_translation": string,
  "entity": string | null,
  "category": one of ${JSON.stringify(categories)},
  "severity": 1-5,
  "sentiment": "negative" | "neutral" | "positive",
  "amount_ngn": number | null,
  "channel_hint": string | null,
  "is_genuine_complaint": boolean
}
Severity 5 = money lost or locked with no resolution, or fraud. Do not invent details.`;

export async function agent(
  message: string,
  opts: { context?: string; convo_history?: Turn[]; categories?: string[] } = {},
) {
  const { context = "", convo_history = [], categories = CATEGORIES } = opts;

  const messages = [
    { role: "system" as const, content: prompt(context, categories) },
    ...convo_history.map((t) => ({ role: t.role, content: mask(t.content) })),
    { role: "user" as const, content: mask(message) },
  ];

  let lastError: unknown;

  // each model gets 2 tries, then we move to the fallback
  for (const model of MODELS) {
    for (let i = 0; i < 2; i++) {
      try {
        const res = await groq.chat.completions.create({
          model,
          temperature: 0.2,
          max_completion_tokens: 1500, // reasoning models need room to think
          response_format: { type: "json_object" },
          messages,
        });

        const out = JSON.parse(res.choices[0]?.message?.content ?? "");
        if (!out.reply) throw new Error("No reply in model output");

        out.severity = Math.min(5, Math.max(1, Math.round(Number(out.severity) || 1)));
        if (!categories.includes(out.category)) out.category = "other";

        return { ...out, masked_text: mask(message), model };
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError;
}