import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./timeline";

export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const expoIn = Easing.bezier(0.7, 0, 0.84, 0);
export const inOut = Easing.bezier(0.83, 0, 0.17, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

export function tween(frame: number, start: number, dur: number, easing: (t: number) => number = expoOut) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

export function map(value: number, input: number[], output: number[], easing?: (t: number) => number) {
  return interpolate(value, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

export function pop(frame: number, delay = 0, config: { damping?: number; stiffness?: number; mass?: number } = {}) {
  return spring({
    frame: frame - delay,
    fps: FPS,
    config: { damping: config.damping ?? 12, stiffness: config.stiffness ?? 170, mass: config.mass ?? 0.8 },
  });
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
