/**
 * Marketing homepage.
 */

import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-primary text-primary-foreground text-sm font-bold">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Custo
            </span>
          </div>
          <Link
            href="/overview"
            className="inline-flex items-center justify-center rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-primary/90 transition-colors"
          >
            View Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm">
            <span className="text-accent-primary font-medium mr-2">NEW</span>
            <span className="text-muted-foreground">
              Now supporting any Nigerian consumer brand
            </span>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Complaint intelligence for
            <span className="block text-accent-primary mt-2">
              Nigerian brands
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Know what's breaking before it reaches the regulator. AI-powered detection across multiple channels and languages.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/overview"
              className="inline-flex items-center justify-center rounded-md bg-accent-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-accent-primary/90 transition-colors"
            >
              Explore Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/live"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium hover:bg-muted transition-colors"
            >
              Live Simulation
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums">87%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Category Accuracy
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums">45m</div>
              <div className="text-sm text-muted-foreground mt-1">
                Median Detection Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums">4</div>
              <div className="text-sm text-muted-foreground mt-1">
                Languages Supported
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums">5+</div>
              <div className="text-sm text-muted-foreground mt-1">
                Data Sources
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Nigerian brands
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              Detect incidents before they escalate, across every channel your customers use
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Detection</h3>
              <p className="text-sm text-muted-foreground">
                Automatic spike detection with configurable baselines. Know within minutes when something breaks.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-language</h3>
              <p className="text-sm text-muted-foreground">
                English, Pidgin, Yoruba, and Hausa. Because your customers don't all speak the same way.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cross-channel</h3>
              <p className="text-sm text-muted-foreground">
                Play Store, X, Nairaland, in-app, email. One view of complaints from every channel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banking First */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border-2 border-accent-primary bg-card p-8">
              <div className="inline-flex items-center rounded-full bg-accent-primary/10 px-3 py-1 text-sm font-medium text-accent-primary mb-6">
                NOW AVAILABLE
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Banking first, any brand next
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We started with banking because Nigerian banks face unique complaint dynamics: multi-channel feedback across Play Store, X, in-app, and Nairaland; multilingual complaints in English, Pidgin, Yoruba, and Hausa; and strict CBN reporting requirements.
              </p>
              <p className="text-base text-muted-foreground">
                The same detection engine works for any consumer brand: telecom operators, e-commerce platforms, fintechs, or utilities. Categories and severity rules adapt to your industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pathway */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Our pathway
            </h2>
            <p className="text-lg text-muted-foreground">
              Building the complaint intelligence layer for Nigerian consumer brands
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="inline-flex items-center rounded-full bg-ok/10 px-3 py-1 text-sm font-medium text-ok mb-4">
                NOW
              </div>
              <h3 className="text-xl font-semibold mb-3">Design Partner</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok mt-0.5 shrink-0" />
                  <span>Banking industry pack (fully implemented)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok mt-0.5 shrink-0" />
                  <span>Wema Bank as home organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ok mt-0.5 shrink-0" />
                  <span>Full feature set with accuracy metrics</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="inline-flex items-center rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning mb-4">
                NEXT
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Customers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <span>Telecom industry pack (sample)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <span>Power distribution pack (sample)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <span>Offered to business customers</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="inline-flex items-center rounded-full bg-info/10 px-3 py-1 text-sm font-medium text-info mb-4">
                LATER
              </div>
              <h3 className="text-xl font-semibold mb-3">Full Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                  <span>E-commerce, SaaS, Healthcare packs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                  <span>Industry pack marketplace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                  <span>Custom pack builder</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See it in action
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore the demo with real banking data, or try the live simulation to see how incidents are detected in real-time.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/overview"
                className="inline-flex items-center justify-center rounded-md bg-accent-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-accent-primary/90 transition-colors"
              >
                Explore Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/live"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium hover:bg-muted transition-colors"
              >
                Live Simulation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-primary text-primary-foreground text-xs font-bold">
                C
              </div>
              <span className="text-sm font-medium">Custo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for Wema Bank Hackaholics 7.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
