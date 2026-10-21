import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

const geist = loadGeist("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"] });
const mono = loadGeistMono("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const serif = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });

export const FONT = {
  sans: geist.fontFamily,
  mono: mono.fontFamily,
  serif: serif.fontFamily,
};

export const C = {
  canvas: "#F7F5F0",
  paper: "#FAF8F4",
  paperWarm: "#F1EDE4",
  paperDeep: "#E8E4DA",
  border: "#E2DDD4",
  ink: "#1A1917",
  ink2: "#4A4640",
  muted: "#625D55",
  night: "#151413",
  nightCard: "#1F1E1C",
  vermilion: "#B4420F",
  vermilionSoft: "#E8875C",
  vermilionLight: "#FBF2ED",
  emerald: "#2D5A43",
  emeraldSoft: "#7DC49A",
  emeraldLight: "#EBF2EE",
  amber: "#7A6129",
  amberSoft: "#D9B266",
  music: "#8C4A28",
  languages: "#1E3A8A",
  life: "#2E2C29",
  tech: "#1F4E4A",
  owl: "#0F172A",
  cobalt: "#2563EB",
  cobaltDeep: "#1D4ED8",
};

export const DECK = [C.music, C.languages, C.vermilion, C.tech, C.life, C.emerald];
