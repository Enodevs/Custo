// agent.ts: one call replies to the customer AND classifies the complaint.
import Groq from "groq-sdk";
import { maskPII } from "./mask";

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

const buildPrompt = (
  productName: string,
  botName: string,
  description: string,
  categories: string[]
) => `You are ${botName}, the complaint assistant for ${productName}.

BUSINESS: ${productName}
CONTEXT: ${description}

CONVERSATION RULES
- Adapt to any industry. Be empathetic, concise, and professional.
- Keep using the language the customer starts with (English, Nigerian Pidgin, Yoruba, Hausa, or mixed) unless they request a switch.
- Ask one relevant question at a time, with at most 2 follow-up questions about the issue.
- Never invent facts or promise resolutions. Never request passwords, PINs, OTPs, or secret credentials.
- Set ready=true when the complaint is sufficiently clear to record.

CUSTOMER CONTACT
- First understand the complaint. Do not ask for contact details automatically.
- If direct follow-up would genuinely help, offer to collect the customer's name and a preferred contact method (email or phone).
- Ask only for missing details needed for follow-up. Never ask for all fields by default.
- Briefly explain why the information would help, e.g. to provide an update on the case.
- Contact details are optional. Accept refusal and continue recording the complaint without them. Never ask repeatedly.
- If the customer already supplied contact details, do not ask for them again.
- Never guess or fabricate contact information.
- When requesting contact details, make the request clear and easy to answer in one message.
- Your reply can request contact information, but the application handles the actual form and saving. Never claim details were saved unless confirmed.

Offer to collect contact details when a complaint needs investigation, escalation, a callback, or a later status update (e.g., unresolved payments or refunds, missing deliveries, account recovery, warranty claims, billing disputes, recurring issues, specialist support).

- Briefly say why follow-up helps, then ask for their name and an email or phone number. Don't require every field.
- If they request a callback or updates, ask for their preferred contact method.
- An order ID or account reference doesn't replace contact details when follow-up is needed.
- Don't ask if the issue can be fully resolved in the chat, or if they've already given enough contact details.
- Contact details are optional. Never pressure, never re-ask after a refusal, and never request passwords, PINs, OTPs, or card numbers.
- The application handles saving. Never say details were saved unless the application confirms it.

CLASSIFICATION
- category: exactly one of ${JSON.stringify(categories)}.
- severity: 1–5 based on actual impact, not anger alone.
- sentiment: negative, neutral, or positive.
- is_genuine_complaint: true for plausible complaints; false for spam or unrelated messages.

FIELDS
- language: en, pcm, yo, ha, or mixed.
- english_translation: accurate English translation of the complaint.
- entity: identifiable organization, person, product, or service; otherwise null.
- amount_ngn: explicitly stated NGN amount; otherwise null. Never convert currencies.
- channel_hint: identifiable channel; otherwise null.
- Never fabricate missing information.
- Do not add contact fields or any extra keys to the classification JSON.

OUTPUT
Return ONLY valid JSON with exactly these fields:
{
  "reply": string,
  "ready": boolean,
  "language": "en" | "pcm" | "yo" | "ha" | "mixed",
  "english_translation": string,
  "entity": string | null,
  "category": one of ${JSON.stringify(categories)},
  "severity": 1 | 2 | 3 | 4 | 5,
  "sentiment": "negative" | "neutral" | "positive",
  "amount_ngn": number | null,
  "channel_hint": string | null,
  "is_genuine_complaint": boolean
}
No Markdown or extra keys. Escape JSON strings correctly.`;

export interface AgentOptions {
  productName: string;
  botName?: string;
  description: string;
  convo_history?: Turn[];
  categories?: string[];
}

export async function agent(message: string, opts: AgentOptions) {
  const {
    productName,
    botName = "Support Assistant",
    description,
    convo_history = [],
    categories = CATEGORIES,
  } = opts;

  const messages = [
    { role: "system" as const, content: buildPrompt(productName, botName, description, categories) },
    ...convo_history.map((t) => ({ role: t.role, content: maskPII(t.content) })),
    { role: "user" as const, content: maskPII(message) },
  ];

  let lastError: unknown;

  // each model gets 2 tries, then we move to the fallback
  for (const model of MODELS) {
    for (let i = 0; i < 2; i++) {
      try {
        const res = await groq.chat.completions.create({
          model,
          temperature: 0.2,
          max_completion_tokens: 1500,
          response_format: { type: "json_object" },
          messages,
        });

        const out = JSON.parse(res.choices[0]?.message?.content ?? "");
        if (!out.reply) throw new Error("No reply in model output");

        out.severity = Math.min(5, Math.max(1, Math.round(Number(out.severity) || 1)));
        if (!categories.includes(out.category)) out.category = "other";

        return { ...out, masked_text: maskPII(message), model };
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError;
}
