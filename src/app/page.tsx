/**
 * Custo marketing homepage.
 * Minimal, infrastructure-inspired product landing page.
 */

import Link from "next/link";
import {
  ArrowUpRight,
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  Layers3,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

const navigation = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Roadmap", href: "#roadmap" },
];

const features = [
  {
    icon: Radar,
    title: "Incident detection",
    description:
      "Spot unusual complaint spikes by category before individual reports become a bigger problem.",
    number: "01",
  },
  {
    icon: Globe2,
    title: "Local language intelligence",
    description:
      "Bring customer feedback closer together across English, Pidgin, Yoruba, and Hausa.",
    number: "02",
  },
  {
    icon: Layers3,
    title: "One complaint layer",
    description:
      "Bring feedback from connected channels into a single place your team can investigate.",
    number: "03",
  },
];

const workflow = [
  {
    number: "01",
    title: "Collect",
    description:
      "Bring customer complaints from supported channels into one stream.",
  },
  {
    number: "02",
    title: "Understand",
    description:
      "Organize complaints by category, language, severity, and product.",
  },
  {
    number: "03",
    title: "Investigate",
    description:
      "Surface unusual complaint patterns and give your team a starting point.",
  },
];

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Custo home"
      className="inline-flex items-center gap-2.5"
    >
      <span
        className={`flex items-center justify-center rounded-lg bg-foreground text-background ${
          small ? "size-7" : "size-8"
        }`}
      >
        <Activity className={small ? "size-4" : "size-[18px]"} />
      </span>

      <span className="text-lg font-semibold tracking-tight">
        Custo
      </span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-foreground" />
      {children}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-gradient-to-b from-foreground/[0.06] via-transparent to-transparent blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-2xl shadow-black/[0.06]">
        {/* Browser frame */}
        <div className="flex h-12 items-center justify-between border-b border-border px-4 sm:px-5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-border bg-muted" />
            <span className="size-2.5 rounded-full border border-border bg-muted" />
            <span className="size-2.5 rounded-full border border-border bg-muted" />
          </div>

          <div className="hidden items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground sm:flex">
            <ShieldCheck className="size-3" />
            Custo / Overview
          </div>

          <span className="text-xs font-medium text-muted-foreground">
            Preview
          </span>
        </div>

        <div className="grid min-h-[340px] md:grid-cols-[180px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden border-r border-border p-4 md:block">
            <div className="mb-7 flex items-center gap-2 text-xs font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md border border-border">
                <Activity className="size-3.5" />
              </span>
              Workspace
            </div>

            <div className="space-y-1">
              {[
                { label: "Overview", active: true },
                { label: "Complaints", active: false },
                { label: "Incidents", active: false },
                { label: "Products", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-md px-3 py-2 text-xs ${
                    item.active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-border pt-4">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Workspace status
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Interface preview
              </div>
            </div>
          </aside>

          {/* Dashboard body */}
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Workspace / Overview
                </p>

                <h3 className="mt-1 text-xl font-semibold tracking-tight">
                  Complaint overview
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  A unified view of customer feedback.
                </p>
              </div>

              <div className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
                Last 24 hours
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Complaints", value: "—" },
                { label: "Active incidents", value: "—" },
                { label: "Multi-source", value: "—" },
                { label: "Detection time", value: "—" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-border p-3 sm:p-4"
                >
                  <p className="text-[11px] text-muted-foreground">
                    {metric.label}
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
                    {metric.value}
                  </p>

                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/3 rounded-full bg-foreground/20" />
                  </div>
                </div>
              ))}
            </div>

            {/* Chart preview */}
            <div className="mt-4 rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-medium">
                    Complaint activity
                  </h4>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Hourly complaint volume
                  </p>
                </div>

                <Activity className="size-4 text-muted-foreground" />
              </div>

              <div className="relative mt-5 h-28 overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-border"
                    />
                  ))}
                </div>

                <svg
                  viewBox="0 0 640 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                  fill="none"
                  aria-label="Illustrative complaint activity chart"
                  role="img"
                >
                  <defs>
                    <linearGradient
                      id="activity-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.13"
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0 78 C25 76 35 69 55 74 S95 83 120 65 S155 74 180 60 S220 64 245 49 S280 60 305 45 S340 53 365 40 S400 55 425 32 S460 44 485 27 S520 40 545 19 S590 30 640 10 L640 100 L0 100 Z"
                    fill="url(#activity-fill)"
                    className="text-foreground"
                  />

                  <path
                    d="M0 78 C25 76 35 69 55 74 S95 83 120 65 S155 74 180 60 S220 64 245 49 S280 60 305 45 S340 53 365 40 S400 55 425 32 S460 44 485 27 S520 40 545 19 S590 30 640 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    className="text-foreground"
                  />
                </svg>
              </div>

              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>24h ago</span>
                <span>18h</span>
                <span>12h</span>
                <span>6h</span>
                <span>Now</span>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Illustrative interface · Not live customer data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 md:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/overview"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              href="/overview"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-foreground px-3.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Open dashboard
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[420px] max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(120,120,120,0.12),transparent_65%)]" />

          <div className="mx-auto max-w-5xl text-center">
            <SectionLabel>
              Complaint intelligence for consumer brands
            </SectionLabel>

            <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl md:text-7xl">
              Know when something
              <br className="hidden sm:block" /> is breaking.
              <span className="block text-muted-foreground">
                Before it escalates.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Custo turns customer complaints into actionable signals,
              helping Nigerian brands spot emerging issues across supported
              channels, languages, and products.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/overview"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 sm:w-auto"
              >
                Explore the dashboard
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/live"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
              >
                Try the live simulation
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Built for the realities of customer feedback in Nigeria.
            </p>
          </div>

          {/* Product preview */}
          <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
            <DashboardPreview />
          </div>
        </section>

        {/* Trust / positioning strip */}
        <section className="border-y border-border">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-8">
            {[
              {
                icon: Activity,
                title: "Complaint signals",
                description: "See what customers are reporting.",
              },
              {
                icon: Globe2,
                title: "Local context",
                description: "Account for Nigerian languages and usage.",
              },
              {
                icon: ShieldCheck,
                title: "Product-level views",
                description: "Keep feedback organized by product.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 sm:justify-center"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <SectionLabel>Core capabilities</SectionLabel>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Customer feedback is a signal.
                <span className="block text-muted-foreground">
                  Custo helps you read it.
                </span>
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Move from scattered complaints to a clearer picture of
                customer pain, with a workflow designed for investigation
                rather than another dashboard full of noise.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.number}
                    className="bg-background p-6 sm:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/30">
                        <Icon className="size-5" />
                      </div>

                      <span className="font-mono text-xs text-muted-foreground">
                        {feature.number}
                      </span>
                    </div>

                    <h3 className="mt-8 text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-y border-border bg-muted/20 px-5 py-24 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>The workflow</SectionLabel>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                From complaint to clarity.
              </h2>

              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Give your team a consistent way to understand, organize,
                and investigate customer issues.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {workflow.map((step, index) => (
                <div key={step.number} className="relative">
                  {index !== workflow.length - 1 && (
                    <div className="absolute left-11 top-5 hidden h-px w-[calc(100%-2rem)] bg-border md:block" />
                  )}

                  <div className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-background font-mono text-xs">
                    {step.number}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry focus */}
        <section className="px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <SectionLabel>Designed for local realities</SectionLabel>

              <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Start with Nigerian banking.
                <span className="block text-muted-foreground">
                  Expand from there.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                Financial services depend on customer trust. Failed
                transfers, delayed reversals, access issues, and confusing
                support experiences can quickly generate complaints across
                different channels.
              </p>

              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Custo is designed to help teams bring those reports
                together and identify patterns worth investigating.
                The same approach can extend to telecoms, utilities,
                commerce, and other consumer services.
              </p>

              <Link
                href="/overview"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Explore the dashboard
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <p className="text-sm font-semibold">
                    Common complaint categories
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Illustrative examples
                  </p>
                </div>

                <Zap className="size-4 text-muted-foreground" />
              </div>

              <div className="space-y-1 pt-3">
                {[
                  {
                    title: "Failed transactions",
                    description: "Payments and transfer issues",
                  },
                  {
                    title: "Delayed reversals",
                    description: "Unresolved transaction disputes",
                  },
                  {
                    title: "Access problems",
                    description: "Login and account availability",
                  },
                  {
                    title: "Customer support",
                    description: "Response delays and unresolved cases",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs font-medium">
                      0{index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section
          id="roadmap"
          className="scroll-mt-24 border-y border-border bg-muted/20 px-5 py-24 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <SectionLabel>Product direction</SectionLabel>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                A focused foundation.
                <span className="block text-muted-foreground">
                  Room to grow.
                </span>
              </h2>

              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Start with the essentials, validate the workflow, and
                expand capabilities around real customer needs.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  status: "Current focus",
                  title: "Complaint intelligence",
                  items: [
                    "Product-level complaint views",
                    "Complaint categorization",
                    "Initial incident signals",
                  ],
                  current: true,
                },
                {
                  status: "Next",
                  title: "Broader integrations",
                  items: [
                    "Additional industry configurations",
                    "More complaint sources",
                    "Team investigation workflows",
                  ],
                  current: false,
                },
                {
                  status: "Future direction",
                  title: "Extensible platform",
                  items: [
                    "Industry-specific configurations",
                    "Custom workflows",
                    "Broader reporting capabilities",
                  ],
                  current: false,
                },
              ].map((phase) => (
                <article
                  key={phase.title}
                  className="rounded-xl border border-border bg-background p-6"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`size-1.5 rounded-full ${
                        phase.current
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/40"
                      }`}
                    />
                    {phase.status}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {phase.title}
                  </h3>

                  <ul className="mt-5 space-y-3">
                    {phase.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-4 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-24 sm:px-8 sm:py-28">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-muted/20 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(120,120,120,0.12),transparent_70%)]" />

            <div className="relative">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-border bg-background">
                <Activity className="size-5" />
              </div>

              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Make customer complaints actionable.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Explore the product, inspect the complaint workflow,
                and see how Custo approaches emerging customer issues.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/overview"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/live"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Try live simulation
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo small />
            <p className="mt-2 text-xs text-muted-foreground">
              Complaint intelligence for Nigerian consumer brands.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground"
          >
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>

            <Link
              href="/overview"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>

            <Link
              href="/live"
              className="transition-colors hover:text-foreground"
            >
              Simulation
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            Built for Wema Bank Hackaholics 7.0
          </p>
        </div>
      </footer>
    </div>
  );
}
