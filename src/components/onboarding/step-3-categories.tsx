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
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Step3Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep3({
  data,
  updateData,
  onNext,
  onBack,
}: Step3Props) {
  const selectedPack = INDUSTRY_PACKS[data.industryPackId];
  const availableCategories = selectedPack?.categories || [];

  const toggleCategory = (category: string) => {
    const newCategories = data.categories.includes(category)
      ? data.categories.filter((c) => c !== category)
      : [...data.categories, category];
    updateData({ categories: newCategories });
  };

  const handleSubmit = () => {
    if (data.categories.length > 0) {
      onNext();
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Select Categories</CardTitle>
        <CardDescription>
          Choose the complaint categories relevant to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-6">
          {availableCategories.map((category) => {
            const isSelected = data.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`w-full text-left rounded-lg border-2 p-3 transition-all hover:border-accent-primary hover:bg-muted/50 ${
                  isSelected
                    ? "border-accent-primary bg-accent-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-accent-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{category}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg bg-muted p-3 mb-6">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{data.categories.length}</span> of {availableCategories.length} categories
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full"
            disabled={data.categories.length === 0}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
