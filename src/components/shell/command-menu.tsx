/**
 * Command palette for keyboard-driven navigation and search.
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/hooks/use-theme";

const NAVIGATION_ITEMS = [
  { label: "Overview", href: "/overview", keywords: ["dashboard", "home"] },
  { label: "Incidents", href: "/incidents", keywords: ["alerts", "issues"] },
  {
    label: "Complaints",
    href: "/complaints",
    keywords: ["feedback", "reports"],
  },
  { label: "Organizations", href: "/banks", keywords: ["comparison", "banks"] },
  { label: "Languages", href: "/languages", keywords: ["translation"] },
  {
    label: "Accuracy",
    href: "/accuracy",
    keywords: ["metrics", "performance"],
  },
  { label: "Settings", href: "/settings", keywords: ["preferences", "config"] },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { toggleTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 px-0 lg:w-64 lg:justify-start lg:px-3"
      >
        <Search className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline-flex text-muted-foreground text-sm font-normal">
          Search...
        </span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {NAVIGATION_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(() => router.push(item.href))}
                keywords={item.keywords}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => handleSelect(toggleTheme)}>
              Toggle theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
