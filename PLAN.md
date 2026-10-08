# Complaint Radar – Build Plan

## Current State Analysis

**Framework**: Next.js 16.4.0 (App Router)  
**Package Manager**: Bun 1.3.14  
**Styling**: Tailwind CSS v4 (with Turbopack integration)  
**Fonts**: Geist Sans and Geist Mono (already configured)  
**Linting**: Biome (configured for React and Next.js)  
**TypeScript**: v5 with strict mode enabled  

The project is scaffolded with modern Next.js conventions. Geist fonts match design requirements. Tailwind v4 is already integrated. Biome replaces ESLint/Prettier.

---

## Execution Phases

### Phase 1: Foundation
**Goal**: Core infrastructure, design tokens, shell, DataClient, domain logic

- Design system tokens and theme (CSS variables in globals.css)
- App shell with top bar, theme toggle, command palette, demo data tag
- UI primitives directory (shadcn/ui with Radix)
- DataClient interface and mock adapter with seeded data
- Domain logic (incident detection, severity scoring, baseline calculation) with Vitest tests
- Types, constants (banks, categories, sources, languages)
- Documentation skeleton (all docs/ files created)

**Acceptance**: Type check, lint pass; theme toggle works; command palette opens; domain tests pass; all symbols documented.

---

### Phase 2: Overview and Incidents
**Goal**: Core dashboard and incident management

- Overview page with stat tiles, sparklines, live feed, heatmap, comparison bars
- Incidents list with filters and sorting
- Incident detail drawer and full page with charts, signals, complaints
- Loading skeletons, empty states, error boundaries
- Chart components (sparkline, area, bars, heatmap)

**Acceptance**: Type check, lint, build pass; all states render correctly; incidents flagged per domain rules; keyboard navigation works.

---

### Phase 3: Complaints, Banks, Languages
**Goal**: Deep-dive analytical views

- Complaints page with searchable table, filter chips, URL-synced state, expandable rows
- Banks comparison page with Wema pinned and highlighted
- Languages page with distribution charts and worked example
- Bank and language badge components

**Acceptance**: Type check, lint, build pass; filters persist in URL; all banks display correctly; example translations accurate.

---

### Phase 4: Live Demo and Accuracy
**Goal**: Demo capabilities and model performance transparency

- Live demo split-screen with customer chat and bank view
- Real-time signal updates with typing indicators
- Demo controls (simulate spike, reset) with visible Demo tag
- Accuracy page with confusion matrix, per-category metrics, gold set info
- Honest accuracy disclaimer

**Acceptance**: Type check, lint, build pass; demo spike updates dashboard in <10s; accuracy numbers labelled as demo; no invented statistics.

---

### Phase 5: Onboarding and Settings
**Goal**: First-run experience and configuration

- Four-step onboarding flow with stepper, keyboard controls, state persistence
- Workspace setup, signal source connections, language/rule configuration, alert preferences
- Scanning transition animation landing on Overview with welcome note
- Settings page reusing onboarding controls plus demo data reset
- Settings persisted to DataClient

**Acceptance**: Type check, lint, build pass; flow completes without loss on refresh; settings apply; keyboard navigation complete.

---

### Phase 6: Homepage (Marketing)
**Goal**: Credible product page for judges and stakeholders

- Navigation with product sections and demo CTA
- Hero with promise statement and real incident card preview
- Problem statement, how it works (4 steps), two signals diagram
- Language example (Pidgin complaint with translation)
- Honest accuracy section, roadmap clearly marked as planned
- Footer with no fake logos/testimonials

**Acceptance**: Type check, lint, build pass; no lorem ipsum; no invented statistics; one accent color; responsive on 1080p projector.

---

### Phase 7: Polish
**Goal**: Production-ready, accessible, documented, demo-quality

- Responsive pass (desktop → tablet → phone)
- Accessibility audit (focus rings, landmarks, aria-live, contrast verification)
- Empty and error states for all pages
- Final documentation pass (all TSDoc complete, examples added)
- Production build optimization
- CLAUDE.md for future AI sessions
- .env.example and CONTRIBUTING section

**Acceptance**: `bun run build` succeeds with no warnings; keyboard navigation works everywhere; new developer can start from README alone; no banned elements present.

---

## Folder Structure

