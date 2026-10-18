import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { backOut, expoIn, expoOut, inOut, map, tween } from "../motion";
import { RiseText } from "../components/Kinetic";

const FLASHES = [
  { word: "Guitar", tag: "Music", bg: C.vermilion },
  { word: "Cyrillic", tag: "Languages", bg: C.languages },
  { word: "Espresso", tag: "Crafts & life", bg: C.life },
  { word: "Touch typing", tag: "Tech", bg: C.tech },
  { word: "Sourdough", tag: "Crafts & life", bg: C.music },
  { word: "Juggling", tag: "Crafts & life", bg: C.emerald },
];
const FLASH_START = 12;
const FLASH_LEN = 4;
const TITLE_AT = FLASH_START + FLASHES.length * FLASH_LEN; // 36

/** Cold open: a line becomes a strobe of skills, which resolves into "Master anything." */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // 0–12: a vermilion hairline stretches across the dark frame, then opens to fill it.
  const lineW = tween(frame, 1, 8, inOut);
  const lineH = tween(frame, 8, 5, expoIn);

  const flashIndex = Math.floor((frame - FLASH_START) / FLASH_LEN);
  const flash = frame >= FLASH_START && frame < TITLE_AT ? FLASHES[flashIndex] : null;
  const flashAge = (frame - FLASH_START) % FLASH_LEN;

  // Title: the full stop grows into a vermilion iris that hands over to the owl scene.
  const dot = tween(frame, TITLE_AT + 6, 8, backOut);
  const dotGrow = tween(frame, TITLE_AT + 10, 10, expoIn);
  const camera = map(frame, [TITLE_AT, 64], [1.06, 1]);

  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      {frame < FLASH_START + 1 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: `${lineW * 100}%`,
              height: 6 + lineH * 1080,
              background: C.vermilion,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 540 + 28,
              fontFamily: FONT.mono,
              fontSize: 18,
              letterSpacing: "0.3em",
              color: C.vermilionSoft,
              opacity: map(frame, [2, 5], [0, 1]) * (1 - lineH),
            }}
          >
            SKILLORA · 2026
          </div>
        </AbsoluteFill>
      )}

      {flash && (
        <AbsoluteFill style={{ background: flash.bg, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontSize: 330,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-0.02em",
              transform: `scale(${map(flashAge, [0, FLASH_LEN], [1.14, 1])}) translateX(${(flashIndex % 2 ? -1 : 1) * map(flashAge, [0, FLASH_LEN], [30, 0])}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {flash.word}
          </div>
          <div
            style={{
              position: "absolute",
              left: 84,
              top: 470,
              fontFamily: FONT.mono,
              fontSize: 22,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
            }}
          >
            {String(flashIndex + 1).padStart(2, "0")} / {flash.tag}
          </div>
          <div
            style={{
              position: "absolute",
              right: 84,
              bottom: 470,
              fontFamily: FONT.mono,
              fontSize: 22,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            ✦
          </div>
        </AbsoluteFill>
      )}

      {frame >= TITLE_AT && (
        <AbsoluteFill style={{ background: C.canvas, alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${camera})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 22,
                letterSpacing: "0.3em",
                color: C.muted,
                marginBottom: 34,
                opacity: tween(frame, TITLE_AT + 2, 8),
              }}
            >
              <RiseText text="LEARN ONE STEP AT A TIME" frame={frame} delay={TITLE_AT + 2} stagger={0.35} dur={10} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
              <RiseText
                text="Master"
                frame={frame}
                delay={TITLE_AT}
                stagger={1}
                style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 210, letterSpacing: "-0.05em", color: C.ink }}
              />
              <span style={{ width: 46 }} />
              <RiseText
                text="anything"
                frame={frame}
                delay={TITLE_AT + 3}
                stagger={0.9}
                style={{
                  fontFamily: FONT.serif,
                  fontStyle: "italic",
                  fontSize: 236,
                  letterSpacing: "-0.02em",
                  color: C.vermilion,
                }}
              />
              <span
                style={{
                  display: "inline-block",
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  background: C.vermilion,
                  marginLeft: 10,
                  transform: `scale(${dot * (1 + dotGrow * 130)})`,
                }}
              />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Speed lines between flashes. */}
      {flash && flashAge < 2 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {[0.18, 0.42, 0.66, 0.84].map((y, i) => (
            <div
              key={y}
              style={{
                position: "absolute",
                top: `${y * 100}%`,
                left: (i % 2 ? -1 : 1) * map(flashAge, [0, 2], [0, 600], expoOut) + (i % 2 ? 1200 : 0),
                width: 700,
                height: 3,
                background: "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
