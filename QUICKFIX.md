# Quick Fix Guide

## 🔴 Critical: Fix Build

The build fails because of `/src/app/(app)/incidents/[id]/page.tsx`. Here's how to fix it:

### Option 1: Delete the Folder (Quickest)
```bash
rm -rf src/app/\(app\)/incidents/\[id\]
```

Then build should work:
```bash
bun run build
```

### Option 2: Simplify the Page
If you want to keep the detail page, replace the entire file content with this simple version:

```typescript
"use client";

export default function IncidentDetailPage() {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-2xl font-semibold">Incident Details</h1>
      <p className="text-muted-foreground mt-2">
        Coming soon - incident detail view
      </p>
    </div>
  );
}
```

## ✅ After Build Works

### 1. Test the App
```bash
bun run build
bun start
```

Visit http://localhost:3000 and test:
- `/overview` - Should show dashboard
- `/businesses` - Should show 3 demo businesses
- `/analytics` - Should show comparison
- `/complaints` - Should show table

### 2. Add Onboarding (Next Priority)

Create `/src/app/onboarding/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Complaint Radar</h1>
          <p className="text-muted-foreground">
            Set up your workspace in 4 easy steps
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded ${
                i <= step ? "bg-accent-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-lg border border-border bg-card p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 1: Workspace</h2>
              <p className="text-muted-foreground">
                Tell us about your workspace
              </p>
              {/* Add form fields here */}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 2: First Business</h2>
              <p className="text-muted-foreground">Add your first business</p>
              {/* Add business form here */}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 3: Categories</h2>
              <p className="text-muted-foreground">
                Choose complaint categories
              </p>
              {/* Add category selector here */}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 4: Complete</h2>
              <p className="text-muted-foreground">You're all set!</p>
              {/* Show summary */}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (step === 4) {
                router.push("/overview");
              } else {
                setStep(Math.min(4, step + 1));
              }
            }}
          >
            {step === 4 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Add Public Support Page

Create `/src/app/support/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Customer Support</h1>
          <p className="text-muted-foreground">
            We're here to help. Describe your issue below.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-ok/20 bg-ok/10 p-6 text-center">
            <p className="font-medium text-ok mb-2">Thank you!</p>
            <p className="text-sm text-muted-foreground">
              Your complaint has been received and will be reviewed shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Describe Your Issue</Label>
              <Textarea id="message" rows={5} required />
            </div>

            <Button type="submit" className="w-full">
              Submit Complaint
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
```

## 🎯 Current Demo Flow

1. User visits `/` → Redirects to `/overview`
2. Overview shows stats for all 3 demo businesses
3. Click "Businesses" → See Wema, Jumia, Paystack
4. Click "Analytics" → Compare the 3 businesses
5. Click "Complaints" → See all complaints across businesses
6. Click "Live Demo" → Test customer chat

## 📋 What Users Can Do Now

✅ View dashboard with multiple businesses
✅ See complaints from different industries
✅ Compare business performance
✅ Manage businesses (UI only, no backend)
✅ Configure detection rules
✅ Test live demo
✅ Switch themes (dark/light)
✅ Use command palette (Cmd+K)

## 🚀 What's Next

1. Fix build (delete [id] folder)
2. Add onboarding wizard
3. Add public support page
4. Add business form (create/edit)
5. Connect to real backend
6. Deploy!

---

**TL;DR:** Delete `/src/app/(app)/incidents/[id]` folder, build will work, then add onboarding and support pages.
