import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, KIND, type Kind, MONO, SANS, SERIF, T, tw } from "./theme";

/** A scene that fades in and out on the shared ink background. */
export const Scene: React.FC<{ children: React.ReactNode; caption?: string }> = ({ children, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = Math.min(tw(frame, 0, 12), tw(frame, durationInFrames - 12, durationInFrames, 1, 0));
  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
      {caption ? <Caption text={caption} /> : null}
    </AbsoluteFill>
  );
};

export const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 54,
        textAlign: "center",
        font: `500 ${T.lg}px/1.3 ${SANS}`,
        color: C.paper,
        opacity: tw(frame, 14, 34),
        transform: `translateY(${tw(frame, 14, 34, 14, 0)}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <span style={{ font: `600 ${size}px/1 ${SERIF}`, letterSpacing: "-0.015em", color: C.paper }}>
    back<span style={{ color: C.amber }}>story</span>
  </span>
);

export const Tag: React.FC<{ kind: Kind; size?: number }> = ({ kind, size = T.xs }) => (
  <span
    style={{
      font: `500 ${size}px/1 ${SANS}`,
      color: KIND[kind],
      background: `${KIND[kind]}29`,
      padding: `${size * 0.3}px ${size * 0.6}px`,
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}
  >
    {kind}
  </span>
);

export const Window: React.FC<{ title: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ title, style, children }) => (
  <div
    style={{
      background: C.panel,
      border: `2px solid ${C.line}`,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: `2px solid ${C.line}` }}>
      {[C.red, C.amber, C.green].map((c) => (
        <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.7 }} />
      ))}
      <span style={{ marginLeft: 14, font: `400 ${T.xs}px ${MONO}`, color: C.muted }}>{title}</span>
    </div>
    {children}
  </div>
);

const TOKEN = /(\/\/.*$)|\b(export|async|function|for|let|try|return|await|catch|if|throw|const|new)\b|\b(\d+)\b|([A-Za-z_]\w*)(?=\()/gm;

/** Minimal syntax colouring for the few lines of TypeScript on screen. */
export const Code: React.FC<{ text: string }> = ({ text }) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const color = m[1] ? C.green : m[2] ? C.violet : m[3] ? C.amber : C.blue;
    parts.push(
      <span key={m.index} style={{ color }}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
};

export const Confidence: React.FC<{ level: 1 | 2 | 3; size?: number }> = ({ level, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: size * 0.4, alignItems: "center" }}>
    {[1, 2, 3].map((i) => (
      <span key={i} style={{ width: size, height: size, borderRadius: size, background: i <= level ? C.amber : C.line }} />
    ))}
  </span>
);

export const Cursor: React.FC<{ x: number; y: number; down?: boolean }> = ({ x, y, down }) => (
  <svg width={44} height={44} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, transform: `scale(${down ? 0.86 : 1})`, transformOrigin: "top left" }}>
    <path d="M4 2 L4 19 L8.5 15 L11.5 21.5 L14 20.4 L11 14 L17 14 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.faint, style }) => (
  <div style={{ font: `600 ${T.xs}px/1 ${SANS}`, letterSpacing: "0.12em", textTransform: "uppercase", color, ...style }}>{children}</div>
);
