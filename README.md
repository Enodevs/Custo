# Custo

AI-powered complaint intelligence platform for businesses. Know what's breaking before complaints reach the regulator.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) and you'll be redirected to `/overview`.

## 📁 Project Structure

```
radarx/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (app)/                    # Main application routes
│   │   │   ├── overview/             # Dashboard overview
│   │   │   ├── incidents/            # Incident list & detail
│   │   │   ├── complaints/           # Complaints table
│   │   │   ├── banks/                # Bank comparison
│   │   │   ├── languages/            # Language statistics
│   │   │   ├── live/                 # Live demo
│   │   │   ├── accuracy/             # Model metrics
│   │   │   └── settings/             # Settings
│   │   └── layout.tsx                # Root layout
│   │
│   ├── features/                     # Feature modules
│   │   └── overview/
│   │       ├── components/           # Feature-specific components
│   │       └── hooks/                # Feature hooks
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/                       # shadcn/ui primitives
│   │   └── shell/                    # App shell (sidebar, command menu)
│   │
│   ├── domain/                       # Business logic
│   │   ├── incident-detection.ts     # Incident flagging rules
│   │   ├── severity-score.ts         # Severity calculation
│   │   └── baseline-calculator.ts    # Baseline logic
│   │
│   ├── data/                         # Data layer
│   │   ├── types.ts                  # TypeScript types
│   │   ├── constants.ts              # App constants
│   │   ├── client.ts                 # DataClient interface
│   │   └── adapters/
│   │       └── mock/                 # Mock data implementation
│   │
│   └── lib/                          # Utilities
│       ├── utils.ts                  # General utilities
│       ├── formatting.ts             # Formatting functions
│       └── hooks/                    # Shared hooks
│
├── public/                           # Static assets
└── docs/                             # Documentation (to be created)
```

## ✨ Features Implemented

### Phase 1: Foundation ✅
- Design tokens and theming (dark/light)
- App shell with sidebar navigation
- Command palette (Cmd/Ctrl+K)
- DataClient interface with mock adapter
- Domain logic (incident detection, severity scoring, baseline calculation)
- ~600 seeded complaints over 7 days

### Phase 2: Overview & Incidents ✅
- Overview dashboard with stats, active incidents, live feed, bank comparison
- Incidents list page
- Real-time live signal feed
- Incident cards with severity and confirmation status

### Phase 3: Complaints, Banks, Languages ✅
- Searchable complaints table with filters
- Bank comparison page (Wema highlighted as home bank)
- Languages statistics with Nigerian Pidgin, Yoruba, and Hausa examples

### Phase 4: Live Demo & Accuracy ✅
- Live demo page with customer chat simulation
- Real-time classification display
- Accuracy metrics page with confusion matrix and per-category performance

### Phase 5: Settings ✅
- Workspace configuration
- Detection rules (spike threshold, minimum complaints, time window)

## 🎨 Design System

- **Typography**: Geist Sans (UI), Geist Mono (code/numbers)
- **Colors**: Purple accent (#7C3AED), status colors for critical/warning/ok/info
- **Dark theme default** with full light theme support
- **Infrastructure product feel**: Dense, calm, precise (inspired by Vercel, Linear, Stripe)

## 🗄️ Data Architecture

### DataClient Pattern
Components never import seed data directly. They call hooks that use the `DataClient` interface:

```typescript
// Interface (src/data/client.ts)
export interface DataClient {
  getOverview(): Promise<OverviewData>;
  getIncidents(params?): Promise<{incidents: Incident[]; total: number}>;
  // ... more methods
}

// Mock implementation (src/data/adapters/mock/)
export class MockDataClient implements DataClient {
  // Uses seeded data generator
}

// Future: HTTP implementation (src/data/adapters/http/)
export class HttpDataClient implements DataClient {
  // Makes real API calls
}
```

### Incident Detection Rules
- **Minimum complaints**: 5
- **Spike threshold**: 2.0x baseline
- **Time window**: 6 hours
- **Severity multiplier**: 1.5x if in-app signal exists

## 🔧 Tech Stack

- **Framework**: Next.js 16.4.0 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix primitives
- **State**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **Package Manager**: Bun

## 🐛 Known Issues

1. **Dynamic route `/incidents/[id]`** - Currently has build issues with Next.js 16 prerendering. To fix:
   - Remove `/src/app/(app)/incidents/[id]/` folder
   - Or add proper Suspense boundaries
   - Or wait for Next.js update

2. **Switch component** - Settings page uses native checkbox instead of shadcn Switch due to import path differences

## 🚧 To Do

### Remaining Features
- [ ] Onboarding flow (4-step wizard)
- [ ] Marketing homepage
- [ ] Public customer support chat page
- [ ] Generalize from banks to any business/platform
- [ ] Fix incident detail page
- [ ] Add documentation (ARCHITECTURE.md, DESIGN_SYSTEM.md, etc.)
- [ ] Add unit tests for domain logic

### Generalization Tasks
To make this work for any business (not just banks):

1. **Update types** (`src/data/types.ts`):
   - Replace `Bank` type with `Platform` or `Business`
   - Make categories configurable
   
2. **Update constants** (`src/data/constants.ts`):
   - Replace `BANKS` with `PLATFORMS`
   - Allow dynamic category configuration

3. **Update seed data** (`src/data/adapters/mock/seed-generator.ts`):
   - Generalize example complaints
   - Support different business types

4. **Add onboarding** to let users:
   - Enter their business name
   - Select business type (bank, e-commerce, SaaS, etc.)
   - Choose complaint categories
   - Configure data sources

## 📝 Scripts

```bash
# Development
bun dev                  # Start dev server
bun run build           # Build for production
bun start               # Start production server

# Code quality
bun run lint            # Run Biome linter
bun run format          # Format code with Biome
```

## 🎯 Demo Data

The app uses deterministic seeded data:
- ~600 complaints across 8 banks
- 4 languages: English (45%), Nigerian Pidgin (35%), Yoruba (10%), Hausa (6%)
- 4 sources: Play Store, X (Twitter), Nairaland, In-App
- 3 pre-seeded incidents:
  1. Wema failed transfers (flagged, confirmed by both)
  2. GTBank app downtime (flagged, public only)
  3. Access ATM issues (watching level)

## 🔐 Environment Variables

Create `.env.local` (optional for future API integration):

```env
# Future: Real API endpoint
# NEXT_PUBLIC_API_URL=https://api.example.com

# Future: Authentication
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret-here
```

## 🤝 Contributing

This is a hackathon project built for Wema Bank Hackaholics 7.0. Contributions welcome after the event.

## 📄 License

MIT

---

Built with ❤️ for Wema Bank Hackaholics 7.0
