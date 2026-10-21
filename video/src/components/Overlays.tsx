import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { CHAPTERS, DURATION, FPS, SCENES } from "../timeline";
import { map, tween } from "../motion";

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.32 }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(20,16,12,0.22) 100%)",
    }}
  />
);

const pad = (n: number) => String(n).padStart(2, "0");

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = tween(frame, 4, 16);
  const leave = 1 - tween(frame, SCENES.outro.from + 6, 12);
  const opacity = enter * leave;
  const chapter = [...CHAPTERS].reverse().find((c) => frame >= c.at);
  const chapterAge = chapter ? frame - chapter.at : 0;
  const timecode = `00:00:${pad(Math.floor(frame / FPS))}:${pad(frame % FPS)}`;
  const mark = (style: React.CSSProperties) => (
    <div style={{ position: "absolute", width: 26, height: 26, borderColor: "#fff", borderStyle: "solid", ...style }} />
  );
  const text: React.CSSProperties = {
    position: "absolute",
    fontFamily: FONT.mono,
    fontSize: 17,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#fff",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "difference", opacity }}>
      {mark({ left: 44, top: 44, borderWidth: "2px 0 0 2px" })}
      {mark({ right: 44, top: 44, borderWidth: "2px 2px 0 0" })}
      {mark({ left: 44, bottom: 44, borderWidth: "0 0 2px 2px" })}
      {mark({ right: 44, bottom: 44, borderWidth: "0 2px 2px 0" })}
      <div style={{ ...text, left: 84, top: 50 }}>Skillora — Showreel ’26</div>
      <div style={{ ...text, right: 84, top: 50, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: "#fff", marginRight: 12, opacity: frame % 30 < 18 ? 1 : 0.2 }} />
        {timecode}
      </div>
      {chapter && (
        <div
          style={{
            ...text,
            left: 84,
            bottom: 50,
            clipPath: `inset(0 ${100 - map(chapterAge, [0, 10], [0, 100]) }% 0 0)`,
          }}
        >
          {chapter.label}
        </div>
      )}
      <div style={{ position: "absolute", right: 84, bottom: 58, width: 420, height: 2, background: "rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${(frame / (DURATION - 1)) * 100}%`, height: "100%", background: "#fff" }} />
        {CHAPTERS.map((c) => (
          <div
            key={c.label}
            style={{
              position: "absolute",
              left: `${(c.at / DURATION) * 100}%`,
              top: -5,
              width: 2,
              height: 12,
              background: "#fff",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
