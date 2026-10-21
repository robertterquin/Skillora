import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const FPS = 30;
const SECONDS = 15;
const N = SR * SECONDS;
const L = new Float32Array(N);
const R = new Float32Array(N);

const S = { owl: 52, deck: 106, path: 178, bento: 252, cert: 330, outro: 390 };
const f2s = (frame) => frame / FPS;

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(t0, dur, fn, gain = 1, pan = 0) {
  const start = Math.max(0, Math.floor(t0 * SR));
  const end = Math.min(N, Math.floor((t0 + dur) * SR));
  const gl = gain * Math.min(1, 1 - pan);
  const gr = gain * Math.min(1, 1 + pan);
  for (let i = start; i < end; i++) {
    const v = fn((i - start) / SR);
    L[i] += v * gl;
    R[i] += v * gr;
  }
}

const kick = (t0, g = 1) => {
  let phase = 0;
  add(t0, 0.45, (t) => {
    const f = 45 + 110 * Math.exp(-t * 28);
    phase += (2 * Math.PI * f) / SR;
    return Math.sin(phase) * Math.exp(-t * 7) * (t < 0.003 ? t / 0.003 : 1);
  }, 0.9 * g);
};

const hat = (t0, g = 1, pan = 0) => {
  let prev = 0;
  add(t0, 0.06, (t) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * 70);
  }, 0.12 * g, pan);
};

const tick = (t0, freq = 2400, g = 1, pan = 0) =>
  add(t0, 0.05, (t) => Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 90), 0.25 * g, pan);

const pop = (t0, base = 520, g = 1, pan = 0) => {
  let phase = 0;
  add(t0, 0.18, (t) => {
    const f = base * (1 + 0.8 * (1 - Math.exp(-t * 40)));
    phase += (2 * Math.PI * f) / SR;
    return (Math.sin(phase) + 0.25 * Math.sin(phase * 2)) * Math.exp(-t * 22);
  }, 0.32 * g, pan);
};

const whoosh = (t0, dur, g = 1, panFrom = -0.6, panTo = 0.6) => {
  let lp = 0;
  let bp = 0;
  const start = Math.floor(t0 * SR);
  for (let i = 0; i < Math.floor((dur + 0.25) * SR) && start + i < N; i++) {
    const t = i / SR;
    const x = Math.min(1, t / dur);
    const env = t < dur ? Math.pow(x, 2.2) : Math.exp(-(t - dur) * 14);
    const cutoff = 0.02 + 0.25 * x;
    const n = rnd();
    lp += cutoff * (n - lp);
    bp += 0.5 * (lp - bp);
    const v = (lp - bp * 0.6) * env * 1.4 * g;
    const pan = panFrom + (panTo - panFrom) * x;
    if (start + i >= 0) {
      L[start + i] += v * (1 - Math.max(0, pan));
      R[start + i] += v * (1 + Math.min(0, pan));
    }
  }
};

const impact = (t0, g = 1) => {
  kick(t0, 1.3 * g);
  let phase = 0;
  add(t0, 1.4, (t) => {
    phase += (2 * Math.PI * 38) / SR;
    return Math.sin(phase) * Math.exp(-t * 2.6);
  }, 0.55 * g);
  let lp = 0;
  add(t0, 0.5, (t) => {
    lp += 0.15 * (rnd() - lp);
    return lp * Math.exp(-t * 9) * 3;
  }, 0.5 * g);
};

const chime = (t0, notes, g = 1) => {
  notes.forEach((freq, k) => {
    add(t0 + k * 0.045, 2.2, (t) => {
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 2.2);
      return (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2.01 * t) * Math.exp(-t * 6)) * env;
    }, 0.11 * g, (k - (notes.length - 1) / 2) * 0.35);
  });
};

const BEAT = 0.5;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const CHORDS = [
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [48, 55, 60, 64],
  [55, 59, 62, 67],
];
const bedStart = f2s(36);

