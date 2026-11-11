import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ADR, CHAPTERS, CODE, FILE, FIRST_LINE, INSTALL, ODD_LINE, ODD_TEXT, REPO_URL, TIMELINE } from "./story";
import { C, KIND, MONO, SANS, SERIF, T, tw, typed } from "./theme";
import { Code, Confidence, Cursor, Label, Scene, Tag, Window, Wordmark } from "./ui";

// Scene lengths in frames at 30 fps. Total 2250 = 75 s.
export const SCENES = { code: 390, chapters: 540, cards: 360, viewer: 360, agent: 360, install: 240 } as const;
export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0);

const INK_ON_PAPER = "#1B1D28";
const AMBER_ON_PAPER = "#9A6408";

/** A caption that lives between two frames of its scene. */
const Cap: React.FC<{ text: string; from?: number; to?: number }> = ({ text, from = 14, to = 100000 }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(tw(frame, from, from + 18), tw(frame, to - 12, to, 1, 0));
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
        opacity,
        transform: `translateY(${tw(frame, from, from + 18, 14, 0)}px)`,
      }}
    >
      {text}
    </div>
  );
};

const OddLine: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = T.md, style }) => (
  <div
    style={{
      display: "inline-block",
      font: `400 ${size}px/1 ${MONO}`,
      color: C.paper,
      background: C.panel,
      border: `2px solid ${C.amber}`,
      borderRadius: 14,
      padding: `${size * 0.55}px ${size * 0.8}px`,
      whiteSpace: "pre",
      ...style,
    }}
  >
    <Code text={ODD_TEXT} />
  </div>
);

