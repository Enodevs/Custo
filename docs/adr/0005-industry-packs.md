# ADR 0005: Industry Packs

**Date**: 2024-01-15  
**Status**: Accepted  
**Context**: User requirement for generalization update

## Context

The product was initially built as a bank-specific complaint intelligence platform. To reach a wider market, we need to support any Nigerian consumer brand across multiple industries while maintaining a specialized, high-quality experience for each vertical.

## Decision

We will implement an **Industry Pack** system that allows the platform to serve different industries with tailored configurations while sharing the same core detection and analytics engine.

### Industry Pack Structure

An Industry Pack is a configuration object that defines:

```typescript
interface IndustryPack {
  id: string;                    // e.g., "banking", "telecom"
  name: string;                  // Display name
  categories: string[];          // Complaint categories for this industry
  severityRules?: SeverityConfig; // Optional industry-specific severity weights
}
```

### Implementation Phases

**Phase 1: NOW (Design Partner)**
- ONE fully working pack: **Banking** (complete with seed data, accuracy metrics)
- Wema Bank remains the home organization in the demo
- Full feature set: detection, analytics, accuracy metrics
- Banking-specific categories: Failed Transfer, App Downtime, ATM Issue, Card Fraud, Poor Service

**Phase 2: NEXT (Business Customers) - Planned**
- Two additional packs visible in onboarding: **Telecom** and **Power Distribution**
- Marked as "Sample pack" with no real data behind them
- Shows the multi-industry vision to prospects
- Categories defined but not used in demos:
  - Telecom: Network Issue, Billing Problem, Data Issue, Coverage Issue
  - Power: Outage, Billing Issue, Poor Service, Meter Problem

**Phase 3: LATER (More Industry Packs)**
- E-commerce, SaaS, Healthcare, Hospitality, etc.
- Each pack gets full treatment with seed data and tuned rules

### Core Principles

1. **Industry-Specific, Not Generic**: Each pack has tailored categories, not a one-size-fits-all approach
2. **Shared Engine**: All packs use the same detection algorithms, severity scoring, and baseline calculation
3. **Configurable, Not Hardcoded**: Categories and rules load from the active pack
4. **Honest Demo**: Demo data and accuracy metrics are clearly marked as banking-only

## Technical Changes

### Data Model
- Rename `Bank` type to `Organization` throughout
- Replace `BusinessConfig.industry` (string) with `BusinessConfig.industryPackId` (references a pack)
- Add `IndustryPack` type to `src/data/types.ts`
- Move pack definitions to `src/data/constants.ts`

### Constants
- Remove `BANKS`, `CATEGORIES` constants (now dynamic from packs)
- Add `INDUSTRY_PACKS` constant with banking, telecom, power packs
- Keep `DEMO_BUSINESSES` with Wema Bank as the primary

### Domain Logic
- Functions already use generic `organization` parameter (no changes needed)
- Severity rules remain universal for now (can be pack-specific later)

### Adapters
- Mock adapter uses banking pack for seed data
- Methods accept `organizationId` instead of `bank`
- Comparison endpoint becomes `getOrganizationComparison()` but remains banking-only in demo

### UI Updates
- Homepage: New hero section addressing "any Nigerian consumer brand"
- Homepage: "Banking first, any brand next" section
- Homepage: "Pathway" section with Now/Next/Later stages
- Banks page → Organizations page (still shows banking demo)
- Remove hardcoded bank references in components

## Consequences

### Positive
- Clear product vision: start with banking, expand methodically
- Honest positioning: demo is banking-specific, not fake multi-industry data
- Sales advantage: show telecom/power packs to demonstrate vision without building fake data
- Technical foundation for true multi-industry support

### Negative
- More complex onboarding flow (industry pack selection)
- Need to maintain pack definitions as we add industries
- Accuracy metrics remain banking-only until we gather real data for other packs

### Neutral
- Demo remains focused on banking (Wema Bank home organization)
- Seed data generator stays banking-only
- Existing domain logic largely unchanged

## Implementation Notes

### Onboarding Flow
1. Welcome screen
2. **Industry pack selection**: Banking (active), Telecom (sample), Power (sample)
3. Organization details (name, description)
4. Category selection (pre-filled from pack, customizable)
5. Data sources and languages

### Homepage Messaging

**Hero:**
> "Complaint intelligence for Nigerian brands. Know what's breaking before it reaches the regulator."

**Banking First Section:**
> "We started with banking because Nigerian banks face unique complaint dynamics: multi-channel feedback (Play Store, X, in-app, Nairaland), multilingual complaints (English, Pidgin, Yoruba, Hausa), and strict CBN reporting requirements."

**Any Brand Next Section:**
> "The same detection engine works for any consumer brand: telecom operators, e-commerce platforms, fintechs, or utilities. Categories and severity rules adapt to your industry."

**Pathway:**
- **Now**: Design partner program (banking)
- **Next**: Offered to business customers (more industries, marked as "planned")
- **Later**: Full industry pack marketplace

## References

- Original requirements document: `/GENERALIZATION.md`
- Type definitions: `src/data/types.ts`
- Industry templates: `src/data/constants.ts`
