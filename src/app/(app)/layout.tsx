/**
 * App shell layout for authenticated pages.
 */

import { Suspense } from "react";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { ProductProvider } from "@/features/products/product-context";
import { ProductSelector } from "@/features/products/product-selector";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface" />
          }
        >
          <AppSidebar />
        </Suspense>
        <div className="pl-64">
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center justify-between gap-4 px-6">
              <h1 className="text-sm font-medium text-muted-foreground">
                Dashboard
              </h1>

              <div className="flex items-center gap-3">
                <ProductSelector />
              </div>
            </div>
          </header>
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </div>
      </div>
    </ProductProvider>
  );
}
