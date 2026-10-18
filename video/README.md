# Skillora showreel

A 15-second motion graphics reel (1920×1080 `Showreel` and 1080×1920 `ShowreelPortrait`) of Skillora, built with [Remotion](https://www.remotion.dev).
Everything is code: the scenes, the owl, and the soundtrack (synthesised by `scripts/make-sfx.mjs`, no samples).

```bash
npm install
npm run studio   # live preview and scrubbing
npm run sfx      # regenerate public/soundtrack.wav on its own (studio and render do it first)
npm run render        # master files: out/skillora-showreel-landscape-v1-original.mp4 and out/skillora-showreel-portrait-v1-original.mp4
npm run render:share  # lighter *-v2-phone.mp4 files for Messenger, WhatsApp and phones
```

Scene timing lives in `src/timeline.ts`; `scripts/make-sfx.mjs` mirrors it, so update both together.
Both cuts share one timeline and soundtrack; scenes read `useLayout()` (`src/layout.ts`) for orientation-specific positions.

The v2-phone files drop the animated film grain (more than half the masters' ~8.5 Mbps, because every frame's noise
is new), cap the video at 5 Mbps and tag it as BT.709. They come out at about 2.5 Mbps and 5 MB, with no frame
larger than ~57 KB, so phones and messaging apps can stream and re-encode them without stalling.