```
radarx/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # Route group for homepage
│   │   │   └── page.tsx
│   │   ├── (app)/                    # Route group for authenticated app
│   │   │   ├── layout.tsx            # App shell wrapper
│   │   │   ├── overview/
│   │   │   │   └── page.tsx
│   │   │   ├── incidents/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── complaints/
│   │   │   │   └── page.tsx
│   │   │   ├── banks/
│   │   │   │   └── page.tsx
│   │   │   ├── languages/
│   │   │   │   └── page.tsx
│   │   │   ├── live/
│   │   │   │   └── page.tsx
│   │   │   ├── accuracy/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   ├── globals.css               # Design tokens and Tailwind
│   │   ├── not-found.tsx             # 404 page
│   │   └── error.tsx                 # Error boundary
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── marketing/
│   │   │   ├── components/           # Hero, Problem, HowItWorks, etc.
│   │   │   └── hooks/
│   │   ├── onboarding/
│   │   │   ├── components/           # Steps, Stepper, Progress
│   │   │   ├── hooks/                # useOnboardingState
│   │   │   └── types.ts
│   │   ├── overview/
│   │   │   ├── components/           # StatTile, LiveFeed, Heatmap
│   │   │   └── hooks/                # useOverviewData
│   │   ├── incidents/
│   │   │   ├── components/           # IncidentList, IncidentDetail, Drawer
│   │   │   ├── hooks/                # useIncidents, useIncident
│   │   │   └── types.ts
│   │   ├── complaints/
│   │   │   ├── components/           # ComplaintsTable, Filters
│   │   │   └── hooks/
│   │   ├── banks/
│   │   │   ├── components/           # BankComparison, BankChip
│   │   │   └── hooks/
│   │   ├── languages/
│   │   │   ├── components/           # LanguageStats, WorkedExample
│   │   │   └── hooks/
│   │   ├── live/
│   │   │   ├── components/           # CustomerChat, BankView, DemoControls
│   │   │   └── hooks/                # useLiveSignals, useDemoControls
│   │   ├── accuracy/
│   │   │   ├── components/           # ConfusionMatrix, MetricsTable
│   │   │   └── hooks/
│   │   └── settings/
│   │       ├── components/           # SettingsSections
│   │       └── hooks/
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── shell/                    # App shell components
│   │   │   ├── top-bar.tsx
│   │   │   ├── bank-switcher.tsx
│   │   │   ├── nav-tabs.tsx
│   │   │   ├── command-palette.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── demo-tag.tsx
│   │   ├── charts/                   # Chart components
│   │   │   ├── sparkline.tsx
│   │   │   ├── area-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── heatmap.tsx
│   │   │   └── matrix.tsx
│   │   ├── status/                   # Status components
│   │   │   ├── status-dot.tsx
│   │   │   ├── severity-meter.tsx
│   │   │   ├── signal-pair.tsx
│   │   │   └── confirmed-badge.tsx
│   │   ├── badges/                   # Domain badges
│   │   │   ├── bank-chip.tsx
│   │   │   ├── language-badge.tsx
│   │   │   └── source-badge.tsx
│   │   └── common/                   # Common components
│   │       ├── copy-button.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── json-viewer.tsx
│   │       ├── key-value-list.tsx
│   │       └── loading-spinner.tsx
│   │
│   ├── domain/                       # Pure business logic
│   │   ├── incident-detection.ts     # Incident flagging rules
│   │   ├── severity-score.ts         # Severity calculation
│   │   ├── baseline-calculator.ts    # 7-day baseline logic
│   │   └── __tests__/                # Vitest unit tests
│   │       ├── incident-detection.test.ts
│   │       ├── severity-score.test.ts
│   │       └── baseline-calculator.test.ts
│   │
│   ├── data/                         # Data layer
│   │   ├── types.ts                  # All TypeScript types
│   │   ├── constants.ts              # Banks, categories, sources, languages
│   │   ├── client.ts                 # DataClient interface
│   │   └── adapters/
│   │       ├── mock/                 # Mock implementation
│   │       │   ├── index.ts          # Mock DataClient
│   │       │   ├── seed-generator.ts # Deterministic seeded data
│   │       │   └── handlers.ts       # Mock CRUD operations
│   │       └── http/                 # Future real API (stubs)
│   │           ├── index.ts          # HTTP DataClient stub
│   │           └── endpoints.ts      # Documented endpoint contracts
│   │
│   ├── lib/                          # Utilities
│   │   ├── formatting.ts             # Currency, dates, relative time
│   │   ├── cn.ts                     # Class name utility
│   │   ├── hooks/                    # Shared hooks
│   │   │   ├── use-theme.ts
│   │   │   ├── use-local-storage.ts
│   │   │   └── use-debounce.ts
│   │   └── utils.ts                  # Misc utilities
│   │
│   └── styles/
│       └── themes.css                # Additional theme overrides if needed
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System design, data flow diagram
│   ├── DESIGN_SYSTEM.md              # Tokens, components catalogue
│   ├── DATA_CONTRACT.md              # Types, rules, API endpoints
│   ├── DEMO.md                       # Three-minute demo script
│   └── adr/                          # Architecture decision records
│       ├── 001-feature-based-structure.md
│       ├── 002-data-client-seam.md
│       ├── 003-mock-first-approach.md
│       └── 004-theming-approach.md
│
├── public/                           # Static assets
│   └── (existing SVGs remain)
│
├── .env.example                      # Environment variable template
├── CLAUDE.md                         # AI assistant conventions
├── README.md                         # Comprehensive project documentation
├── vitest.config.ts                  # Vitest configuration
└── (existing config files)
```

