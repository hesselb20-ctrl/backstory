// Screenshot a local HTML file with an installed Chrome or Edge, headless.
// Usage: node scripts/screenshot.mjs <file.html> <out.png> <width> <height> [hash] [scale]
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [file, out, width, height, hash = "", scale = "2"] = process.argv.slice(2);
if (!file || !out || !width || !height) {
  console.error("usage: screenshot.mjs <file.html> <out.png> <width> <height> [hash] [scale]");
  process.exit(1);
}

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chrome or Edge found. Set CHROME_PATH.");
  process.exit(1);
}

// The viewer names its fonts but never downloads them. For the README images we
// load the same faces the video uses, in a temporary copy.
const FONTS =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=block">';
const dir = mkdtempSync(join(tmpdir(), "backstory-shot-"));
const copy = join(dir, "page.html");
writeFileSync(copy, readFileSync(resolve(file), "utf8").replace("</head>", `${FONTS}</head>`));

const url = `${pathToFileURL(copy).href}${hash ? `#${hash}` : ""}`;
const common = ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${join(dir, "profile")}`, "--virtual-time-budget=6000"];

// Height "auto": ask the page how tall it is, then size the window to fit.
let h = height;
if (height === "auto") {
  const dom = execFileSync(browser, [...common, `--window-size=${width},800`, "--dump-dom", url], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  h = dom.match(/data-height="(\d+)"/)?.[1] ?? "900";
}

execFileSync(
  browser,
  [...common, `--force-device-scale-factor=${scale}`, `--window-size=${width},${h}`, `--screenshot=${resolve(out)}`, url],
  { stdio: "ignore" },
);
console.log(`wrote ${out}`);
