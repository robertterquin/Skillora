import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, DECK, FONT } from "../theme";
import { expoIn, expoOut, inOut, map, pop, tween } from "../motion";
import { Owl } from "../components/Owl";
import { CheckDraw, CupPaths, LinkIcon } from "../components/Icons";
import { Eyebrow } from "../components/Kinetic";
import { Cursor } from "../components/Cursor";
import { cubeFace } from "../components/cube";
import { CUBE, SCENES } from "../timeline";

const STAMP_AT = 24;
const CARD_W = 1180;
const CARD_H = 640;
const CARD_Y = 530; // card centre on screen
export const SEAL = { x: 1290, y: 580 }; // seal centre on screen

/** The certificate lands, gets stamped, and is shared. */
export const Certificate: React.FC = () => {
  const frame = useCurrentFrame();
  const cube = tween(SCENES.cert.from + frame, CUBE.from, CUBE.dur, inOut);

  const impact = frame - STAMP_AT;
  const shakeAmt = impact >= 0 ? Math.exp(-impact / 4) * 16 : 0;
  const shake = { x: Math.sin(frame * 2.9) * shakeAmt, y: Math.cos(frame * 3.7) * shakeAmt };
  const float = { x: Math.sin(frame / 14) * 3, y: Math.cos(frame / 18) * 4 };

  const drop = tween(frame, STAMP_AT - 6, 6, expoIn);
  const seal = frame < STAMP_AT ? drop : 1;
  const sealScale = frame < STAMP_AT ? 3.2 - drop * 2.2 : 1 + Math.exp(-impact / 3) * 0.08 * Math.cos(impact * 1.4);

  const name = tween(frame, 8, 14, inOut);
  const shareIn = pop(frame, 34, { damping: 12 });
  const CLICK = 48;
  const copied = tween(frame, CLICK + 2, 5);
  // Push into the seal; the outro opens out of it.
  const out = tween(frame, 53, 15, expoIn);

  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      <AbsoluteFill style={{ ...cubeFace(cube, "in"), background: C.night, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${1 + out * 2.2})`, transformOrigin: `${SEAL.x}px ${SEAL.y}px` }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 55%, rgba(180,66,15,${0.32 + (impact >= 0 ? Math.exp(-impact / 6) * 0.3 : 0)}) 0%, rgba(21,20,19,0) 60%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: "repeating-conic-gradient(from 0deg at 50% 55%, rgba(255,255,255,0.035) 0deg 6deg, transparent 6deg 18deg)",
            transform: `rotate(${frame * 0.4}deg) scale(1.6)`,
          }}
        />

        <Eyebrow color="rgba(255,255,255,0.6)" style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: tween(frame, 6, 10) }}>
          Finish the steps · pass the assessment
        </Eyebrow>

        <div
          style={{
            position: "absolute",
            left: 960 - CARD_W / 2 + shake.x,
            top: CARD_Y - CARD_H / 2 + shake.y,
            width: CARD_W,
            height: CARD_H,
            transform: `perspective(1800px) rotateX(${float.y * 0.6}deg) rotateY(${float.x}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              background: C.paper,
              boxShadow: "0 60px 120px rgba(0,0,0,0.5)",
              padding: 22,
            }}
          >
            <div style={{ position: "absolute", inset: 22, border: `2px solid ${C.ink}`, borderRadius: 8 }} />
            <div style={{ position: "absolute", inset: 32, border: `1px solid ${C.border}`, borderRadius: 4 }} />
            <Rosette frame={frame} x={CARD_W - 170} y={150} />

            <div style={{ position: "absolute", left: 80, top: 70, display: "flex", alignItems: "center", gap: 14 }}>
              <Owl size={54} />
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em", color: C.ink }}>Skillora</span>
            </div>
            <div style={{ position: "absolute", right: 80, bottom: 78, fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.16em", color: C.muted }}>
              Nº 0042
            </div>

            <div style={{ position: "absolute", left: 80, right: 80, top: 190 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: "0.22em", color: C.vermilion }}>CERTIFICATE OF COMPLETION</div>
              <div
                style={{
                  marginTop: 18,
                  fontFamily: FONT.sans,
                  fontWeight: 800,
                  fontSize: 76,
                  letterSpacing: "-0.04em",
                  color: C.ink,
                  clipPath: `inset(-20px ${(1 - name) * 100}% -20px 0)`,
                  whiteSpace: "nowrap",
                }}
              >
                Robert Terquin Laqui
              </div>
              <div style={{ marginTop: 12, height: 2, width: `${name * 100}%`, background: C.ink, opacity: 0.2 }} />
              <div style={{ marginTop: 22, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 50, color: C.ink2, opacity: tween(frame, 14, 10) }}>
                Dialing In Specialty Espresso Extraction
              </div>
            </div>

            <div style={{ position: "absolute", left: 80, bottom: 70, display: "flex", gap: 48, opacity: tween(frame, 18, 10) }}>
              {[
                ["Assessment", "92%"],
                ["Practice", "45 min"],
                ["Issued", "Oct 18, 2026"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ marginTop: 4, fontFamily: FONT.sans, fontWeight: 700, fontSize: 28, color: C.ink }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ink burst and confetti from the seal. */}
        {impact >= 0 && (
          <>
            {[0, 4].map((d) => {
              const p = tween(impact, d, 18, expoOut);
              return (
                <div
                  key={d}
                  style={{
                    position: "absolute",
                    left: SEAL.x + shake.x - 130,
                    top: SEAL.y + shake.y - 130,
                    width: 260,
                    height: 260,
                    borderRadius: "50%",
                    border: `${6 - d}px solid ${C.vermilionSoft}`,
                    transform: `scale(${1 + p * 1.6})`,
                    opacity: impact < d ? 0 : 1 - p,
                  }}
                />
              );
            })}
            {Array.from({ length: 56 }).map((_, k) => {
              const a = random(`a${k}`) * Math.PI * 2;
              const v = 14 + random(`v${k}`) * 30;
              const t = impact;
              const x = SEAL.x + Math.cos(a) * v * t * 0.9;
              const y = SEAL.y + Math.sin(a) * v * t * 0.9 - 6 * t + 0.9 * t * t;
              const size = 10 + random(`s${k}`) * 16;
              const round = k % 3 === 0;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: size,
                    height: round ? size : size * 0.45,
                    borderRadius: round ? size : 2,
                    background: [...DECK, C.amberSoft, "#fff"][k % 8],
                    transform: `rotate(${random(`r${k}`) * 360 + t * (random(`w${k}`) - 0.5) * 50}deg)`,
                    opacity: map(t, [18, 32], [1, 0]),
                  }}
                />
              );
            })}
          </>
        )}

        {/* Seal */}
        <div
          style={{
            position: "absolute",
            left: SEAL.x - 120 + shake.x,
            top: SEAL.y - 120 + shake.y,
            width: 240,
            height: 240,
            opacity: seal,
            transform: `scale(${sealScale}) rotate(${frame < STAMP_AT ? -50 + drop * 38 : -12}deg)`,
            filter: frame < STAMP_AT ? `drop-shadow(0 ${60 * (1 - drop)}px 40px rgba(0,0,0,0.45))` : "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
          }}
        >
          <Seal frame={frame} />
        </div>

        {/* Share */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 940,
            transform: `translate(-50%, -50%) scale(${shareIn * (frame >= CLICK && frame < CLICK + 4 ? 0.94 : 1)})`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 32px",
            borderRadius: 999,
            background: copied > 0.5 ? C.emerald : "#fff",
            color: copied > 0.5 ? "#fff" : C.ink,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 26,
            whiteSpace: "nowrap",
          }}
        >
          {copied > 0.5 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, transform: `translateY(${(1 - copied) * 14}px)` }}>
              <CheckDraw size={26} progress={copied} color="#fff" /> Link copied
            </span>
          ) : (
            <>
              <LinkIcon size={24} color={C.ink} /> Share certificate
            </>
          )}
        </div>
        <Cursor frame={frame} from={{ x: 1500, y: 1120 }} to={{ x: 1040, y: 934 }} moveAt={36} moveDur={11} clickAt={CLICK} hideAt={58} color={C.ink} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Seal: React.FC<{ frame: number }> = ({ frame }) => {
  const text = "SKILL COMPLETE · SKILL COMPLETE · ";
  return (
    <svg width={240} height={240} viewBox="0 0 240 240">
      <defs>
        <path id="seal-text" d="M120,120 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
      </defs>
      <g>
        {Array.from({ length: 36 }).map((_, k) => {
          const a = (k / 36) * Math.PI * 2;
          return <circle key={k} cx={120 + Math.cos(a) * 112} cy={120 + Math.sin(a) * 112} r={9} fill={C.vermilion} />;
        })}
      </g>
      <circle cx={120} cy={120} r={112} fill={C.vermilion} />
      <circle cx={120} cy={120} r={100} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
      <circle cx={120} cy={120} r={66} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
      <g transform={`rotate(${frame * 1.5} 120 120)`}>
        <text fill="#fff" fontFamily={FONT.mono} fontSize={17} letterSpacing={4.2} fontWeight={600}>
          <textPath href="#seal-text">{text}</textPath>
        </text>
      </g>
      <svg x={84} y={84} width={72} height={72} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <CupPaths />
      </svg>
    </svg>
  );
};

/** Guilloché rosette that draws itself on. */
const Rosette: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => {
  const p = tween(frame, 6, 26, inOut);
  const pts: string[] = [];
  for (let k = 0; k <= 720; k++) {
    const t = (k / 720) * Math.PI * 2;
    const r = 70 + 22 * Math.cos(9 * t);
    pts.push(`${(x + Math.cos(t) * r).toFixed(1)},${(y + Math.sin(t) * r).toFixed(1)}`);
  }
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={C.vermilion}
        strokeOpacity={0.35}
        strokeWidth={1.4}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
        transform={`rotate(${frame * 0.6} ${x} ${y})`}
      />
      <circle cx={x} cy={y} r={44} fill="none" stroke={C.vermilion} strokeOpacity={0.25 * p} strokeWidth={1.2} />
    </svg>
  );
};
