/**
 * Sidebar navigation for the app.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Building2,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { DemoTag } from "./demo-tag";

const NAV_ITEMS = [
  { label: "Overview", href: "/overview", icon: Activity },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Complaints", href: "/complaints", icon: MessageSquare },
  { label: "Products", href: "/admin/products", icon: Building2 },
  // { label: "Languages", href: "/languages", icon: Languages },
  // { label: "Accuracy", href: "/accuracy", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface flex flex-col">
      {/* Logo */}
      <Link href="/" className="h-14 border-b border-border flex items-center gap-2 px-4 hover:bg-muted/50 transition-colors">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-primary text-primary-foreground text-sm font-bold">
          C
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Custo
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-3">
        <DemoTag />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
