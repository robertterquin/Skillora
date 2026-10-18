import type React from "react";

/**
 * One face of a cube turning left: the outgoing face swings away to the left
 * while the incoming face swings in from the right. `p` runs 0 → 1.
 */
export function cubeFace(p: number, face: "out" | "in", half: number): React.CSSProperties {
  const angle = face === "out" ? -90 * p : 90 * (1 - p);
  const lift = Math.sin(p * Math.PI) * 220; // pull back mid-turn so the cube reads as an object
  return {
    transform: `translateZ(${-half - lift}px) rotateY(${angle}deg) translateZ(${half}px)`,
    backfaceVisibility: "hidden",
  };
}
