import React from "react";
import { Composition, Still } from "remotion";
import { Hero } from "./Hero";
import { TOTAL, Tutorial } from "./Tutorial";

export const Root: React.FC = () => (
  <>
    <Composition id="Tutorial" component={Tutorial} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Still id="Hero" component={Hero} width={1600} height={640} />
  </>
);
