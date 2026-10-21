"use client";

import React from "react";
import { CategoryStyle } from "@/lib/skill-progress";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";

interface AssessmentResultProps {
  isPassed: boolean;
  score: number;
  total: number;
  honorific: string;
  category: CategoryStyle;
  onViewCertificate: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export function AssessmentResult({
  isPassed,
  score,
  total,
  honorific,
  category,
  onViewCertificate,
  onRetake,
  onClose,
}: AssessmentResultProps) {
  return (
    <div className="max-w-md mx-auto py-4 text-center space-y-6" role="status">
      <div
        className={cn(
          "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
          isPassed ? cn(category.fill, "text-white") : "bg-surface-muted text-ink-secondary"
        )}
      >
        <AppIcon name={isPassed ? "diploma-verified-linear" : "restart-linear"} className="w-8 h-8" />
      </div>

      <div>
        <p className={cn("text-xs font-semibold", isPassed ? category.text : "text-ink-muted")}>
          {isPassed ? "Passed · Certificate earned" : "Not passed this time"}
        </p>
        <h3 className="mt-1 font-serif italic text-3xl text-ink leading-tight">
          {isPassed ? honorific : "Review and try again"}
        </h3>
        <p className="mt-3 text-[15px] text-ink-secondary leading-relaxed">
          You answered{" "}
          <strong className="font-semibold text-ink tabular-nums">
            {score} of {total}
          </strong>{" "}
          correctly.{" "}
          {isPassed
            ? "Your certificate is saved to your profile."
            : "You need 2 of 3 to pass. Read the explanations, practise the steps once more, then retake it."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        {isPassed ? (
          <Button size="lg" onClick={onViewCertificate} className="w-full sm:w-auto">
            <AppIcon name="diploma-verified-linear" className="w-4 h-4" />
            <span>View certificate</span>
          </Button>
        ) : (
          <Button size="lg" onClick={onRetake} className="w-full sm:w-auto">
            <AppIcon name="refresh-linear" className="w-4 h-4" />
            <span>Retake the assessment</span>
          </Button>
        )}
        <Button size="lg" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
          Back to Studio
        </Button>
      </div>
    </div>
  );
}
