import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, DECK, FONT } from "../theme";
import { expoIn, inOut, map, pop, tween } from "../motion";
import { BellIcon, CameraIcon, ClockIcon, MailIcon, RefreshIcon } from "../components/Icons";
import { Eyebrow, RiseText } from "../components/Kinetic";
import { cubeFace } from "../components/cube";
import { CUBE, SCENES } from "../timeline";
import { useLayout } from "../layout";

const COVER = 17;
const GAP = 22;
const GRID = {
  landscape: { left: 84, top: 268, bottom: 96, cols: 4, rows: 2 },
  portrait: { left: 60, top: 420, bottom: 150, cols: 2, rows: 4 },
};
type Area = [col: number, row: number, cols?: number, rows?: number];
const AREAS: Record<"focus" | "recap" | "reminder" | "sharp" | "photos", { landscape: Area; portrait: Area }> = {
  focus: { landscape: [0, 0, 1, 2], portrait: [0, 1, 1, 2] },
  recap: { landscape: [1, 0, 2, 1], portrait: [0, 0, 2, 1] },
  reminder: { landscape: [3, 0], portrait: [1, 1] },
  sharp: { landscape: [1, 1], portrait: [1, 2] },
  photos: { landscape: [2, 1, 2, 1], portrait: [0, 3, 2, 1] },
};

function makeCell(W: number, H: number, portrait: boolean) {
  const g = portrait ? GRID.portrait : GRID.landscape;
  const colW = (W - g.left * 2 - GAP * (g.cols - 1)) / g.cols;
  const rowH = (H - g.top - g.bottom - GAP * (g.rows - 1)) / g.rows;
  return (name: keyof typeof AREAS): React.CSSProperties => {
    const [col, row, cols = 1, rows = 1] = AREAS[name][portrait ? "portrait" : "landscape"];
    return {
      position: "absolute",
      left: g.left + col * (colW + GAP),
      top: g.top + row * (rowH + GAP),
      width: colW * cols + GAP * (cols - 1),
      height: rowH * rows + GAP * (rows - 1),
      borderRadius: 32,
      overflow: "hidden",
    };
  };
}

const Tile: React.FC<{ frame: number; order: number; style: React.CSSProperties; children: React.ReactNode }> = ({
  frame,
  order,
  style,
  children,
}) => {
  const p = pop(frame, COVER + 2 + order * 3, { damping: 15, stiffness: 150 });
  return (
    <div
      style={{
        ...style,
        transform: `perspective(1600px) translateY(${(1 - p) * 90}px) rotateX(${(1 - p) * 18}deg) scale(${0.9 + p * 0.1})`,
        opacity: Math.min(1, p * 1.4),
      }}
    >
      {children}
    </div>
  );
};