for (let i = Math.floor(bedStart * SR); i < N; i++) {
  const t = i / SR;
  const tb = t - bedStart;
  const chord = CHORDS[Math.floor(tb / (BEAT * 4)) % CHORDS.length];
  const beatPos = (tb % BEAT) / BEAT;
  const duck = 0.45 + 0.55 * Math.min(1, beatPos * 3.2);
  const fadeIn = Math.min(1, tb / 0.8);
  const fadeOut = Math.min(1, (SECONDS - t) / 1.2);
  let v = 0;
  for (const m of chord) {
    const f = hz(m);
    for (let h = 1; h <= 4; h++) v += (Math.sin(2 * Math.PI * f * h * t * (1 + (h - 1) * 0.0007)) / h) * (h === 1 ? 1 : 0.5);
  }
  v *= 0.028 * duck * fadeIn * fadeOut;
  L[i] += v;
  R[i] += v * 0.96;
}

for (let k = 0; bedStart + k * BEAT / 2 < SECONDS - 0.4; k++) {
  const t0 = bedStart + (k * BEAT) / 2;
  const chord = CHORDS[Math.floor((t0 - bedStart) / (BEAT * 4)) % CHORDS.length];
  const f = hz(chord[0] - 24);
  add(t0, 0.24, (t) => {
    const s = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t);
    return Math.tanh(s * 1.6) * Math.exp(-t * 9) * Math.min(1, t / 0.005);
  }, k % 2 ? 0.13 : 0.18);
}

for (let k = 0; bedStart + k * BEAT < SECONDS - 0.6; k++) {
  const t0 = bedStart + k * BEAT;
  kick(t0, 0.75);
  hat(t0 + BEAT / 2, 1, 0.3);
  if (k % 2) hat(t0 + BEAT * 0.75, 0.6, -0.3);
}

whoosh(0, f2s(12), 0.6, -0.2, 0.2);
for (let k = 0; k < 6; k++) {
  tick(f2s(12 + k * 4), 1800 + k * 220, 1.4, k % 2 ? 0.5 : -0.5);
  kick(f2s(12 + k * 4), 0.35);
}
impact(f2s(36), 0.7);
whoosh(f2s(44), f2s(S.owl + 6 - 44), 0.7);
chime(f2s(S.owl + 20), [hz(81), hz(84), hz(88)], 0.8);
pop(f2s(S.owl + 9), 640, 1, 0.4);
pop(f2s(S.owl + 22), 480, 1, -0.2);
for (let k = 0; k < 12; k++) tick(f2s(S.owl + 29 + k), 3200 + (k % 3) * 300, 0.35, 0.3);
pop(f2s(S.owl + 39), 700, 0.9, 0.3);
whoosh(f2s(S.deck - 8), f2s(10), 1, 0.8, -0.8);
for (let k = 0; k < 3; k++) pop(f2s(S.deck + 8 + k * 2.5), 300 + k * 60, 0.6, (k - 1) * 0.5);
tick(f2s(S.deck + 44), 1400, 2.2, 0.2);
whoosh(f2s(S.deck + 50), f2s(S.path - S.deck - 50), 1.1, -0.1, 0.1);
for (let k = 0; k < 4; k++) pop(f2s(S.path + 30 + k * 8), 520 + k * 130, 1.1, 0.4);
chime(f2s(S.path + 56), [hz(76), hz(79), hz(83), hz(88)], 0.9);
whoosh(f2s(S.bento - 4), f2s(18), 0.9, -0.6, 0.6);
for (let k = 0; k < 5; k++) pop(f2s(S.bento + 19 + k * 3), 380 + k * 70, 0.55, (k - 2) * 0.3);
for (let k = 0; k < 6; k++) tick(f2s(S.bento + 41 + k * 2), 2600, 0.6, 0.6);
whoosh(f2s(S.cert - 8), f2s(14), 1, 0.7, -0.7);
whoosh(f2s(S.cert + 16), f2s(8), 0.8, 0, 0);
impact(f2s(S.cert + 24), 1.2);
tick(f2s(S.cert + 48), 1400, 2.2, 0.1);
chime(f2s(S.cert + 50), [hz(84), hz(91)], 0.7);
whoosh(f2s(S.cert + 56), f2s(S.outro + 6 - S.cert - 56), 1, -0.3, 0.3);
impact(f2s(S.outro + 6), 0.8);
chime(f2s(S.outro + 10), [hz(69), hz(72), hz(76), hz(81), hz(84)], 1.3);
pop(f2s(S.outro + 36), 900, 0.7, 0.4);

let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.2);
  R[i] = Math.tanh(R[i] * 1.2);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${out} (${SECONDS}s, peak normalised)`);
