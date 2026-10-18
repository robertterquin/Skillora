import React from "react";
import { expoOut, inOut, lerp, map, tween } from "../motion";

interface CursorProps {
  frame: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  moveAt: number;
  moveDur: number;
  clickAt: number;
  hideAt?: number;
  color?: string;
}

/** A pointer that glides along a gentle arc, clicks with a ripple, then fades. */
export const Cursor: React.FC<CursorProps> = ({ frame, from, to, moveAt, moveDur, clickAt, hideAt = 1e9, color = "#1A1917" }) => {
  const p = tween(frame, moveAt, moveDur, inOut);
  const arc = Math.sin(p * Math.PI) * -90;
  const x = lerp(from.x, to.x, p);
  const y = lerp(from.y, to.y, p) + arc;
  const press = frame >= clickAt && frame < clickAt + 4 ? 0.82 : 1;
  const ripple = tween(frame, clickAt, 14, expoOut);
  const opacity = map(frame, [moveAt - 2, moveAt + 2], [0, 1]) * (1 - map(frame, [hideAt, hideAt + 5], [0, 1]));

  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, zIndex: 100, pointerEvents: "none" }}>
      {frame >= clickAt && (
        <div
          style={{
            position: "absolute",
            left: -60,
            top: -60,
            width: 120,
            height: 120,
            borderRadius: 60,
            border: `3px solid ${color}`,
            transform: `scale(${0.2 + ripple})`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg
        width={54}
        height={54}
        viewBox="0 0 24 24"
        style={{ transform: `scale(${press})`, transformOrigin: "4px 3px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))" }}
      >
        <path d="M4 3l15 7.5-6.5 2-2.5 7z" fill={color} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
