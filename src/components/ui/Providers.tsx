"use client";

import React, { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "./Toast";

/** App-wide client providers: toasts, and animations that respect reduced-motion settings. */
export function Providers({ children }: { children: React.ReactNode }) {
  // Offline support for the installed app. Production only, so it never caches dev builds.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("Service worker not registered", err));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
