"use client";

import React from "react";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "./Toast";

/** App-wide client providers: toasts, and animations that respect reduced-motion settings. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