---

## Dependencies to Add

All dependencies installed via `bun add` with exact justification:

### UI & Components
- `@radix-ui/react-dialog` – Modal and drawer primitives
- `@radix-ui/react-dropdown-menu` – Dropdown menus
- `@radix-ui/react-select` – Select inputs
- `@radix-ui/react-slider` – Range sliders
- `@radix-ui/react-switch` – Toggle switches
- `@radix-ui/react-tabs` – Tab navigation
- `@radix-ui/react-tooltip` – Tooltips
- `@radix-ui/react-slot` – Component composition utility
- `class-variance-authority` – Component variant styling
- `clsx` – Conditional class names
- `tailwind-merge` – Merge Tailwind classes without conflicts
- `cmdk` – Command palette primitive

### Charts & Visualization
- `recharts` – Declarative charts (sparklines, areas, bars, heatmap, matrix)
- `d3-scale` – Scale functions for custom charts if needed
- `d3-time-format` – Time formatting for chart axes

### Icons
- `lucide-react` – Icon set (consistent, tree-shakable)

### State & Data
- `zustand` – Lightweight state management for theme and onboarding state
- `react-hook-form` – Form state management in onboarding/settings
- `zod` – Runtime validation for forms and API contracts

### Testing
- `vitest` – Unit test runner for domain logic (dev dependency)
- `@testing-library/react` – React testing utilities (dev dependency)
- `@testing-library/jest-dom` – DOM matchers (dev dependency)
- `happy-dom` – Fast DOM for Vitest (dev dependency)

### Dev Experience
- `@types/d3-scale` – Type definitions (dev dependency)
- `@types/d3-time-format` – Type definitions (dev dependency)

**Total additions**: ~25 dependencies (production) + ~5 dev dependencies

**Not adding**:
- No Framer Motion (motion reserved for minimal interactions, CSS transitions sufficient)
- No heavyweight state libraries (Zustand covers needs)
- No GraphQL/tRPC (DataClient pattern abstracts transport)
- No date libraries (native Intl API sufficient for formatting)
- No animation libraries beyond CSS

---

## Key Technical Decisions

### 1. Data Architecture
**DataClient pattern** with interface/adapter split allows swapping mock data for real API without touching components. Mock adapter uses deterministic seed for consistent demos. HTTP adapter stubs document real endpoints for backend team.

### 2. Testing Strategy
Unit tests only for pure domain logic (incident detection, scoring, baseline). No component tests in this phase – focus on logic correctness. E2E tests out of scope for hackathon timeline.

### 3. Theme Implementation
CSS variables in globals.css for tokens. Zustand store for theme state. System preference detection on mount. Toggle in top bar. Both themes fully designed, not auto-generated.

### 4. Routing Strategy
Next.js App Router with route groups: `(marketing)` for homepage, `(app)` for authenticated shell. Parallel routes not needed. Incident drawer uses URL state but doesn't change route.

### 5. Real-time Updates
Mock "live feed" uses interval polling in demo mode. Real implementation would use WebSocket or SSE through DataClient. Demo controls trigger immediate state updates.

### 6. Accessibility
Semantic HTML, ARIA landmarks, visible focus rings (Tailwind focus-visible), prefers-reduced-motion respected, aria-live on feed updates, keyboard shortcuts documented in command palette.

### 7. Performance
Code-splitting via Next.js dynamic imports for heavy components (charts, command palette). Suspense boundaries on page level. Virtualization not needed for demo data scale (~600 rows max).

