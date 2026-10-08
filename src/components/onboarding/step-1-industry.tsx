"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INDUSTRY_PACKS } from "@/data/constants";
import { CheckCircle2, Package } from "lucide-react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Step1Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function OnboardingStep1({ data, updateData, onNext }: Step1Props) {
  const handleSelect = (packId: string) => {
    updateData({ 
      industryPackId: packId,
      categories: INDUSTRY_PACKS[packId].categories,
      sources: INDUSTRY_PACKS[packId].defaultSources,
    });
    // Auto-advance after selection
    setTimeout(onNext, 300);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Choose Your Industry</CardTitle>
        <CardDescription>
          Select the industry pack that best matches your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.values(INDUSTRY_PACKS).map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => handleSelect(pack.id)}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all hover:border-accent-primary hover:bg-muted/50 ${
                data.industryPackId === pack.id
                  ? "border-accent-primary bg-accent-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {data.industryPackId === pack.id ? (
                    <CheckCircle2 className="h-5 w-5 text-accent-primary" />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{pack.name}</h3>
                    {pack.isSample && (
                      <span className="inline-flex items-center rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                        Sample
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pack.categories.slice(0, 3).join(", ")}
                    {pack.categories.length > 3 && ", ..."}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-info/10 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> Banking
            is fully implemented with demo data. Other packs are samples showing
            our multi-industry vision.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