const label: React.CSSProperties = {
  fontFamily: FONT.mono,
  fontSize: 17,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export const Bento: React.FC = () => {
  const frame = useCurrentFrame();
  const { W, H, portrait } = useLayout();
  const cell = makeCell(W, H, portrait);
  const f = frame - COVER;
  const cube = tween(SCENES.bento.from + frame, CUBE.from, CUBE.dur, inOut);

  const focus = Math.max(0, 600 - Math.max(0, f - 6) * 6);
  const focusP = focus / 600;
  const bars = [0.45, 0.8, 0, 0.92, 0.6, 1, 0.35];
  const days = Math.round(map(f, [10, 34], [0, 5]));
  const travel = tween(f, 16, 34, inOut);
  const slider = map(f, [18, 48], [92, 50], inOut);
  const note = pop(f, 20, { damping: 13 });
  const ring = f >= 24 && f < 44 ? Math.sin((f - 24) * 1.6) * 18 * (1 - (f - 24) / 20) : 0;

  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      {frame >= COVER && (
        <AbsoluteFill style={{ ...cubeFace(cube, "out", W / 2), background: C.canvas, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: (portrait ? GRID.portrait : GRID.landscape).left + 6, top: portrait ? 150 : 116 }}>
            <Eyebrow color={C.muted} style={{ opacity: tween(f, 0, 8) }}>
              Between sessions
            </Eyebrow>
            <div style={{ marginTop: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 84, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1.05 }}>
              <RiseText text="Built to keep you" frame={f} delay={1} stagger={0.5} />
              {portrait ? <br /> : <span style={{ display: "inline-block", width: 22 }} />}
              <RiseText text="going." frame={f} delay={8} stagger={1} style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, fontSize: 96, color: C.vermilion }} />
            </div>
          </div>

          <Tile frame={frame} order={0} style={{ ...cell("focus"), background: C.ink, color: "#fff", padding: 36 }}>
            <div style={{ ...label, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 10 }}>
              <ClockIcon size={20} color="rgba(255,255,255,0.6)" /> Focus timer
            </div>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -46%)" }}>
              <svg width={320} height={320} viewBox="0 0 320 320" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={160} cy={160} r={140} stroke="rgba(255,255,255,0.12)" strokeWidth={10} fill="none" />
                <circle
                  cx={160}
                  cy={160}
                  r={140}
                  stroke={C.vermilionSoft}
                  strokeWidth={10}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 140}
                  strokeDashoffset={2 * Math.PI * 140 * (1 - focusP)}
                />
                {Array.from({ length: 60 }).map((_, k) => (
                  <line
                    key={k}
                    x1={160 + Math.cos((k / 60) * Math.PI * 2) * 116}
                    y1={160 + Math.sin((k / 60) * Math.PI * 2) * 116}
                    x2={160 + Math.cos((k / 60) * Math.PI * 2) * (k % 5 ? 110 : 104)}
                    y2={160 + Math.sin((k / 60) * Math.PI * 2) * (k % 5 ? 110 : 104)}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={2}
                  />
                ))}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, fontSize: 64, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {String(Math.floor(focus / 60)).padStart(2, "0")}:{String(focus % 60).padStart(2, "0")}
              </div>
            </div>
            <div style={{ position: "absolute", left: 36, right: 36, bottom: 36 }}>
              <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 40, lineHeight: 1.05 }}>Puck prep</div>
              <div style={{ ...label, marginTop: 8, color: "rgba(255,255,255,0.55)" }}>Step 2 · 12 min</div>
            </div>
          </Tile>

          <Tile frame={frame} order={1} style={{ ...cell("recap"), background: "#fff", border: `2px solid ${C.border}`, padding: 34 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ ...label, color: C.muted }}>Weekly recap</div>
                <div style={{ marginTop: 8, fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, letterSpacing: "-0.04em", color: C.ink, lineHeight: 1 }}>
                  {days} <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 400, fontSize: 48 }}>days practised</span>
                </div>
              </div>
              <div style={{ ...label, alignSelf: "flex-start", padding: "8px 14px", borderRadius: 999, background: C.emeraldLight, color: C.emerald }}>
                +{Math.round(map(f, [10, 34], [0, 62]))} min
              </div>
            </div>
            <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, height: 150, display: "flex", alignItems: "flex-end", gap: 18 }}>
              {bars.map((h, k) => {
                const g = pop(f, 8 + k * 2, { damping: 11, stiffness: 160 });
                return (
                  <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: "100%",
                        height: Math.max(8, h * 112 * g),
                        borderRadius: 10,
                        background: h === 0 ? C.paperDeep : k === 5 ? C.vermilion : C.ink,
                      }}
                    />
                    <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.muted }}>{"MTWTFSS"[k]}</span>
                  </div>
                );
              })}
            </div>
          </Tile>

          <Tile frame={frame} order={2} style={{ ...cell("reminder"), background: C.vermilion, color: "#fff", padding: 32 }}>
            <div style={{ ...label, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", transform: `rotate(${ring}deg)`, transformOrigin: "50% 10%" }}>
                <BellIcon size={22} color="#fff" />
              </span>
              Reminders
            </div>
            <div
              style={{
                position: "absolute",
                left: 22,
                right: 22,
                top: 92,
                padding: 20,
                borderRadius: 22,
                background: "#fff",
                color: C.ink,
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
                transform: `translateY(${(1 - note) * -140}px)`,
                opacity: Math.min(1, note * 2),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.mono, fontSize: 14, color: C.muted, letterSpacing: "0.1em" }}>
                <MailIcon size={18} color={C.vermilion} /> SKILLORA · 7:30 PM
              </div>
              <div style={{ marginTop: 8, fontFamily: FONT.sans, fontWeight: 700, fontSize: 25, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                10 minutes on espresso tonight?
              </div>
            </div>
            <div style={{ position: "absolute", left: 32, bottom: 28, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 34, opacity: tween(f, 30, 10) }}>
              Never miss a day.
            </div>
          </Tile>

          <Tile frame={frame} order={3} style={{ ...cell("sharp"), background: C.paperWarm, padding: 32 }}>
            <div style={{ ...label, color: C.muted, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", transform: `rotate(${f * 9}deg)` }}>
                <RefreshIcon size={20} color={C.muted} />
              </span>
              Keep it sharp
            </div>
            <div style={{ marginTop: 10, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 38, color: C.ink, lineHeight: 1.05 }}>
              Refreshers that come back.
            </div>
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 66, height: 4, background: C.border, borderRadius: 2 }}>
              <div style={{ width: `${travel * 100}%`, height: "100%", background: C.vermilion, borderRadius: 2 }} />
              {[7, 21, 60].map((d, k) => {
                const at = [0, 0.38, 1][k];
                const hit = pop(f, 16 + at * 34, { damping: 9, stiffness: 220 });
                const passed = travel >= at - 0.001 && f >= 16;
                return (
                  <div key={d} style={{ position: "absolute", left: `${at * 100}%`, top: 2, transform: "translate(-50%, -50%)" }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        background: passed ? C.vermilion : "#fff",
                        border: `3px solid ${passed ? C.vermilion : C.border}`,
                        transform: `scale(${passed ? 0.7 + hit * 0.3 : 1})`,
                      }}
                    />
                    <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", fontFamily: FONT.mono, fontSize: 17, color: passed ? C.vermilion : C.muted, whiteSpace: "nowrap" }}>
                      {d}d
                    </div>
                  </div>
                );
              })}
            </div>
          </Tile>

          <Tile frame={frame} order={4} style={{ ...cell("photos"), background: C.night }}>
            <BeforeAfter slider={slider} />
            <div style={{ position: "absolute", left: 22, top: 20, ...label, color: "#fff", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: "rgba(21,20,19,0.7)" }}>
              <CameraIcon size={20} color="#fff" /> Before & after
            </div>
          </Tile>
        </AbsoluteFill>
      )}

      {DECK.map((color, k) => {
        const inP = tween(frame, k * 1.5, 9, inOut);
        const outP = tween(frame, COVER + k * 1.5, 11, expoIn);
        const y = (1 - inP) * 100 - outP * 100;
        if (outP >= 1) return null;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: (W / DECK.length) * k - 1,
              top: 0,
              width: W / DECK.length + 2,
              height: H,
              background: color,
              transform: `translateY(${y}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Cup: React.FC<{ after: boolean }> = ({ after }) => (
  <svg width={270} height={270} viewBox="0 0 200 200">
    <circle cx={100} cy={100} r={92} fill="#F4EFE6" />
    <circle cx={100} cy={100} r={78} fill="#3B2417" />
    <circle cx={100} cy={100} r={70} fill="#A86B3C" />
    {after ? (
      <path
        d="M100 150 C 70 125 55 105 62 86 C 68 70 88 68 100 86 C 112 68 132 70 138 86 C 145 105 130 125 100 150 Z"
        fill="#F6EBDD"
      />
    ) : (
      <path
        d="M96 140 C 74 132 62 112 72 98 C 76 88 90 92 94 84 C 98 76 112 80 118 90 C 128 102 124 120 108 128 C 104 131 102 138 96 140 Z"
        fill="#E9D7C2"
        opacity={0.85}
      />
    )}
  </svg>
);

const BeforeAfter: React.FC<{ slider: number }> = ({ slider }) => {
  const half = (after: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: after ? "#2A2622" : "#1C1A18",
    clipPath: after ? `inset(0 0 0 ${slider}%)` : undefined,
  });
  const pill = (text: string, side: "left" | "right"): React.ReactNode => (
    <span
      style={{
        position: "absolute",
        [side]: 28,
        bottom: 26,
        fontFamily: FONT.mono,
        fontSize: 16,
        letterSpacing: "0.12em",
        padding: "8px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.14)",
        color: "#fff",
      }}
    >
      {text}
    </span>
  );
  return (
    <AbsoluteFill>
      <div style={half(false)}>
        <div style={{ transform: "translate(-190px, 14px) rotate(-8deg)" }}>
          <Cup after={false} />
        </div>
        {pill("BEFORE", "left")}
      </div>
      <div style={half(true)}>
        <div style={{ transform: "translate(190px, 14px) rotate(6deg)" }}>
          <Cup after />
        </div>
        {pill("AFTER", "right")}
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${slider}%`, width: 4, marginLeft: -2, background: "#fff" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 54,
            height: 54,
            borderRadius: 27,
            background: "#fff",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 22,
            color: C.ink,
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
          }}
        >
          ‹›
        </div>
      </div>
    </AbsoluteFill>
  );
};

