import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { expoOut, inOut, map, pop, tween } from "../motion";
import { Owl } from "../components/Owl";
import { RiseText } from "../components/Kinetic";
import { DotGrid } from "./AskOwl";
import { SEAL } from "./Certificate";

const CHIPS = [
  { label: "Music", bg: C.music },
  { label: "Languages", bg: C.languages },
  { label: "Crafts & life", bg: C.life },
  { label: "Tech", bg: C.tech },
];

/** Logo resolve: the owl lands, the wordmark rises, the tagline settles. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const iris = tween(frame, 0, 15, inOut) * 1520;
  const owl = pop(frame, 4, { damping: 9, stiffness: 140 });
  const wink = frame >= 34 && frame <= 40 ? Math.sin(((frame - 34) / 6) * Math.PI) : 0;
  const tagline = tween(frame, 20, 14, expoOut);
  const push = map(frame, [0, 60], [1.04, 1]);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris}px at ${SEAL.x}px ${SEAL.y}px)`, background: C.canvas, overflow: "hidden" }}>
      <DotGrid color="rgba(26,25,23,0.08)" drift={frame * 0.5} />
      <AbsoluteFill
        style={{
          background: "repeating-conic-gradient(from 0deg at 50% 40%, rgba(180,66,15,0.05) 0deg 5deg, transparent 5deg 15deg)",
          transform: `rotate(${-frame * 0.3}deg) scale(1.8)`,
          opacity: tween(frame, 6, 20),
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${push})` }}>
        <div
          style={{
            width: 230,
            height: 230,
            borderRadius: "50%",
            background: "#fff",
            border: `3px solid ${C.border}`,
            boxShadow: "0 30px 70px rgba(26,25,23,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${owl}) rotate(${(1 - owl) * -20}deg) translateY(${Math.sin(frame / 8) * 3}px)`,
          }}
        >
          <Owl size={176} lidRight={wink} pupil={{ x: map(frame, [10, 22], [0, 1.6]), y: 0 }} />
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT.sans, fontWeight: 800, fontSize: 188, letterSpacing: "-0.055em", color: C.ink, lineHeight: 1 }}>
          <RiseText text="Skillora" frame={frame} delay={9} stagger={1.3} dur={16} />
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 46,
            letterSpacing: "-0.02em",
            color: C.ink2,
            opacity: tagline,
            filter: `blur(${(1 - tagline) * 12}px)`,
            transform: `translateY(${(1 - tagline) * 24}px)`,
          }}
        >
          A place to master your next{" "}
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, fontSize: 54, color: C.vermilion }}>craft</span>.
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
          {CHIPS.map((chip, k) => {
            const p = pop(frame, 28 + k * 2.5, { damping: 11 });
            return (
              <span
                key={chip.label}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: chip.bg,
                  color: "#fff",
                  fontFamily: FONT.mono,
                  fontSize: 18,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  transform: `scale(${p}) translateY(${(1 - p) * 20}px)`,
                }}
              >
                {chip.label}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: SEAL.x - iris,
            top: SEAL.y - iris,
            width: iris * 2,
            height: iris * 2,
            borderRadius: "50%",
            border: `${map(frame, [0, 14], [40, 0])}px solid ${C.vermilion}`,
            flexShrink: 0,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
