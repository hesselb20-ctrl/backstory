import React from "react";
import { AbsoluteFill } from "remotion";
import { CHAPTERS, ODD_TEXT } from "./story";
import { C, MONO, SANS, SERIF } from "./theme";
import { Code, Tag, Wordmark } from "./ui";

/** README banner, 1600x640: a line of code opening into a book of chapters. */
export const Hero: React.FC = () => {
  const pages = [
    { x: -222, y: 26, r: -9 },
    { x: 0, y: 0, r: 0 },
    { x: 222, y: 26, r: 9 },
  ];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 520px at 1175px 560px, ${C.amber}24, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 90, top: 160, width: 640 }}>
        <Wordmark size={128} />
        <div style={{ font: `500 50px/1.15 ${SERIF}`, color: C.paper, marginTop: 34, letterSpacing: "-0.01em" }}>Recover the why behind your code.</div>
        <div style={{ font: `400 30px/1.45 ${SANS}`, color: C.muted, marginTop: 26 }}>Git history, PRs, issues and comments, rebuilt into a decision log you can browse.</div>
      </div>
      <div style={{ position: "absolute", left: 1175, top: 70 }}>
        {pages.map((p, i) => {
          const ch = CHAPTERS[i]!;
          return (
            <div
              key={ch.title}
              style={{
                position: "absolute",
                left: p.x - 124,
                top: p.y,
                width: 248,
                height: 300,
                boxSizing: "border-box",
                background: C.paper,
                borderRadius: 12,
                padding: "28px 22px",
                transform: `rotate(${p.r}deg)`,
                transformOrigin: "50% 150%",
                boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
                color: "#1B1D28",
              }}
            >
              <div style={{ font: `600 19px/1 ${SANS}`, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A6408" }}>Chapter {i + 1}</div>
              <div style={{ font: `600 35px/1.1 ${SERIF}`, marginTop: 16, letterSpacing: "-0.01em" }}>{ch.title}</div>
              <div style={{ position: "absolute", left: 22, bottom: 26 }}>
                <span style={{ display: "inline-block", background: C.ink, borderRadius: 999, padding: "5px 5px" }}>
                  <Tag kind={ch.kind} size={21} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <svg width={1600} height={640} style={{ position: "absolute", inset: 0 }}>
        {[-165, 0, 165].map((dx) => (
          <path key={dx} d={`M 1175 508 Q ${1175 + dx * 0.5} 450, ${1175 + dx} 396`} fill="none" stroke={C.amber} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 775, width: 800, top: 508, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            font: `400 30px/1 ${MONO}`,
            color: C.paper,
            background: C.panel,
            border: `2px solid ${C.amber}`,
            borderRadius: 14,
            padding: "20px 28px",
            whiteSpace: "pre",
          }}
        >
          <Code text={ODD_TEXT} />
        </span>
      </div>
    </AbsoluteFill>
  );
};
