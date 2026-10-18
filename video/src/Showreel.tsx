import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { C } from "./theme";
import { SCENES } from "./timeline";
import { Intro } from "./scenes/Intro";
import { AskOwl } from "./scenes/AskOwl";
import { Deck } from "./scenes/Deck";
import { Path } from "./scenes/Path";
import { Bento } from "./scenes/Bento";
import { Certificate } from "./scenes/Certificate";
import { Outro } from "./scenes/Outro";
import { Grain, Hud, Vignette } from "./components/Overlays";

const scene = (key: keyof typeof SCENES, node: React.ReactNode) => (
  <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].dur} name={key}>
    {node}
  </Sequence>
);

/** `grain: false` drops the per-frame film grain, which is costly to compress (see README). */
export const Showreel: React.FC<{ grain?: boolean }> = ({ grain = true }) => (
  <AbsoluteFill style={{ background: C.night }}>
    {scene("intro", <Intro />)}
    {scene("owl", <AskOwl />)}
    {scene("deck", <Deck />)}
    {scene("path", <Path />)}
    {scene("bento", <Bento />)}
    {scene("cert", <Certificate />)}
    {scene("outro", <Outro />)}
    <Vignette />
    {grain && <Grain />}
    <Hud />
    <Audio src={staticFile("soundtrack.wav")} />
  </AbsoluteFill>
);
