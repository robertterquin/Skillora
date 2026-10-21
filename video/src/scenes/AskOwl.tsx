import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { expoIn, expoOut, inOut, lerp, map, pop, tween } from "../motion";
import { Owl } from "../components/Owl";
import { Eyebrow, RiseText } from "../components/Kinetic";
import { PlayIcon } from "../components/Icons";
import { useLayout } from "../layout";

const REPLY = "Try espresso. Four short steps, about 45 minutes.";

export const DotGrid: React.FC<{ color: string; drift?: number; opacity?: number }> = ({ color, drift = 0, opacity = 1 }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${color} 1.6px, transparent 1.6px)`,
      backgroundSize: "36px 36px",
      backgroundPosition: `${drift}px ${drift * 0.5}px`,
      opacity,
    }}
  />
);

export const AskOwl: React.FC = () => {
  const frame = useCurrentFrame();
  const { pick } = useLayout();
  const owlAt = pick({ x: 600, y: 540 }, { x: 540, y: 600 });

  const iris = tween(frame, 4, 14, expoOut) * 1250;
  const exit = tween(frame, 52, 10, expoIn);

  const owlIn = pop(frame, 2, { damping: 11, stiffness: 120 });
  const draw = tween(frame, 3, 18, inOut);
  const fill = tween(frame, 15, 8);
  const open = tween(frame, 20, 5);
  const blink = frame >= 44 && frame <= 49 ? Math.sin(((frame - 44) / 5) * Math.PI) : 0;
  const lid = Math.max(1 - open, blink);
  const lookAtUser = tween(frame, 12, 8);
  const lookAtReply = tween(frame, 28, 8);
  const pupil = {
    x: lerp(0, 2.6, lookAtUser) - lookAtReply * 0.6,
    y: lerp(0, -1.8, lookAtUser) + lookAtReply * 2.4,
  };

  const userIn = pop(frame, 9, { damping: 13 });
  const replyIn = pop(frame, 22, { damping: 13 });
  const typing = frame >= 23 && frame < 29;
  const chars = Math.round(map(frame, [29, 41], [0, REPLY.length]));
  const chipIn = pop(frame, 39, { damping: 12 });

  return (
    <AbsoluteFill
      style={{
        clipPath: `circle(${iris}px at 50% 50%)`,
        background: C.canvas,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translateX(${-exit * 760}px) scale(${1 - exit * 0.06})`,
          filter: `blur(${exit * 14}px)`,
        }}
      >
        <DotGrid color="rgba(26,25,23,0.09)" drift={frame * 0.6} />

        <div style={{ position: "absolute", left: owlAt.x - 270, top: owlAt.y - 270, width: 540, height: 540 }}>
          {[16, 22, 28].map((at) => {
            const p = tween(frame, at, 22, expoOut);
            return (
              <div
                key={at}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `3px solid ${C.vermilion}`,
                  transform: `scale(${0.85 + p * 0.75})`,
                  opacity: frame < at ? 0 : (1 - p) * 0.7,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#fff",
              border: `3px solid ${C.border}`,
              boxShadow: "0 40px 90px rgba(26,25,23,0.14)",
              transform: `scale(${owlIn}) rotate(${(1 - owlIn) * -14}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ transform: `rotate(${Math.sin(frame / 9) * 2}deg) translateY(${Math.sin(frame / 7) * 4}px)` }}>
              <Owl size={400} draw={draw} fill={fill} lidLeft={lid} lidRight={lid} pupil={pupil} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -20,
              transform: `translateX(-50%) scale(${pop(frame, 22, { damping: 10 })})`,
              padding: "12px 26px",
              borderRadius: 999,
              background: C.ink,
              color: "#fff",
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.12em",
              display: "flex",
              alignItems: "center",
              gap: 12,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 5, background: C.vermilionSoft }} />
            ARCHIMEDES
          </div>
        </div>

        <div style={{ position: "absolute", ...pick({ left: 1010, top: 250, width: 800 }, { left: 90, top: 1060, width: 900 }) }}>
          <Eyebrow color={C.muted} style={{ opacity: tween(frame, 6, 10) }}>
            <RiseText text="Ask Archimedes" frame={frame} delay={6} stagger={0.6} dur={10} />
          </Eyebrow>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 34 }}>
            <div
              style={{
                padding: "26px 34px",
                borderRadius: "36px 36px 10px 36px",
                background: C.ink,
                color: "#fff",
                fontFamily: FONT.sans,
                fontWeight: 500,
                fontSize: 40,
                letterSpacing: "-0.01em",
                transform: `translateY(${(1 - userIn) * 60}px) scale(${0.85 + userIn * 0.15})`,
                transformOrigin: "right bottom",
                opacity: Math.min(1, userIn * 1.5),
              }}
            >
              I have 15 minutes a day.
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              width: "fit-content",
              maxWidth: 680,
              padding: "28px 34px",
              borderRadius: "36px 36px 36px 10px",
              background: "#fff",
              border: `2px solid ${C.border}`,
              boxShadow: "0 24px 60px rgba(26,25,23,0.10)",
              fontFamily: FONT.sans,
              fontSize: 40,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              color: C.ink,
              minHeight: 52,
              transform: `translateY(${(1 - replyIn) * 60}px) scale(${0.85 + replyIn * 0.15})`,
              transformOrigin: "left bottom",
              opacity: Math.min(1, replyIn * 1.5),
            }}
          >
            {typing ? (
              <div style={{ display: "flex", gap: 12, height: 52, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      background: C.muted,
                      transform: `translateY(${Math.sin((frame - i * 2) / 1.6) * 7}px)`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <>
                {REPLY.slice(0, chars)}
                <span
                  style={{
                    display: "inline-block",
                    width: 4,
                    height: 44,
                    marginLeft: 4,
                    verticalAlign: "middle",
                    background: C.vermilion,
                    opacity: chars < REPLY.length || frame % 10 < 5 ? 1 : 0,
                  }}
                />
              </>
            )}
          </div>
          <div
            style={{
              marginTop: 22,
              display: "inline-flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 26px 18px 18px",
              borderRadius: 24,
              background: "#fff",
              border: `2px solid ${C.border}`,
              boxShadow: "0 18px 40px rgba(26,25,23,0.08)",
              transform: `scale(${chipIn}) translateY(${(1 - chipIn) * 30}px)`,
              transformOrigin: "left center",
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: C.life,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlayIcon size={26} color="#fff" />
            </span>
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.14em", color: C.muted }}>DRAFT PLAN</span>
              <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 34, color: C.ink }}>
                Dialing In Specialty Espresso
              </span>
            </span>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div
          style={{
            width: iris * 2,
            height: iris * 2,
            borderRadius: "50%",
            border: `${map(frame, [4, 16], [18, 0])}px solid ${C.night}`,
            flexShrink: 0,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
