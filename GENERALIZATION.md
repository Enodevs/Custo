# Generalization Guide: From Banks to Multi-Business Platform

This document outlines how to transform Complaint Radar from a bank-specific tool to a universal complaint intelligence platform for any business.

## Overview

The current implementation is hardcoded for Nigerian banks. The goal is to make it a SaaS platform where:
1. Users can add multiple businesses
2. Each business has custom context (industry, categories, etc.)
3. The system provides insights across all businesses

## Current State

**Hardcoded Elements:**
- 8 Nigerian banks (Wema, GTBank, Access, Zenith, UBA, First Bank, Kuda, OPay)
- Bank-specific categories (failed_transfer, app_downtime, atm_issue, card_fraud, poor_service)
- Nigerian languages (English, Pidgin, Yoruba, Hausa)

## Target State

**Flexible Platform:**
- User creates workspace
- User adds businesses (unlimited)
- Each business has:
  - Name, logo, industry
  - Custom complaint categories
  - Supported languages
  - Data sources
  - Context/description

## Implementation Steps

### 1. Update Data Types (`src/data/types.ts`)

**Before:**
```typescript
export type Bank = "wema" | "gtbank" | ... ;
export type Category = "failed_transfer" | "app_downtime" | ... ;

export interface Complaint {
  bank: Bank;
  category: Category;
  // ...
}
```

**After:**
```typescript
export type Business = string; // Dynamic IDs
export type Category = string; // Dynamic per business

export interface BusinessConfig {
  id: string;
  name: string;
  industry: string; // "banking", "e-commerce", "saas", "healthcare", etc.
  logo?: string;
  color: string;
  categories: string[]; // Custom categories
  description?: string;
}

export interface Complaint {
  business: string; // Business ID
  category: string;
  // ...
}

export interface Settings {
  workspace: {
    businesses: BusinessConfig[];
    homeBusiness?: string; // Primary business to focus on
    // ...
  };
}
```

### 2. Update Constants (`src/data/constants.ts`)

**Before:**
```typescript
export const BANKS: Record<Bank, { name: string; color: string }> = {
  wema: { name: "Wema Bank", color: "#7C3AED" },
  // ...
};

export const CATEGORIES: Record<Category, string> = {
  failed_transfer: "Failed Transfer",
  // ...
};
```

**After:**
```typescript
// Default industries with suggested categories
export const INDUSTRIES = {
  banking: {
    name: "Banking & Finance",
    defaultCategories: [
      "Failed Transfer",
      "App Downtime",
      "ATM Issue",
      "Card Fraud",
      "Poor Service",
    ],
  },
  ecommerce: {
    name: "E-Commerce",
    defaultCategories: [
      "Delivery Delay",
      "Wrong Item",
      "Damaged Product",
      "Payment Issue",
      "Poor Quality",
    ],
  },
  saas: {
    name: "SaaS / Software",
    defaultCategories: [
      "Bug Report",
      "Feature Request",
      "Performance Issue",
      "Login Problem",
      "Billing Issue",
    ],
  },
  // ... more industries
};

// Languages stay the same (or make configurable)
export const LANGUAGES: Record<string, string> = {
  en: "English",
  pcm: "Nigerian Pidgin",
  yo: "Yoruba",
  ha: "Hausa",
  // ... add more as needed
};
```

### 3. Add Business Management

Create new pages/components:

**`src/app/(app)/businesses/page.tsx`** - List all businesses
```typescript
- Display all added businesses
- Allow adding new business
- Edit/delete businesses
- Set primary business
```

**`src/app/(app)/businesses/new/page.tsx`** - Add business wizard
```typescript
Step 1: Basic Info (name, industry)
Step 2: Categories (select from defaults or create custom)
Step 3: Data Sources (which channels to monitor)
Step 4: Languages (which languages to support)
```

**`src/app/(app)/businesses/[id]/settings/page.tsx`** - Business-specific settings

### 4. Update Sidebar Navigation

**Before:**
- Overview
- Incidents  
- Complaints
- Banks (comparison)
- ...

**After:**
- Overview (all businesses or selected business)
- Incidents
- Complaints
- **Businesses** (manage businesses)
- Analytics (replaces "Banks" - compare across your businesses)
- ...

### 5. Add Business Context Selector

**Top of every page:**
```
[All Businesses ▼] or [Select Business ▼]
- All Businesses (combined view)
- Business A
- Business B
- Business C
```

Users can filter the entire dashboard by business.

### 6. Update Seed Data Generator

**`src/data/adapters/mock/seed-generator.ts`**

Make it generate data based on workspace configuration:
```typescript
export function generateComplaints(config: {
  businesses: BusinessConfig[];
  days: number;
}): Complaint[] {
  // Generate complaints for each business
  // Use business.categories instead of hardcoded categories
  // Vary by business.industry
}
```

### 7. Create Onboarding Flow

**`src/app/onboarding/page.tsx`**

