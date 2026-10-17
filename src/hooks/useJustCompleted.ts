"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True for a moment after `isDone` flips from false to true, so a completion
 * can be celebrated without animating things that were already done on load.
 */
export function useJustCompleted(isDone: boolean, ms = 900): boolean {
  const previous = useRef(isDone);
  const [just, setJust] = useState(false);

  useEffect(() => {
    if (isDone && !previous.current) {
      setJust(true);
      const timer = window.setTimeout(() => setJust(false), ms);
      previous.current = isDone;
      return () => window.clearTimeout(timer);
    }
    previous.current = isDone;
    if (!isDone) setJust(false);
  }, [isDone, ms]);

  return just;
}
