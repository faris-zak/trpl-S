import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dependencyRoot = process.env.NODE_PATH || "C:\\Users\\aalza\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const { chromium } = require(path.join(dependencyRoot, "playwright"));

const url = process.env.TRPLS_SITE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.TRPLS_BROWSER || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});

const errors = [];
const checks = [];
const assert = (condition, label) => {
  checks.push({ label, passed: Boolean(condition) });
  if (!condition) throw new Error(label);
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  desktop.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  const response = await desktop.goto(url, { waitUntil: "networkidle" });
  assert(response?.ok(), "Home page returns a successful response");
  assert((await desktop.locator("body").innerText()).trim().length > 500, "Home page contains the complete study narrative");
  assert(await desktop.locator("#plan").isVisible(), "Plan chapter renders");
  assert(await desktop.locator("#elevations").isVisible(), "Elevations chapter renders");
  assert((await desktop.locator("[data-drawing-selector]").count()) === 2, "Both drawing selectors render");

  const planTabs = desktop.locator("#plan [data-selector-option]");
  await planTabs.nth(1).click();
  assert((await planTabs.nth(1).getAttribute("aria-selected")) === "true", "First-floor tab reports its selected state");
  assert((await desktop.locator("#plan [data-selector-image]").getAttribute("src"))?.includes("floor-first.svg"), "First-floor selector loads the correct drawing");
  assert((await desktop.locator("#plan [data-selector-title]").innerText()) === "First floor", "First-floor selector updates its description");

  await planTabs.nth(1).press("ArrowLeft");
  assert((await planTabs.nth(0).getAttribute("aria-selected")) === "true", "Floor selector supports arrow-key navigation");

  const elevationTabs = desktop.locator("#elevations [data-selector-option]");
  await elevationTabs.nth(1).click();
  assert((await desktop.locator("#elevations [data-selector-image]").getAttribute("src"))?.includes("elevation-north.svg"), "Elevation selector loads the north drawing");

  await desktop.locator("#elevations [data-selector-open]").click();
  assert(await desktop.locator("#drawing-viewer").evaluate((dialog) => dialog.open), "Selected drawing opens in the full-screen viewer");
  assert((await desktop.locator("[data-viewer-image]").getAttribute("src"))?.includes("elevation-north.svg"), "Viewer receives the active elevation");
  await desktop.locator('[data-viewer-action="close"]').click();

  const download = await desktop.request.get(new URL("output/pdf/study-001-house-development.pdf", url).toString());
  assert(download.ok(), "Combined A1 PDF download is reachable");
  assert((download.headers()["content-type"] || "").includes("application/pdf"), "PDF download has the correct content type");

  const brokenImages = await desktop.locator("img").evaluateAll((images) => images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute("src")));
  assert(brokenImages.length === 0, "All loaded images resolve successfully");
  const boardRatios = await desktop.locator(".board-grid img").evaluateAll((images) => images.map((img) => {
    const box = img.getBoundingClientRect();
    return box.width / box.height;
  }));
  assert(boardRatios.every((ratio) => ratio > 1.35 && ratio < 1.48), `Concept board previews retain their A1 landscape ratio (${boardRatios.map((ratio) => ratio.toFixed(2)).join(", ")})`);
  assert(errors.length === 0, "No browser console or page errors are emitted");
  await desktop.evaluate(() => document.activeElement?.blur());
  await desktop.locator("#plan").screenshot({ path: path.resolve("tmp", "study-001-plan-desktop.png") });
  await desktop.locator("#elevations").screenshot({ path: path.resolve("tmp", "study-001-elevations-desktop.png") });
  await desktop.screenshot({ path: path.resolve("tmp", "study-001-site-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on("pageerror", (error) => errors.push(`mobile pageerror: ${error.message}`));
  mobile.on("console", (message) => {
    if (message.type() === "error") errors.push(`mobile console: ${message.text()}`);
  });
  await mobile.goto(`${url}#plan`, { waitUntil: "networkidle" });
  assert(await mobile.locator("#plan").isVisible(), "Plan chapter renders at mobile width");
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, "Mobile layout has no horizontal overflow");
  await mobile.locator("#plan [data-selector-option]").nth(1).click();
  assert((await mobile.locator("#plan [data-selector-image]").getAttribute("src"))?.includes("floor-first.svg"), "Mobile floor selector remains interactive");
  await mobile.locator("#plan").screenshot({ path: path.resolve("tmp", "study-001-plan-mobile.png") });
  await mobile.screenshot({ path: path.resolve("tmp", "study-001-site-mobile.png"), fullPage: true });
  assert(errors.length === 0, "Mobile verification emits no browser errors");

  process.stdout.write(`${JSON.stringify({ url, checks, errors }, null, 2)}\n`);
} finally {
  await browser.close();
}