Multi-step wizard for first-time users:
```
Step 1: Welcome & Workspace Name
Step 2: Add Your First Business
  - Business name
  - Industry (dropdown)
  - Logo upload (optional)
Step 3: Configure Categories
  - Show default categories for selected industry
  - Allow custom additions
Step 4: Data Sources
  - Which channels to monitor
Step 5: Complete
  - Redirect to dashboard with seeded demo data
```

### 8. Update DataClient

**`src/data/adapters/mock/index.ts`**

Methods should accept business filter:
```typescript
async getIncidents(params?: {
  business?: string; // Filter by business ID
  category?: string;
  // ...
}): Promise<{incidents: Incident[]; total: number}>;
```

Update all methods to filter by business when provided.

### 9. Update UI Components

**Incident Card, Complaints Table, etc.**

Replace:
```typescript
{BANKS[incident.bank]?.name}
```

With:
```typescript
{businesses.find(b => b.id === incident.business)?.name}
```

Or pass businesses as prop/context.

### 10. Add Multi-Tenancy Context

**`src/lib/contexts/workspace-context.tsx`**

```typescript
export const WorkspaceContext = createContext<{
  businesses: BusinessConfig[];
  selectedBusiness?: string;
  setSelectedBusiness: (id?: string) => void;
  categories: Record<string, string[]>; // business ID -> categories
}>(...);

export function WorkspaceProvider({ children }) {
  // Load from settings
  // Provide to all components
}
```

## Migration Path for Existing Data

1. **Keep current bank data as default**:
   - Convert banks to businesses with industry="banking"
   - Keep categories as-is for banking industry

2. **Add "Industry Templates"**:
   - Pre-built templates for common industries
   - Users select template then customize

3. **Progressive Enhancement**:
   - Phase 1: Still show banks as default demo
   - Phase 2: Add business management UI
   - Phase 3: Remove bank hardcoding completely

## UI Changes

### Navigation
```
Sidebar:
- Overview
- Incidents
- Complaints
- Businesses (NEW - manage businesses)
- Analytics (replaces Banks - compare your businesses)
- Languages
- Live Demo
- Accuracy
- Settings

Top Bar:
[Business Selector: All Businesses ▼]  [Search]  [Command Palette]  [Theme]
```

### Overview Page

**Before:** Shows Wema vs other banks

**After:** 
- If multiple businesses: Show comparison across user's businesses
- If single business: Show just that business
- Option to toggle between "My Businesses" and "All Data"

### Analytics Page (replaces Banks)

Compare metrics across user's businesses (not competitors)

## Database Schema (Future)

When moving from mock to real backend:

```sql
-- Workspaces (multi-tenant)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT,
  owner_id UUID,
  created_at TIMESTAMP
);

-- Businesses (user-defined)
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT,
  industry TEXT,
  logo_url TEXT,
  color TEXT,
  description TEXT,
  categories JSONB, -- ["Category 1", "Category 2"]
  created_at TIMESTAMP
);

-- Complaints
CREATE TABLE complaints (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  category TEXT, -- From business.categories
  language TEXT,
  source TEXT,
  text TEXT,
  translated_text TEXT,
  severity INTEGER,
  timestamp TIMESTAMP,
  metadata JSONB
);

-- Incidents (auto-generated from complaints)
CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  category TEXT,
  status TEXT,
  -- ... same fields as current Incident type
);
```

## Example: E-Commerce Business

```typescript
const shopifyStore: BusinessConfig = {
  id: "shopify-store-1",
  name: "My Fashion Store",
  industry: "ecommerce",
  color: "#10B981",
  categories: [
    "Delivery Delay",
    "Wrong Item Received",
    "Damaged Product",
    "Size Issues",
    "Return Request",
    "Payment Problem",
  ],
  description: "Online fashion retailer based in Lagos",
};

// Complaints would look like:
const complaint: Complaint = {
  id: "c1",
  business: "shopify-store-1",
  category: "Delivery Delay",
  language: "en",
  source: "email",
  text: "I ordered 3 days ago and haven't received my package",
  severity: 6,
  // ...
};
```

## Testing the Generalization

1. Add 3 different businesses:
   - A bank (Wema)
   - An e-commerce store
   - A SaaS product

2. Generate complaints for each with industry-specific categories

3. Verify:
   - Incidents flagged correctly per business
   - Filtering works
   - Analytics show correct comparison
   - No hardcoded bank references visible

## Benefits

✅ **Multi-Business**: One dashboard for all your businesses
✅ **Industry-Agnostic**: Works for any vertical
✅ **Customizable**: Each business has its own categories
✅ **Scalable**: Add unlimited businesses
✅ **White-Label Ready**: Can be branded for specific industries

## Next Steps

1. Start with types refactor
2. Add business management UI
3. Update seed data generator
4. Test with multiple businesses
5. Update all component references
6. Add onboarding flow
7. Deploy and iterate

---

**Estimated Effort**: 8-12 hours for core refactor + testing
