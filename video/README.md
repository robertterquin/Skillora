# Skillora showreel

A 15-second motion graphics reel (1920×1080 `Showreel` and 1080×1920 `ShowreelPortrait`) of Skillora, built with [Remotion](https://www.remotion.dev).
Everything is code: the scenes, the owl, and the soundtrack (synthesised by `scripts/make-sfx.mjs`, no samples).

```bash
npm install
npm run studio   # live preview and scrubbing
npm run sfx      # regenerate public/soundtrack.wav on its own (studio and render do it first)
npm run render   # writes out/skillora-showreel.mp4 and out/skillora-showreel-portrait.mp4
```

Scene timing lives in `src/timeline.ts`; `scripts/make-sfx.mjs` mirrors it, so update both together.
Both cuts share one timeline and soundtrack; scenes read `useLayout()` (`src/layout.ts`) for orientation-specific positions.
