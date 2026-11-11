import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing, interpolate } from "remotion";

// One palette for the viewer (cli/viewer.ts), the README images and this video.
export const C = {
  ink: "#12131A",
  panel: "#1B1D28",
  raised: "#232636",
  line: "#2E3145",
  paper: "#F3EEE3",
  muted: "#A3A5B8",
  faint: "#6E7188",
  amber: "#F2B34C",
  teal: "#5CC8B8",
  red: "#EF6F6C",
  violet: "#A594FF",
  blue: "#6FA8FF",
  green: "#8FD18A",
} as const;

export const KIND = {
  revert: C.red,
  dependency: C.blue,
  refactor: C.violet,
  config: C.green,
  comment: C.amber,
  message: C.muted,
} as const;
export type Kind = keyof typeof KIND;

// The viewer's 12/14/16/20/25/31 scale (ratio 1.25), doubled for 1080p video.
export const T = { xs: 24, sm: 28, md: 32, lg: 40, xl: 50, xxl: 62, hero: 96, mega: 150 } as const;

const opts = { subsets: ["latin" as const], ignoreTooManyRequestsWarning: true };
export const SERIF = loadFraunces("normal", { weights: ["500", "600"], ...opts }).fontFamily;
export const SANS = loadInter("normal", { weights: ["400", "500", "600"], ...opts }).fontFamily;
export const MONO = loadMono("normal", { weights: ["400", "500"], ...opts }).fontFamily;

const OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** Eased 0..1 (or from..to) between two frames, clamped outside them. */
export const tw = (frame: number, start: number, end: number, from = 0, to = 1) =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

/** Number of characters of a string to show for a typing effect. */
export const typed = (text: string, frame: number, start: number, perFrame = 1.2) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * perFrame)));
