export const FPS = 30;
export const DURATION = 450;

export const SCENES = {
  intro: { from: 0, dur: 64 },
  owl: { from: 52, dur: 62 },
  deck: { from: 106, dur: 80 },
  path: { from: 178, dur: 92 },
  bento: { from: 252, dur: 90 },
  cert: { from: 330, dur: 68 },
  outro: { from: 390, dur: 60 },
} as const;

export const CHAPTERS = [
  { at: SCENES.owl.from, label: "01 — Ask" },
  { at: SCENES.deck.from, label: "02 — Pick" },
  { at: SCENES.path.from, label: "03 — Practise" },
  { at: SCENES.bento.from + 17, label: "04 — Keep going" },
  { at: SCENES.cert.from, label: "05 — Prove it" },
];

export const CUBE = { from: SCENES.cert.from, dur: 12 };
