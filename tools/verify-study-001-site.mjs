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
  assert(await desktop.locator("#massing").isVisible(), "Direction-reset massing chapter renders");
  assert(await desktop.locator("#model").isVisible(), "Interactive-model entry chapter renders");
  assert(await desktop.locator("#plan").isHidden(), "Rejected plan-led chapter is removed from the active narrative");
  assert(await desktop.locator("#elevations").isHidden(), "Rejected elevation-led chapter is removed from the active narrative");
  assert((await desktop.locator(".model-view-grid a").count()) === 4, "Four model-derived review views render");
  assert((await desktop.locator('.chapter-rail a[href="#massing"]').count()) === 1, "Chapter rail links to massing reset");
  assert((await desktop.locator('.chapter-rail a[href="#model"]').count()) === 1, "Chapter rail links to model review");

  const modelResponse = await desktop.request.get(new URL("model.html", url).toString());
  assert(modelResponse.ok(), "Interactive massing model is reachable");
  const doctrineResponse = await desktop.request.get(new URL("design/study-001-direction-reset.md", url).toString());
  assert(doctrineResponse.ok(), "Direction-reset doctrine is reachable");

  const brokenImages = await desktop.locator("img").evaluateAll((images) => images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute("src")));
  assert(brokenImages.length === 0, "All loaded images resolve successfully");
  const previewRatios = await desktop.locator(".model-view-grid img").evaluateAll((images) => images.map((img) => {
    const box = img.getBoundingClientRect();
    return box.width / box.height;
  }));
  assert(previewRatios.every((ratio) => ratio > 1.3 && ratio < 1.36), `Model previews retain their 4:3 ratio (${previewRatios.map((ratio) => ratio.toFixed(2)).join(", ")})`);
  assert(errors.length === 0, "No browser console or page errors are emitted");
  const resetReveals = desktop.locator("#massing [data-reveal], #model [data-reveal]");
  for (let i = 0; i < await resetReveals.count(); i += 1) {
    await resetReveals.nth(i).scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(120);
  }
  await desktop.evaluate(() => document.activeElement?.blur());
  await desktop.locator("#massing").screenshot({ path: path.resolve("tmp", "study-001-reset-desktop.png") });
  await desktop.locator("#model").screenshot({ path: path.resolve("tmp", "study-001-model-entry-desktop.png") });
  await desktop.screenshot({ path: path.resolve("tmp", "study-001-site-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on("pageerror", (error) => errors.push(`mobile pageerror: ${error.message}`));
  mobile.on("console", (message) => {
    if (message.type() === "error") errors.push(`mobile console: ${message.text()}`);
  });
  await mobile.goto(`${url}#massing`, { waitUntil: "networkidle" });
  assert(await mobile.locator("#massing").isVisible(), "Direction-reset chapter renders at mobile width");
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, "Mobile layout has no horizontal overflow");
  assert((await mobile.locator(".model-view-grid a").count()) === 4, "Model-derived views remain available on mobile");
  await mobile.locator("#massing").screenshot({ path: path.resolve("tmp", "study-001-reset-mobile.png") });
  await mobile.screenshot({ path: path.resolve("tmp", "study-001-site-mobile.png"), fullPage: true });
  assert(errors.length === 0, "Mobile verification emits no browser errors");

  process.stdout.write(`${JSON.stringify({ url, checks, errors }, null, 2)}\n`);
} finally {
  await browser.close();
}
