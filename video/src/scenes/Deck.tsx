import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { expoIn, expoOut, inOut, lerp, map, pop, tween } from "../motion";
import { ClockIcon, PlayIcon } from "../components/Icons";
import { RiseText } from "../components/Kinetic";
import { DotGrid } from "./AskOwl";
import { Cursor } from "../components/Cursor";

const CARDS = [
  { label: "Tech", title: "Solve the 3x3 Rubik's Cube", time: "45 mins/day · 4 days", bg: C.tech },
  { label: "Languages", title: "Read the Cyrillic Alphabet in One Afternoon", time: "2 hours total", bg: C.languages },
  { label: "Crafts & life", title: "Dialing In Specialty Espresso Extraction", time: "45 minutes practice", bg: C.life },
  { label: "Music", title: "Fingerstyle Acoustic Guitar Basics", time: "20 mins/day · 3 weeks", bg: C.music },
  { label: "Tech", title: "Touch Typing at 80+ Words Per Minute", time: "15 mins/day · 4 weeks", bg: C.tech },
];
export const PICKED = 2;
const W = 320;
const H = 450;
const CLICK_AT = 44;
const ZOOM_AT = 54;

/** The fan of skill cards from the landing page; the espresso card is picked and zooms to fill the frame. */
export const Deck: React.FC = () => {
  const frame = useCurrentFrame();
  const push = tween(frame, 0, 12, expoOut);
  const spread = tween(frame, 30, 12, inOut);
  const scatter = tween(frame, CLICK_AT + 2, 12, expoIn);
  const zoom = tween(frame, ZOOM_AT, 18, inOut);
  const mid = (CARDS.length - 1) / 2;

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${(1 - push) * 1920}px)`,
        background: C.canvas,
        boxShadow: "-60px 0 120px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}
    >
      <DotGrid color="rgba(26,25,23,0.08)" drift={-frame * 0.8} />

      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          transform: `translateY(${-scatter * 260}px)`,
          opacity: 1 - scatter,
        }}
      >
        <RiseText
          text="Pick a"
          frame={frame}
          delay={3}
          stagger={1}
          style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.045em", color: C.ink }}
        />
        <span style={{ display: "inline-block", width: 28 }} />
        <RiseText
          text="path."
          frame={frame}
          delay={7}
          stagger={1}
          style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 136, color: C.vermilion }}
        />
      </div>

      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, perspective: 2200 }}>
        {CARDS.map((card, i) => {
          const t = (i - mid) / mid;
          const enter = pop(frame, 1 + Math.abs(i - mid) * 2.5, { damping: 15, stiffness: 140 });
          const gap = lerp(250, 290, spread);
          const picked = i === PICKED;
          const hover = picked ? spread : 0;

          let x = 960 + (i - mid) * gap - W / 2;
          let y = 600 - H / 2 + t * t * 34 - hover * 46;
          let rot = t * 12 * (1 - hover);
          let scale = 1 + hover * 0.08;
          let opacity = 1;
          let radius = 28;

          // Fly in from below with a 3D tumble.
          const r = random(`card-${i}`) - 0.5;
          y += (1 - enter) * 900;
          rot += (1 - enter) * r * 70;
          const tilt = (1 - enter) * 55;

          if (!picked) {
            const dir = i < PICKED ? -1 : 1;
            x += dir * scatter * (900 + Math.abs(i - PICKED) * 260);
            y += scatter * 120;
            rot += dir * scatter * 40;
            opacity = 1 - scatter * 0.6;
          } else {
            // Grow to cover the whole frame.
            const z = zoom;
            const cover = 1920 / W + 0.2;
            x = lerp(x, 960 - W / 2, Math.min(1, z * 1.6));
            y = lerp(y, 540 - H / 2, Math.min(1, z * 1.6));
            rot = lerp(rot, 0, Math.min(1, z * 2));
            scale = lerp(scale, cover, z);
            radius = lerp(28, 0, z);
          }

          const contentFade = picked ? 1 - tween(frame, ZOOM_AT, 6) : 1;

          return (
            <div
              key={card.title}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: W,
                height: H,
                transform: `rotateX(${tilt}deg) rotate(${rot}deg) scale(${scale})`,
                transformOrigin: picked && zoom > 0 ? "center center" : "center bottom",
                zIndex: picked ? 20 : 10 - Math.abs(i - PICKED),
                opacity,
                borderRadius: radius,
                background: card.bg,
                border: "1.5px solid rgba(255,255,255,0.16)",
                boxShadow: `0 ${30 + hover * 30}px ${60 + hover * 40}px rgba(26,25,23,${0.22 + hover * 0.15})`,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "#fff",
              }}
            >
              <div style={{ opacity: contentFade, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 15,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.15)",
                  }}
                >
                  {card.label}
                </span>
                <PlayIcon size={22} color="rgba(255,255,255,0.75)" />
              </div>
              <div style={{ opacity: contentFade }}>
                <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 40, lineHeight: 1.08 }}>{card.title}</div>
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: FONT.mono,
                    fontSize: 16,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  <ClockIcon size={18} color="rgba(255,255,255,0.8)" />
                  {card.time}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: "1.5px solid rgba(255,255,255,0.2)",
                    fontFamily: FONT.mono,
                    fontSize: 15,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  4 STEPS
                </div>
              </div>
              {picked && (
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: radius + 10,
                    border: `4px solid ${C.vermilion}`,
                    opacity: map(frame, [CLICK_AT, CLICK_AT + 2, ZOOM_AT, ZOOM_AT + 4], [0, 1, 1, 0]),
                    transform: `scale(${1 + tween(frame, CLICK_AT, 10, expoOut) * 0.04})`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <Cursor
        frame={frame}
        from={{ x: 1500, y: 1020 }}
        to={{ x: 1000, y: 430 }}
        moveAt={30}
        moveDur={13}
        clickAt={CLICK_AT}
        hideAt={ZOOM_AT}
      />
    </AbsoluteFill>
  );
};
