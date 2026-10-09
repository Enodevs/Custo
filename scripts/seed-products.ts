/**
 * Seed script to create demo products in Supabase.
 * Run with: npx tsx scripts/seed-products.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_PRODUCTS = [
  {
    name: "Wema Bank",
    bot_name: "Ada",
    description: `Wema Bank is a Nigerian commercial bank offering:
- Mobile banking via ALAT app
- Transfers, bill payments, airtime recharge
- Savings and current accounts
- Debit cards (Mastercard and Verve)
- Loans and overdrafts
- Customer support via phone, email, and in-app chat

Common issues:
- Failed transfers (usually resolved within 24 hours)
- App login problems (reset via SMS OTP)
- Card fraud (block card immediately, report to fraud desk)
- ATM cash not dispensed (report with transaction reference)
- Poor customer service response time

Policies:
- Refunds take 3-5 business days after confirmation
- Fraud claims require police report for amounts over ₦50,000
- Card replacement costs ₦1,000
- Account maintenance fee is ₦50/month`,
  },
  {
    name: "Jumia Nigeria",
    bot_name: "JBot",
    description: `Jumia is Nigeria's leading e-commerce platform selling:
- Electronics, phones, fashion, home appliances
- Pay on delivery or card payment options
- 7-14 day delivery depending on location
- 7-day return policy for defective items

Common issues:
- Delayed delivery beyond promised date
- Wrong item delivered
- Damaged goods on arrival
- Failed payment but order not confirmed
- Poor product quality vs. description
- Difficulty reaching customer service

Policies:
- Return shipping paid by Jumia if item is defective
- Refunds take 7-14 days after item pickup
- No returns on opened electronics unless defective
- Complaints must be filed within 48 hours of delivery`,
  },
  {
    name: "MTN Nigeria",
    bot_name: "MTN Assistant",
    description: `MTN is Nigeria's largest mobile network operator providing:
- Voice, SMS, and data services
- Mobile money (MoMo)
- Device financing
- Enterprise solutions

Common issues:
- Network outage or poor signal
- Data depletion faster than expected
- Failed airtime or data purchase
- MoMo transaction failures
- Unauthorized deductions
- SIM card issues (blocked, stolen, or damaged)

Policies:
- Network complaints resolved within 24 hours
- MoMo reversals take 24-72 hours
- SIM replacement costs ₦200
- Data plans are non-refundable once activated`,
  },
];

async function seed() {
  console.log("Seeding demo products...");

  for (const product of DEMO_PRODUCTS) {
    console.log(`Creating: ${product.name}...`);

    // Check if already exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("name", product.name)
      .single();

    if (existing) {
      console.log(`  → ${product.name} already exists, skipping.`);
      continue;
    }

    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error(`  ✗ Failed to create ${product.name}:`, error.message);
    } else {
      console.log(`  ✓ Created ${product.name} (${data.id})`);
    }
  }

  console.log("\nDone!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
