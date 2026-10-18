import React from "react";
import { C } from "../theme";

interface OwlProps {
  size: number;
  /** 0 → 1: outline strokes drawing on. */
  draw?: number;
  /** 0 → 1: fills and accent feather fading in. */
  fill?: number;
  /** 0 = eyes open, 1 = closed. */
  lidLeft?: number;
  lidRight?: number;
  pupil?: { x: number; y: number };
  stroke?: string;
}

const BODY = "M 28 42 C 28 24 42 16 60 16 C 78 16 92 24 92 42 V 70 C 92 90 78 104 60 104 C 42 104 28 90 28 70 Z";
const WING = "M 28 60 C 40 57 49 65 49 79 C 49 90 41 98 32 100";
const FEATHER = "M 56 87 C 59 71 73 64 79 65 C 80 76 71 88 56 90 Z";

/** Archimedes, Skillora's owl, driven entirely by props so every frame is deterministic. */
export const Owl: React.FC<OwlProps> = ({
  size,
  draw = 1,
  fill = 1,
  lidLeft = 0,
  lidRight = 0,
  pupil = { x: 0, y: 0 },
  stroke = C.owl,
}) => {
  const dash = (delay: number) => {
    const p = Math.min(1, Math.max(0, (draw - delay) / (1 - delay)));
    // Round caps on a zero-length dash still paint a dot, so hide undrawn strokes.
    return { strokeDasharray: 1, strokeDashoffset: 1 - p, pathLength: 1, strokeOpacity: p > 0.01 ? 1 : 0 } as const;
  };
  const eye = (cx: number, lid: number, id: string) => (
    <g>
      <clipPath id={id}>
        <circle cx={cx} cy={46} r={10.25} />
      </clipPath>
      <circle cx={cx} cy={46} r={10.5} fill="#fff" opacity={fill} />
      <g clipPath={`url(#${id})`} opacity={fill}>
        <g transform={`translate(${pupil.x} ${pupil.y})`}>
          <circle cx={cx} cy={46} r={5} fill={stroke} />
          <circle cx={cx + 1.7} cy={44.3} r={1.7} fill="#fff" />
          <circle cx={cx - 1.4} cy={47.4} r={0.8} fill="#fff" opacity={0.65} />
        </g>
        <rect x={cx - 13} y={33} width={26} height={24 * lid} fill="#fff" />
        <path
          d={`M ${cx - 8} 46.5 Q ${cx} 51 ${cx + 8} 46.5`}
          stroke={stroke}
          strokeWidth={3.2}
          strokeLinecap="round"
          fill="none"
          opacity={lid > 0.85 ? 1 : 0}
        />
      </g>
      <circle cx={cx} cy={46} r={12.5} stroke={stroke} strokeWidth={4.8} fill="none" {...dash(0.25)} />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ overflow: "visible" }}>
      <path d={BODY} fill="#fff" fillOpacity={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" {...dash(0)} />
      <path
        d={WING}
        fill="#F8FAFC"
        fillOpacity={fill}
        stroke={stroke}
        strokeWidth={4.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...dash(0.15)}
      />
      <g opacity={fill} transform={`translate(${(1 - fill) * 6} ${(1 - fill) * 6})`}>
        <path d={FEATHER} fill={C.cobalt} />
        <path d="M 52 93 L 72 71" stroke={C.cobaltDeep} strokeWidth={3} strokeLinecap="round" />
      </g>
      <path d="M 24 35 Q 34 29 45 33" stroke={stroke} strokeWidth={4.8} strokeLinecap="round" {...dash(0.4)} />
      <path d="M 96 35 Q 86 29 75 33" stroke={stroke} strokeWidth={4.8} strokeLinecap="round" {...dash(0.4)} />
      <path d="M 56.5 45 Q 60 41.5 63.5 45" stroke={stroke} strokeWidth={4.5} strokeLinecap="round" {...dash(0.5)} />
      {eye(44, lidLeft, "owl-eye-l")}
      {eye(76, lidRight, "owl-eye-r")}
      <path
        d="M 56 54 L 60 61 L 64 54"
        stroke={stroke}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...dash(0.55)}
      />
    </svg>
  );
};
