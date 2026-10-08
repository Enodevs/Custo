"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingStep1 } from "@/components/onboarding/step-1-industry";
import { OnboardingStep2 } from "@/components/onboarding/step-2-organization";
import { OnboardingStep3 } from "@/components/onboarding/step-3-categories";
import { OnboardingStep4 } from "@/components/onboarding/step-4-sources";
import { Building2 } from "lucide-react";

export type OnboardingData = {
  industryPackId: string;
  organizationName: string;
  organizationDescription: string;
  categories: string[];
  languages: string[];
  sources: string[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    industryPackId: "",
    organizationName: "",
    organizationDescription: "",
    categories: [],
    languages: ["en", "pcm"],
    sources: [],
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    // Save data to settings/localStorage
    console.log("Onboarding complete:", data);
    // Redirect to overview
    router.push("/overview");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome to Custo</h1>
            <p className="text-sm text-muted-foreground">
              Set up your workspace in 4 easy steps
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full transition-colors ${
                step === currentStep
                  ? "bg-accent-primary"
                  : step < currentStep
                    ? "bg-accent-primary/60"
                    : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        {currentStep === 1 && (
          <OnboardingStep1
            data={data}
            updateData={updateData}
            onNext={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <OnboardingStep2
            data={data}
            updateData={updateData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <OnboardingStep3
            data={data}
            updateData={updateData}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <OnboardingStep4
            data={data}
            updateData={updateData}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  );
}
