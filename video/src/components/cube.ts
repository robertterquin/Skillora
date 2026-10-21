import type React from "react";

export function cubeFace(p: number, face: "out" | "in", half: number): React.CSSProperties {
  const angle = face === "out" ? -90 * p : 90 * (1 - p);
  const lift = Math.sin(p * Math.PI) * 220;
  return {
    transform: `translateZ(${-half - lift}px) rotateY(${angle}deg) translateZ(${half}px)`,
    backfaceVisibility: "hidden",
  };
}
