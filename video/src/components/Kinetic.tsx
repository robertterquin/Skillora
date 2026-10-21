import React from "react";
import { expoOut, tween } from "../motion";
import { FONT } from "../theme";

export const RiseText: React.FC<{
  text: string;
  frame: number;
  delay?: number;
  stagger?: number;
  dur?: number;
  by?: "char" | "word";
  style?: React.CSSProperties;
  charStyle?: (index: number) => React.CSSProperties;
}> = ({ text, frame, delay = 0, stagger = 1.2, dur = 14, by = "char", style, charStyle }) => {
  const parts = by === "char" ? Array.from(text) : text.split(/(\s+)/);
  let visibleIndex = 0;
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", ...style }}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;
        const idx = visibleIndex++;
        const p = tween(frame, delay + idx * stagger, dur, expoOut);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "bottom",
              paddingBottom: "0.08em",
              marginBottom: "-0.08em",
              paddingRight: "0.04em",
              marginRight: "-0.04em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 8}deg)`,
                transformOrigin: "left bottom",
                ...charStyle?.(idx),
              }}
            >
              {part}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color: string; style?: React.CSSProperties }> = ({
  children,
  color,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.mono,
      fontSize: 20,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);
