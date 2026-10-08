/**
 * Top navigation bar with wordmark, bank switcher, tabs, command palette, theme toggle.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { DemoTag } from "./demo-tag";
import { CommandMenu } from "./command-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/overview" },
  { label: "Incidents", href: "/incidents" },
  { label: "Complaints", href: "/complaints" },
  { label: "Banks", href: "/banks" },
  { label: "Languages", href: "/languages" },
  { label: "Live", href: "/live" },
  { label: "Accuracy", href: "/accuracy" },
  { label: "Settings", href: "/settings" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Wordmark */}
        <Link
          href="/overview"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-primary text-primary-foreground text-xs font-bold">
            C
          </div>
          <span>Custo</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 ml-8">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <DemoTag />
          <CommandMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
