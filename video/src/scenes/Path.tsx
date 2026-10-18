import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { backOut, expoOut, inOut, map, pop, tween } from "../motion";
import { CheckDraw, ClockIcon } from "../components/Icons";
import { Eyebrow, RiseText } from "../components/Kinetic";

const STEPS = [
  { title: "The golden recipe: 18g in, 36g out", min: 8 },
  { title: "Puck prep & channeling prevention", min: 12 },
  { title: "Sensory diagnosis: sour vs. bitter", min: 10 },
  { title: "Roast adaptation milestone", min: 15 },
];
const TICK_AT = 30;
const TICK_GAP = 8;
const PANEL = 780;
const ROW = 150;

/** The picked card becomes a plan: four steps tick off while the progress ring fills. */
export const Path: React.FC = () => {
  const frame = useCurrentFrame();
  const open = tween(frame, 0, 15, inOut);
  const panelX = 1920 - (1920 - PANEL) * open;

  const ticks = STEPS.map((_, i) => tween(frame, TICK_AT + i * TICK_GAP, 7, expoOut));
  const progress = ticks.reduce((a, b) => a + b, 0) / STEPS.length;
  const pct = Math.round(progress * 100);
  const ringR = 120;
  const circ = 2 * Math.PI * ringR;
  const complete = tween(frame, TICK_AT + 3 * TICK_GAP + 4, 12, backOut);

  const focusSeconds = Math.max(0, 600 - Math.max(0, frame - 14) * 9);
  const mm = String(Math.floor(focusSeconds / 60)).padStart(2, "0");
  const ss = String(focusSeconds % 60).padStart(2, "0");

  return (
    <AbsoluteFill style={{ background: C.life, overflow: "hidden" }}>
      {/* Left: the skill */}
      <div style={{ position: "absolute", left: 120, top: 210, width: PANEL - 200, color: "#fff" }}>
        <Eyebrow color="rgba(255,255,255,0.65)" style={{ opacity: tween(frame, 0, 8) }}>
          Crafts & life · 4 steps · 45 min
        </Eyebrow>
        <div style={{ marginTop: 22, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 76, lineHeight: 1.02 }}>
          <RiseText text="Dialing In Specialty" frame={frame} delay={1} by="word" stagger={2} />
          <br />
          <RiseText text="Espresso Extraction" frame={frame} delay={5} by="word" stagger={2} />
        </div>

        <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ position: "relative", width: 280, height: 280, transform: `scale(${pop(frame, 8, { damping: 14 })})` }}>
            <svg width={280} height={280} viewBox="0 0 280 280" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={140} cy={140} r={ringR} stroke="rgba(255,255,255,0.14)" strokeWidth={18} fill="none" />
              <circle
                cx={140}
                cy={140}
                r={ringR}
                stroke={C.emeraldSoft}
                strokeWidth={18}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${1 + complete * 0.08 - tween(frame, TICK_AT + 3 * TICK_GAP + 10, 8) * 0.08})`,
              }}
            >
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 84, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                {pct}%
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.16em", color: "rgba(255,255,255,0.6)" }}>
                {pct === 100 ? "COMPLETE" : "PROGRESS"}
              </span>
            </div>
            {pct === 100 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `4px solid ${C.emeraldSoft}`,
                  transform: `scale(${1 + tween(frame, TICK_AT + 3 * TICK_GAP + 7, 16) * 0.5})`,
                  opacity: 1 - tween(frame, TICK_AT + 3 * TICK_GAP + 7, 16),
                }}
              />
            )}
          </div>
          <div style={{ opacity: tween(frame, 16, 10), transform: `translateY(${(1 - tween(frame, 16, 12)) * 30}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}>
              <ClockIcon size={20} color="rgba(255,255,255,0.6)" /> FOCUS
            </div>
            <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 72, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {mm}:{ss}
            </div>
          </div>
        </div>
      </div>

      {/* Right: the plan */}
      <div
        style={{
          position: "absolute",
          left: panelX,
          top: 0,
          width: 1920 - PANEL,
          height: 1080,
          background: C.paper,
          borderTopLeftRadius: 48 * (1 - open) + 0,
          boxShadow: "-40px 0 80px rgba(0,0,0,0.25)",
          padding: "200px 120px 0 110px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 56, letterSpacing: "-0.04em", color: C.ink }}>
            <RiseText text="Your path" frame={frame} delay={6} stagger={0.8} />
          </div>
          <Eyebrow color={C.muted} style={{ opacity: tween(frame, 14, 8) }}>
            {Math.round(progress * 4)} / 4 done
          </Eyebrow>
        </div>

        <div style={{ position: "relative", marginTop: 44 }}>
          {STEPS.map((step, i) => {
            const enter = tween(frame, 8 + i * 3, 14, expoOut);
            const tick = ticks[i];
            const tickPop = pop(frame, TICK_AT + i * TICK_GAP, { damping: 9, stiffness: 220 });
            const done = frame >= TICK_AT + i * TICK_GAP;
            const lineFill = tween(frame, TICK_AT + i * TICK_GAP + 2, TICK_GAP, inOut);
            return (
              <div
                key={step.title}
                style={{
                  position: "relative",
                  height: ROW,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 36,
                  opacity: enter,
                  transform: `translateX(${(1 - enter) * 120}px)`,
                }}
              >
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", left: 34, top: 74, width: 4, height: ROW - 76, background: C.border, borderRadius: 2 }}>
                    <div style={{ width: "100%", height: `${lineFill * 100}%`, background: C.emerald, borderRadius: 2 }} />
                  </div>
                )}
                <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 36,
                      border: `3px solid ${done ? C.emerald : C.border}`,
                      background: done ? C.emerald : "#fff",
                      transform: `scale(${done ? 0.6 + tickPop * 0.4 : 1})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT.mono,
                      fontSize: 24,
                      color: C.muted,
                    }}
                  >
                    {done ? <CheckDraw size={40} progress={tick} color="#fff" strokeWidth={3.2} /> : i + 1}
                  </div>
                  {done &&
                    Array.from({ length: 10 }).map((_, k) => {
                      const a = (k / 10) * Math.PI * 2 + i;
                      const b = tween(frame, TICK_AT + i * TICK_GAP, 12, expoOut);
                      return (
                        <span
                          key={k}
                          style={{
                            position: "absolute",
                            left: 36 + Math.cos(a) * (30 + b * 46) - 4,
                            top: 36 + Math.sin(a) * (30 + b * 46) - 4,
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: k % 2 ? C.emerald : C.amberSoft,
                            opacity: 1 - b,
                            transform: `scale(${1 - b * 0.6})`,
                          }}
                        />
                      );
                    })}
                </div>
                <div
                  style={{
                    flex: 1,
                    marginTop: 4,
                    padding: "6px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: "0.14em", color: done ? C.emerald : C.muted }}>
                      STEP {i + 1}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: FONT.sans,
                        fontWeight: 600,
                        fontSize: 38,
                        letterSpacing: "-0.02em",
                        color: C.ink,
                        opacity: map(tick, [0, 1], [1, 0.55]),
                      }}
                    >
                      {step.title}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 18,
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: done ? C.emeraldLight : C.paperWarm,
                      color: done ? C.emerald : C.ink2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.min} min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
