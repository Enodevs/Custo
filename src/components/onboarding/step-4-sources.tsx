"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SOURCES, LANGUAGES } from "@/data/constants";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Step4Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingStep4({
  data,
  updateData,
  onComplete,
  onBack,
}: Step4Props) {
  const toggleSource = (source: string) => {
    const newSources = data.sources.includes(source)
      ? data.sources.filter((s) => s !== source)
      : [...data.sources, source];
    updateData({ sources: newSources });
  };

  const toggleLanguage = (language: string) => {
    const newLanguages = data.languages.includes(language)
      ? data.languages.filter((l) => l !== language)
      : [...data.languages, language];
    updateData({ languages: newLanguages });
  };

  const handleComplete = () => {
    if (data.sources.length > 0 && data.languages.length > 0) {
      onComplete();
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Data Sources & Languages</CardTitle>
        <CardDescription>
          Configure where complaints come from and what languages to support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sources */}
        <div>
          <h3 className="font-semibold mb-3">Data Sources</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SOURCES).map(([key, label]) => {
              const isSelected = data.sources.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSource(key)}
                  className={`text-left rounded-lg border-2 p-3 transition-all hover:border-accent-primary hover:bg-muted/50 ${
                    isSelected
                      ? "border-accent-primary bg-accent-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-accent-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="font-semibold mb-3">Languages</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LANGUAGES).map(([key, label]) => {
              const isSelected = data.languages.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLanguage(key)}
                  className={`text-left rounded-lg border-2 p-3 transition-all hover:border-accent-primary hover:bg-muted/50 ${
                    isSelected
                      ? "border-accent-primary bg-accent-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-accent-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {data.sources.length} sources
            </span>{" "}
            and{" "}
            <span className="font-medium text-foreground">
              {data.languages.length} languages
            </span>{" "}
            selected
          </p>
        </div>

        <div className="flex gap-3 pt-2">
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
            onClick={handleComplete}
            className="w-full"
            disabled={data.sources.length === 0 || data.languages.length === 0}
          >
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
