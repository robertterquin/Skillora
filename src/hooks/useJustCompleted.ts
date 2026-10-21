"use client";

import { useEffect, useRef, useState } from "react";

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
