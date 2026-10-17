"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

function RouteProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          key="route-progress"
          initial={{ scaleX: 0, opacity: 1, transformOrigin: "0% 50%" }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 h-[2.5px] bg-accent-vermilion z-50 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBarInner />
    </Suspense>
  );
}
