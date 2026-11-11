// Writes media/how-it-works.svg. Same palette as the viewer and the video.
// GitHub serves SVGs as images, so only system fonts are used here.
import { writeFileSync } from "node:fs";

const C = {
  ink: "#12131A", panel: "#1B1D28", raised: "#232636", line: "#2E3145",
  paper: "#F3EEE3", muted: "#A3A5B8", faint: "#6E7188",
  amber: "#F2B34C", teal: "#5CC8B8", red: "#EF6F6C", violet: "#A594FF", blue: "#6FA8FF", green: "#8FD18A",
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace";

const W = 1100;
const H = 520;
const TOP = 96;
const BOTTOM = 476;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, s, { size = 16, fill = C.paper, family = SANS, weight = 400, anchor = "start" } = {}) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const box = (x, y, w, h, { stroke = C.line, fill = C.panel } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
const heading = (x, n, label) =>
  `<circle cx="${x + 13}" cy="56" r="13" fill="${C.amber}"/>` +
  text(x + 13, 61.5, String(n), { size: 15, fill: C.ink, weight: 700, anchor: "middle" }) +
  text(x + 36, 63, label, { size: 23, family: SERIF, weight: 700 });
const arrow = (x1, x2, y) =>
  `<path d="M ${x1} ${y} H ${x2 - 9}" stroke="${C.amber}" stroke-width="2.5" fill="none"/>` +
  `<path d="M ${x2 - 11} ${y - 7} L ${x2} ${y} L ${x2 - 11} ${y + 7} Z" fill="${C.amber}"/>`;

/** Evenly spaced rows between TOP and BOTTOM. */
const rows = (n, gap) => {
  const h = (BOTTOM - TOP - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ y: TOP + i * (h + gap), h }));
};

const parts = [];

// 1. Sources
const sources = [
  ["git log", "commits, diffs, renames"],
  ["Pull requests", "descriptions via gh api"],
  ["Issues", "linked from commits"],
  ["Code comments", "traced with git blame"],
];
parts.push(heading(30, 1, "Sources"));
rows(4, 16).forEach(({ y, h }, i) => {
  parts.push(box(30, y, 210, h));
  parts.push(text(48, y + h / 2 - 3, sources[i][0], { size: 19, weight: 600, family: i === 0 ? MONO : SANS }));
  parts.push(text(48, y + h / 2 + 20, sources[i][1], { size: 15, fill: C.muted }));
});

// 2. Signals
const signals = [
  ["Dependency swaps", C.blue],
  ["Reverts", C.red],
  ["Large refactors", C.violet],
  ["Config changes", C.green],
  ["because / workaround / hack", C.amber],
];
parts.push(heading(300, 2, "Signals"));
rows(5, 14).forEach(({ y, h }, i) => {
  const [label, color] = signals[i];
  parts.push(box(300, y, 230, h, { stroke: color }));
  parts.push(`<rect x="300" y="${y}" width="7" height="${h}" rx="3" fill="${color}"/>`);
  parts.push(text(322, y + h / 2 + 6, label, { size: i === 4 ? 14 : 18, weight: 600, family: i === 4 ? MONO : SANS }));
});

// 3. Decisions
parts.push(heading(590, 3, "Decisions"));
parts.push(box(590, TOP, 230, 112));
parts.push(text(608, TOP + 34, "Group", { size: 19, weight: 600 }));
parts.push(text(608, TOP + 60, "Linked commits become", { size: 15, fill: C.muted }));
parts.push(text(608, TOP + 81, "one decision candidate", { size: 15, fill: C.muted }));
parts.push(`<path d="M 705 ${TOP + 112} V ${TOP + 134}" stroke="${C.amber}" stroke-width="2.5"/>`);
parts.push(`<path d="M 698 ${TOP + 132} L 705 ${TOP + 143} L 712 ${TOP + 132} Z" fill="${C.amber}"/>`);
const adrY = TOP + 146;
parts.push(box(590, adrY, 230, BOTTOM - adrY, { stroke: C.amber, fill: C.raised }));
parts.push(text(608, adrY + 32, "Claude writes the ADR", { size: 18, weight: 600 }));
["Context", "Decision", "Alternatives tried", "Consequences", "Evidence links", "Confidence"].forEach((label, i) => {
  const y = adrY + 62 + i * 28;
  parts.push(`<circle cx="614" cy="${y - 5}" r="3.5" fill="${i === 4 ? C.teal : C.amber}"/>`);
  parts.push(text(628, y, label, { size: 16, fill: i === 4 ? C.teal : C.paper }));
});

// 4. Outputs
const outputs = [
  ["decisions/*.md", "ADR files in your repo", MONO],
  ["Timeline viewer", "one static HTML file", SANS],
  ["why(file | symbol)", "MCP tool for agents", MONO],
];
parts.push(heading(880, 4, "Outputs"));
rows(3, 22).forEach(({ y, h }, i) => {
  parts.push(box(880, y, 190, h, { stroke: C.teal }));
  parts.push(text(898, y + h / 2 - 2, outputs[i][0], { size: i === 1 ? 19 : 15, weight: 600, family: outputs[i][2] }));
  parts.push(text(898, y + h / 2 + 22, outputs[i][1], { size: 15, fill: C.muted }));
});

const mid = (TOP + BOTTOM) / 2;
parts.push(arrow(248, 292, mid), arrow(538, 582, mid), arrow(828, 872, mid));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="How Backstory works: sources become signals, signals become decisions, decisions become ADR files, a timeline viewer and an MCP tool.">
<rect width="${W}" height="${H}" rx="16" fill="${C.ink}"/>
${parts.join("\n")}
</svg>
`;
writeFileSync(new URL("../media/how-it-works.svg", import.meta.url), svg);
console.log("wrote media/how-it-works.svg");
