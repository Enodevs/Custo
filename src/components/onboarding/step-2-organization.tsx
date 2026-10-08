"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Step2Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2({
  data,
  updateData,
  onNext,
  onBack,
}: Step2Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.organizationName.trim()) {
      onNext();
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Organization Details</CardTitle>
        <CardDescription>
          Tell us about your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Organization Name *</FieldLabel>
            <Input
              type="text"
              placeholder="e.g., Wema Bank"
              value={data.organizationName}
              onChange={(e) =>
                updateData({ organizationName: e.target.value })
              }
              required
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel>Description (Optional)</FieldLabel>
            <Textarea
              placeholder="Brief description of your organization"
              value={data.organizationDescription}
              onChange={(e) =>
                updateData({ organizationDescription: e.target.value })
              }
              rows={3}
            />
          </Field>

          <div className="flex gap-3 pt-4">
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
              type="submit"
              className="w-full"
              disabled={!data.organizationName.trim()}
            >
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