---

## Commit Strategy

One commit per phase:
- `feat: foundation - tokens, shell, DataClient, domain logic`
- `feat: overview and incidents pages`
- `feat: complaints, banks, languages pages`
- `feat: live demo and accuracy pages`
- `feat: onboarding and settings flows`
- `feat: marketing homepage`
- `feat: polish, accessibility, documentation`

Each commit must pass: `bun run lint && bun run build && bun run test`

---

## Demo Data Specification

**Volume**: ~600 complaints over 7 days  
**Distribution**:
- Banks: Wema (home bank, 40%), GTBank, Access, Zenith, UBA, First Bank, Kuda, OPay (distribute remaining 60%)
- Sources: Play Store 25%, X 30%, Nairaland 20%, In-app 25%
- Languages: English 45%, Pidgin 35%, Yoruba 10%, Hausa 6%, Mixed 4%
- Time: Evening peaks (6-9pm), lower volume overnight
- Categories: Failed transfers 30%, App downtime 20%, ATM issues 15%, Card fraud 10%, Poor service 10%, Other 15%

**Seeded Incidents**:
1. **Wema - Failed Transfers** (existing, flagged): 18 complaints in 6 hours, 3.2x baseline, severity 7.8, confirmed by both (12 public + 6 in-app)
2. **GTBank - App Downtime** (existing, flagged): 22 complaints in 4 hours, 4.1x baseline, severity 8.2, public only
3. **Access - ATM Issues** (watching level): 7 complaints in 8 hours, 1.6x baseline, severity 4.5, not flagged yet

**Example Complaints**:
- Pidgin: "I send money since morning, dem don debit me but the person never receive am."
- Pidgin: "Abeg, ATM no gree give me cash but my account show say dem debit me 20,000."
- Yoruba: "Won ti gba owo mi sugbon olugba ko ri i." (They've taken my money but receiver hasn't seen it.)
- Hausa: "An cire mini kudi amma mai karba bai samu ba." (Money was deducted from me but receiver didn't get it.)
- English: "Double debit on my POS transaction at 6pm, still no reversal after 3 days."

**Accuracy Gold Set**: 50 hand-labelled complaints, category accuracy 87%, language accuracy 94%, per-category precision/recall believable but clearly demo (documented as evaluated on synthetic sample).

---

## Definition of Done

A phase is complete when:

1. ✅ `bun run lint` passes (Biome check)
2. ✅ `bun run build` succeeds with no errors or warnings
3. ✅ `bun run test` passes all domain logic tests (Phase 1+)
4. ✅ All exported symbols have TSDoc comments
5. ✅ All files have header comments explaining purpose
6. ✅ No `any` types, no magic strings
7. ✅ Both light and dark themes render correctly
8. ✅ No elements from banned list present
9. ✅ Keyboard navigation works for implemented features
10. ✅ Changes committed with clear message

Final done (Phase 7) adds:
- ✅ All documentation files complete and accurate
- ✅ New developer can run project from README alone
- ✅ Production build optimized and deployable
- ✅ Accessibility audit passed (WCAG AA contrast, keyboard nav, screen reader basics)
- ✅ Demo flow (homepage → onboarding → overview → live demo) works end-to-end in <3 minutes

---

## Out of Scope (Explicitly)

- Real authentication/authorization
- Real API integration (stubs only)
- Real LLM inference (classification results are seeded)
- Real web scraping or data collection
- Database integration
- Email/Slack/WhatsApp integrations (UI only)
- Server-side rendering optimization beyond Next.js defaults
- Internationalization (i18n) beyond displaying 4 languages in data
- Component visual regression tests
- E2E tests with Playwright/Cypress
- Monitoring/observability setup
- Deployment configuration beyond build
- User analytics
- Rate limiting
- GDPR compliance features
- Export/reporting features
- User management
- Webhook integrations

These are intentionally deferred to post-hackathon or production phases.

---

## Next Steps

Proceed immediately to Phase 1 without waiting. Begin with:

1. Install all dependencies via `bun add [packages]`
2. Set up Vitest configuration
3. Define design tokens in globals.css
4. Create types.ts and constants.ts
5. Build DataClient interface and mock adapter with seeded generator
6. Implement domain logic with tests
7. Set up UI primitives (shadcn/ui)
8. Build app shell components
9. Create documentation files with structure

Phase 1 target: ~3-4 hours of focused work.