// 1 + 2. A confusing line of code, and the question it raises.
const CodeScene: React.FC = () => {
  const f = useCurrentFrame();
  const lineH = 60;
  const dim = tw(f, 100, 130, 1, 0.32);
  return (
    <Scene>
      <Window title={FILE} style={{ position: "absolute", left: 260, top: tw(f, 205, 240, 110, 70), width: 1400, opacity: tw(f, 0, 18), transform: `scale(${tw(f, 0, 22, 0.97, 1)})` }}>
        <div style={{ padding: "26px 0 30px", font: `400 ${T.md}px/${lineH}px ${MONO}`, color: C.paper }}>
          {CODE.map((line, i) => {
            const odd = i === ODD_LINE;
            const shown = tw(f, 8 + i * 5, 22 + i * 5);
            return (
              <div key={i} style={{ position: "relative", display: "flex", height: lineH, opacity: shown * (odd ? 1 : dim) }}>
                {odd ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${tw(f, 90, 118) * 100}%`,
                      background: `${C.amber}26`,
                      borderLeft: `6px solid ${C.amber}`,
                    }}
                  />
                ) : null}
                <span style={{ width: 110, textAlign: "right", paddingRight: 30, color: odd && f > 100 ? C.amber : C.faint, flexShrink: 0 }}>{FIRST_LINE + i}</span>
                <span style={{ whiteSpace: "pre", position: "relative" }}>
                  <Code text={line} />
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 470,
            top: 62 + 26 + (ODD_LINE + 1) * lineH + 10,
            opacity: tw(f, 228, 246),
            transform: `translateY(${tw(f, 228, 246, -10, 0)}px)`,
            background: C.raised,
            border: `2px solid ${C.line}`,
            borderRadius: 12,
            padding: "14px 22px",
            font: `400 ${T.sm}px/1 ${MONO}`,
            whiteSpace: "nowrap",
            color: C.muted,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ color: C.teal }}>git blame</span>
          {"  "}a41c9e2 · 3 years ago · <span style={{ color: C.paper }}>"fix stuff"</span>
        </div>
      </Window>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 806,
          textAlign: "center",
          font: `600 ${T.hero}px/1 ${SERIF}`,
          letterSpacing: "-0.02em",
          color: C.amber,
          opacity: tw(f, 268, 292),
          transform: `translateY(${tw(f, 268, 296, 30, 0)}px)`,
        }}
      >
        Why is this here?
      </div>
      <Cap text="Every codebase has a line like this." from={30} to={200} />
    </Scene>
  );
};

// 3. The history of that line, unfolding as chapters.
const ChaptersScene: React.FC = () => {
  const f = useCurrentFrame();
  const pageW = 508;
  const gap = 48;
  const left = (1920 - (pageW * 3 + gap * 2)) / 2;
  return (
    <Scene caption="Backstory reads the history like a story: commits, PRs, issues, reverts, comments.">
      <div style={{ position: "absolute", left: 0, right: 0, top: tw(f, 0, 30, 300, 62), textAlign: "center", opacity: tw(f, 0, 14) }}>
        <OddLine />
      </div>
      <div style={{ position: "absolute", left: 958, top: 150, width: 4, height: tw(f, 26, 44) * 60, background: C.amber }} />
      <div style={{ position: "absolute", left: 960 - tw(f, 38, 80) * (960 - left - 40), top: 208, width: tw(f, 38, 80) * 2 * (960 - left - 40), height: 4, background: C.amber, borderRadius: 2 }} />
      <div style={{ position: "absolute", left, top: 250, display: "flex", gap, perspective: 2200 }}>
        {CHAPTERS.map((ch, i) => {
          const s = 56 + i * 150;
          return (
            <div
              key={ch.title}
              style={{
                width: pageW,
                height: 590,
                background: C.paper,
                borderRadius: 14,
                padding: "40px 40px",
                color: INK_ON_PAPER,
                opacity: tw(f, s, s + 12),
                transform: `rotateY(${tw(f, s, s + 36, -78, 0)}deg)`,
                transformOrigin: "left center",
                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", left: pageW / 2 - 2, top: -42, width: 4, height: 42, background: C.amber, opacity: tw(f, s + 20, s + 34) }} />
              <Label color={AMBER_ON_PAPER}>{ch.number}</Label>
              <div style={{ font: `600 56px/1.1 ${SERIF}`, letterSpacing: "-0.015em", marginTop: 18, whiteSpace: "nowrap" }}>{ch.title}</div>
              <div style={{ font: `400 ${T.xs}px/1 ${MONO}`, color: "#6B6658", marginTop: 16 }}>{ch.date}</div>
              <div
                style={{
                  marginTop: 34,
                  background: C.ink,
                  borderRadius: 12,
                  padding: "22px 24px",
                  opacity: tw(f, s + 34, s + 50),
                  transform: `translateY(${tw(f, s + 34, s + 54, 16, 0)}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Tag kind={ch.kind} />
                  <span style={{ font: `500 ${T.xs}px/1 ${MONO}`, color: C.teal }}>{ch.ref}</span>
                </div>
                <div style={{ font: `400 ${T.xs}px/1.4 ${MONO}`, color: C.paper, marginTop: 16 }}>{ch.quote}</div>
              </div>
              <div style={{ font: `400 ${T.md}px/1.4 ${SANS}`, marginTop: 30, opacity: tw(f, s + 58, s + 78) }}>{ch.text}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const Section: React.FC<{ at: number; label: string; children: React.ReactNode }> = ({ at, label, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ marginTop: 26, opacity: tw(f, at, at + 18), transform: `translateY(${tw(f, at, at + 22, 14, 0)}px)` }}>
      <Label>{label}</Label>
      <div style={{ font: `400 ${T.sm}px/1.45 ${SANS}`, color: C.paper, marginTop: 10 }}>{children}</div>
    </div>
  );
};

// 4. Signals become a decision card.
const CardsScene: React.FC = () => {
  const f = useCurrentFrame();
  const chipY = [240, 380, 520];
  const cardX = 770;
  return (
    <Scene caption="Signals are grouped into decisions. Claude writes each one up, evidence linked.">
      <Label style={{ position: "absolute", left: 100, top: 180, opacity: tw(f, 0, 14) }}>Signals</Label>
      {CHAPTERS.map((ch, i) => (
        <div
          key={ch.title}
          style={{
            position: "absolute",
            left: 100,
            top: chipY[i],
            width: 570,
            height: 112,
            boxSizing: "border-box",
            background: C.panel,
            border: `2px solid ${KIND[ch.kind]}`,
            borderRadius: 14,
            padding: "18px 22px",
            opacity: tw(f, 4 + i * 10, 20 + i * 10),
            transform: `translateX(${tw(f, 4 + i * 10, 26 + i * 10, -40, 0)}px)`,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Tag kind={ch.kind} />
            <span style={{ font: `500 ${T.xs}px/1 ${MONO}`, color: C.teal }}>{ch.ref}</span>
          </div>
          <div style={{ font: `400 ${T.xs}px/1 ${MONO}`, color: C.paper, marginTop: 16, whiteSpace: "nowrap", overflow: "hidden" }}>{ch.quote}</div>
        </div>
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {chipY.map((y, i) => {
          const len = 220;
          return (
            <path
              key={y}
              d={`M 670 ${y + 56} C 720 ${y + 56}, 720 436, ${cardX} 436`}
              fill="none"
              stroke={KIND[CHAPTERS[i]!.kind]}
              strokeWidth={3}
              strokeDasharray={len}
              strokeDashoffset={len * (1 - tw(f, 40 + i * 6, 70 + i * 6))}
            />
          );
        })}
      </svg>
      <Label color={C.amber} style={{ position: "absolute", left: cardX, top: 92, opacity: tw(f, 60, 76) }}>Decision</Label>
      <div
        style={{
          position: "absolute",
          left: cardX,
          top: 130,
          width: 1050,
          boxSizing: "border-box",
          background: C.panel,
          border: `2px solid ${C.line}`,
          borderRadius: 20,
          padding: "38px 46px 42px",
          opacity: tw(f, 60, 80),
          transform: `scale(${tw(f, 60, 86, 0.96, 1)})`,
          transformOrigin: "left center",
          boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ font: `400 ${T.xs}px/1 ${MONO}`, color: C.amber, letterSpacing: "0.06em" }}>
          {ADR.id} · {ADR.date}
        </div>
        <div style={{ font: `600 ${T.xxl}px/1.15 ${SERIF}`, letterSpacing: "-0.015em", color: C.paper, marginTop: 16 }}>{ADR.title}</div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 22, opacity: tw(f, 92, 108) }}>
          <span style={{ font: `400 ${T.xs}px/1 ${SANS}`, color: C.muted, border: `2px solid ${C.line}`, borderRadius: 8, padding: "9px 14px" }}>
            Status <b style={{ color: C.paper, fontWeight: 600 }}>active</b>
          </span>
          <span style={{ display: "inline-flex", gap: 12, alignItems: "center", font: `400 ${T.xs}px/1 ${SANS}`, color: C.muted, border: `2px solid ${C.line}`, borderRadius: 8, padding: "9px 14px" }}>
            <Confidence level={3} /> Confidence <b style={{ color: C.paper, fontWeight: 600 }}>high</b>
          </span>
          <Tag kind="revert" />
          <Tag kind="dependency" />
          <Tag kind="comment" />
        </div>
        <Section at={120} label="Context">{ADR.context}</Section>
        <Section at={160} label="Decision">{ADR.decision}</Section>
        <Section at={200} label="Alternatives tried">{ADR.alternative}</Section>
        <Section at={240} label="Evidence">
          <div style={{ display: "flex", gap: 14 }}>
            {ADR.evidence.map((e) => (
              <span key={e} style={{ font: `500 ${T.xs}px/1 ${MONO}`, color: C.teal, background: `${C.teal}1F`, borderRadius: 8, padding: "10px 14px" }}>
                {e}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </Scene>
  );
};

const Chip: React.FC<{ label: string; on?: boolean }> = ({ label, on }) => (
  <span
    style={{
      font: `${on ? 600 : 400} ${T.xs}px/1 ${SANS}`,
      color: on ? C.ink : C.muted,
      background: on ? C.amber : "transparent",
      border: `2px solid ${on ? C.amber : C.line}`,
      borderRadius: 999,
      padding: "9px 20px",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const Field: React.FC<{ width: number; text: string; placeholder: string; mono?: boolean; focus?: boolean }> = ({ width, text, placeholder, mono, focus }) => (
  <span
    style={{
      width,
      boxSizing: "border-box",
      background: C.ink,
      border: `2px solid ${focus ? C.amber : C.line}`,
      borderRadius: 10,
      padding: "13px 18px",
      font: `400 ${T.xs}px/1 ${mono ? MONO : SANS}`,
      color: text ? C.paper : C.faint,
      whiteSpace: "nowrap",
      overflow: "hidden",
    }}
  >
    {text || placeholder}
  </span>
);

// 5. The viewer: a timeline you can filter by file or area.
const ViewerScene: React.FC = () => {
  const f = useCurrentFrame();
  const FILTER_AT = 152;
  const PICK_AT = 236;
  const filtered = tw(f, FILTER_AT, FILTER_AT + 26);
  const picked = f >= PICK_AT;
  const fileText = typed(FILE, f, 292, 0.6);
  // Cursor waypoints: rest, the "sync" chip, the 0007 card, the file field.
  const cx = f < 200 ? tw(f, 112, 146, 1480, 1068) : f < 258 ? tw(f, 204, 232, 1068, 520) : tw(f, 258, 286, 520, 640);
  const cy = f < 200 ? tw(f, 112, 146, 820, 262) : f < 258 ? tw(f, 204, 232, 262, 392) : tw(f, 258, 286, 392, 262);
  const down = (f >= 148 && f < 156) || (f >= 232 && f < 240) || (f >= 286 && f < 292);
  return (
    <Scene caption="Browse the log as a timeline. Filter by file or area.">
      <Window title="decisions/index.html" style={{ position: "absolute", left: 120, top: 60, width: 1680, height: 860, opacity: tw(f, 0, 18), transform: `translateY(${tw(f, 0, 24, 30, 0)}px)` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, padding: "20px 30px", borderBottom: `2px solid ${C.line}` }}>
          <Wordmark size={T.lg} />
          <span style={{ font: `400 ${T.xs}px/1 ${MONO}`, color: C.muted }}>acme/sync-service</span>
          <span style={{ marginLeft: "auto", font: `400 ${T.xs}px/1 ${SANS}`, color: C.faint }}>{f >= FILTER_AT ? "2 of 9 decisions" : "9 of 9 decisions"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 30px", borderBottom: `2px solid ${C.line}`, background: C.raised }}>
          <Field width={290} text="" placeholder="Search decisions" />
          <Field width={400} text={fileText} placeholder="Filter by file path" mono focus={f >= 288} />
          <Label style={{ marginLeft: 14 }}>Area</Label>
          <Chip label="sync 3" on={f >= FILTER_AT} />
          <Chip label="api 3" />
          <Chip label="config 2" />
          <Chip label="ci 1" />
        </div>
        <div style={{ display: "flex", height: 642 }}>
          <div style={{ width: 640, boxSizing: "border-box", padding: "20px 26px 0 30px", borderRight: `2px solid ${C.line}` }}>
            {TIMELINE.map((d, i) => {
              const keep = d.area === "sync";
              const vis = keep ? 1 : 1 - filtered;
              const current = picked && d.id === "0007";
              return (
                <div key={d.id} style={{ height: 118 * vis, opacity: tw(f, 22 + i * 9, 40 + i * 9) * vis, overflow: "hidden" }}>
                  <div style={{ position: "relative", paddingLeft: 40, height: 106 }}>
                    <span style={{ position: "absolute", left: 8, top: 0, bottom: -12, width: 3, background: C.line }} />
                    <span style={{ position: "absolute", left: 0, top: 18, width: 19, height: 19, borderRadius: 10, background: KIND[d.kind], border: `4px solid ${C.panel}`, boxSizing: "border-box" }} />
                    <div style={{ height: 106, boxSizing: "border-box", background: current ? C.raised : C.ink, border: `2px solid ${current ? C.amber : C.line}`, borderRadius: 14, padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", font: `400 22px/1 ${MONO}`, color: C.faint }}>
                        <span style={{ color: C.muted }}>{d.id}</span>
                        <span>{d.date}</span>
                        <span style={{ marginLeft: "auto" }}>
                          <Tag kind={d.kind} size={20} />
                        </span>
                      </div>
                      <div style={{ font: `600 ${T.sm}px/1.2 ${SERIF}`, color: C.paper, marginTop: 14, whiteSpace: "nowrap", overflow: "hidden" }}>{d.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, padding: "34px 44px", position: "relative" }}>
            <div style={{ font: `400 ${T.sm}px/1 ${SANS}`, color: C.faint, opacity: picked ? 0 : tw(f, 40, 60) }}>Pick a decision on the timeline.</div>
            <div style={{ position: "absolute", left: 44, right: 44, top: 34, opacity: tw(f, PICK_AT + 4, PICK_AT + 22), transform: `translateY(${tw(f, PICK_AT + 4, PICK_AT + 26, 16, 0)}px)` }}>
              <div style={{ font: `400 ${T.xs}px/1 ${MONO}`, color: C.amber, letterSpacing: "0.06em" }}>
                {ADR.id} · {ADR.date}
              </div>
              <div style={{ font: `600 ${T.xl}px/1.15 ${SERIF}`, color: C.paper, marginTop: 14, letterSpacing: "-0.01em" }}>{ADR.title}</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20, font: `400 ${T.xs}px/1 ${SANS}`, color: C.muted }}>
                <Confidence level={3} /> Confidence high <Tag kind="revert" /> <Tag kind="comment" />
              </div>
              <Label style={{ marginTop: 30 }}>Context</Label>
              <div style={{ font: `400 ${T.sm}px/1.45 ${SANS}`, color: C.paper, marginTop: 10 }}>{ADR.context}</div>
              <Label style={{ marginTop: 26 }}>Alternatives tried</Label>
              <div style={{ font: `400 ${T.sm}px/1.45 ${SANS}`, color: C.paper, marginTop: 10 }}>{ADR.alternative}</div>
              <Label style={{ marginTop: 26 }}>Evidence</Label>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                {ADR.evidence.map((e) => (
                  <span key={e} style={{ font: `500 22px/1 ${MONO}`, color: C.teal, background: `${C.teal}1F`, borderRadius: 8, padding: "9px 12px" }}>
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Window>
      <div style={{ opacity: tw(f, 100, 114) }}>
        <Cursor x={cx} y={cy} down={down} />
      </div>
    </Scene>
  );
};

const Row: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  return <div style={{ opacity: tw(f, at, at + 16), transform: `translateY(${tw(f, at, at + 20, 14, 0)}px)`, marginTop: 26, ...style }}>{children}</div>;
};

// 6. An agent asks why() before a refactor.
const AgentScene: React.FC = () => {
  const f = useCurrentFrame();
  const ask = "Clean up retry.ts and drop the dead sleep.";
  const done = f >= 146;
  return (
    <Scene caption="Agents call why() over MCP before they refactor.">
      <Window title="agent · acme/sync-service" style={{ position: "absolute", left: 260, top: 56, width: 1400, height: 868, opacity: tw(f, 0, 18) }}>
        <div style={{ padding: "14px 44px 0" }}>
          <Row at={4} style={{ font: `400 ${T.md}px/1.3 ${MONO}`, color: C.paper }}>
            <span style={{ color: C.amber }}>› </span>
            {typed(ask, f, 10, 1.1)}
            {f < 60 ? <span style={{ opacity: f % 20 < 10 ? 1 : 0, color: C.amber }}>▍</span> : null}
          </Row>
          <Row at={70} style={{ font: `400 ${T.sm}px/1.4 ${SANS}`, color: C.muted }}>
            Checking why that line exists before I touch it.
          </Row>
          <Row at={100}>
            <div style={{ display: "flex", alignItems: "center", background: C.ink, border: `2px solid ${C.line}`, borderRadius: 12, padding: "18px 24px", font: `400 ${T.sm}px/1 ${MONO}` }}>
              <span style={{ color: C.faint, marginRight: 16 }}>mcp</span>
              <span style={{ color: C.teal }}>backstory.why</span>
              <span style={{ color: C.paper }}>("{FILE}")</span>
              <span style={{ marginLeft: "auto", font: `400 ${T.xs}px/1 ${SANS}`, color: done ? C.green : C.faint }}>{done ? "1 decision" : `reading${".".repeat(1 + (Math.floor(f / 8) % 3))}`}</span>
            </div>
          </Row>
          <Row at={146} style={{ marginTop: 14 }}>
            <div style={{ background: C.raised, borderLeft: `6px solid ${C.amber}`, borderRadius: 12, padding: "22px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ font: `400 ${T.xs}px/1 ${MONO}`, color: C.amber }}>{ADR.id}</span>
                <Confidence level={3} />
                <span style={{ font: `400 ${T.xs}px/1 ${SANS}`, color: C.muted }}>confidence high</span>
              </div>
              <div style={{ font: `600 ${T.lg}px/1.2 ${SERIF}`, color: C.paper, marginTop: 14 }}>{ADR.title}</div>
              <div style={{ font: `400 ${T.sm}px/1.45 ${SANS}`, color: C.muted, marginTop: 12 }}>
                Instant retries got the service banned upstream for 10 minutes <span style={{ color: C.teal }}>(#212)</span>.
              </div>
            </div>
          </Row>
          <Row at={212} style={{ font: `400 ${T.sm}px/1.4 ${SANS}`, color: C.paper }}>
            The sleep is deliberate. Keeping the pause, naming it, and linking the ADR.
          </Row>
          <Row at={256}>
            <div style={{ borderRadius: 12, overflow: "hidden", font: `400 ${T.xs}px/1 ${MONO}`, border: `2px solid ${C.line}` }}>
              <div style={{ background: `${C.red}22`, color: C.red, padding: "16px 22px", whiteSpace: "pre" }}>- await sleep(250); // do not remove</div>
              <div style={{ background: `${C.green}22`, color: C.green, padding: "16px 22px", whiteSpace: "pre" }}>+ await sleep(RETRY_SPACING_MS); // ADR 0007: upstream rate limit</div>
            </div>
          </Row>
        </div>
      </Window>
    </Scene>
  );
};

// 7. Install.
const InstallScene: React.FC = () => {
  const f = useCurrentFrame();
  const cmd = typed(INSTALL, f, 56, 1);
  return (
    <Scene>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ opacity: tw(f, 0, 20), transform: `scale(${tw(f, 0, 30, 0.95, 1)})` }}>
          <Wordmark size={T.mega + 30} />
        </div>
        <div style={{ font: `500 ${T.xxl}px/1.2 ${SERIF}`, color: C.paper, marginTop: 34, opacity: tw(f, 18, 38) }}>Recover the why behind your code.</div>
        <div
          style={{
            marginTop: 70,
            background: C.panel,
            border: `2px solid ${C.line}`,
            borderRadius: 16,
            padding: "30px 44px",
            font: `400 ${T.lg}px/1 ${MONO}`,
            color: C.paper,
            minWidth: 1120,
            boxSizing: "border-box",
            opacity: tw(f, 40, 56),
          }}
        >
          <span style={{ color: C.amber }}>$ </span>
          {cmd}
          <span style={{ opacity: f % 24 < 12 ? 1 : 0, color: C.amber }}>▍</span>
        </div>
        <div style={{ font: `400 ${T.md}px/1 ${SANS}`, color: C.muted, marginTop: 44, opacity: tw(f, 118, 136) }}>ADRs in /decisions · timeline viewer · why() over MCP</div>
        <div style={{ font: `400 ${T.sm}px/1 ${MONO}`, color: C.teal, marginTop: 30, opacity: tw(f, 140, 158) }}>{REPO_URL}</div>
      </AbsoluteFill>
    </Scene>
  );
};

export const Tutorial: React.FC = () => {
  const order: [keyof typeof SCENES, React.FC][] = [
    ["code", CodeScene],
    ["chapters", ChaptersScene],
    ["cards", CardsScene],
    ["viewer", ViewerScene],
    ["agent", AgentScene],
    ["install", InstallScene],
  ];
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {order.map(([key, Component]) => {
        const start = from;
        from += SCENES[key];
        return (
          <Sequence key={key} from={start} durationInFrames={SCENES[key]} name={key}>
            <Component />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
