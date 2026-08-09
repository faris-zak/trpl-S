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
  assert(await desktop.locator("#study-002").isVisible(), "Study 002 chapter renders");
  assert(await desktop.locator("#plan").isHidden(), "Rejected plan-led chapter is removed from the active narrative");
  assert(await desktop.locator("#elevations").isHidden(), "Rejected elevation-led chapter is removed from the active narrative");
  assert((await desktop.locator(".model-view-grid a").count()) === 4, "Four model-derived review views render");
  assert((await desktop.locator('.chapter-rail a[href="#massing"]').count()) === 1, "Chapter rail links to massing reset");
  assert((await desktop.locator('.chapter-rail a[href="#model"]').count()) === 1, "Chapter rail links to model review");
  assert((await desktop.locator('.chapter-rail a[href="#study-002"]').count()) === 1, "Chapter rail links to Study 002");

  const modelResponse = await desktop.request.get(new URL("model.html", url).toString());
  assert(modelResponse.ok(), "Interactive massing model is reachable");
  const doctrineResponse = await desktop.request.get(new URL("design/study-001-direction-reset.md", url).toString());
  assert(doctrineResponse.ok(), "Direction-reset doctrine is reachable");

  const brokenImages = await desktop.locator("img").evaluateAll((images) => images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute("src")));
  assert(brokenImages.length === 0, "All loaded images resolve successfully");
  const studyTwoImages = desktop.locator("#study-002 img");
  assert((await studyTwoImages.count()) === 2, "Both trpl-S (2) editions render");
  for (let i = 0; i < await studyTwoImages.count(); i += 1) {
    await studyTwoImages.nth(i).scrollIntoViewIfNeeded();
    await studyTwoImages.nth(i).evaluate((image) => image.decode());
  }
  assert(await studyTwoImages.evaluateAll((images) => images.every((image) => image.naturalWidth > 0)), "Both trpl-S (2) drawings load successfully");
  const editionCanvases = desktop.locator(".study-edition-canvas");
  await editionCanvases.nth(0).click();
  assert(await desktop.locator("#drawing-viewer").isVisible(), "Edition 01 opens in the full-screen drawing viewer");
  assert((await desktop.locator("#drawing-viewer [data-viewer-title]").textContent()) === "trpl-S (2) / Edition 01", "Drawing viewer identifies Edition 01");
  assert((await desktop.locator("#drawing-viewer [data-viewer-image]").getAttribute("src")) === "assets/study-002-edition-01-1800.webp", "Drawing viewer uses the optimized Edition 01 image");
  await desktop.locator('[data-viewer-action="close"]').click();
  await editionCanvases.nth(1).click();
  assert((await desktop.locator("#drawing-viewer [data-viewer-title]").textContent()) === "trpl-S (2) / Edition 02", "Drawing viewer identifies Edition 02");
  assert((await desktop.locator("#drawing-viewer [data-viewer-image]").getAttribute("src")) === "assets/study-002-edition-02-1800.webp", "Drawing viewer uses the optimized Edition 02 image");
  await desktop.locator('[data-viewer-action="close"]').click();
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
  const studyTwoReveals = desktop.locator("#study-002 [data-reveal]");
  for (let i = 0; i < await studyTwoReveals.count(); i += 1) {
    await studyTwoReveals.nth(i).scrollIntoViewIfNeeded();
    await desktop.waitForTimeout(120);
  }
  await desktop.evaluate(() => document.activeElement?.blur());
  await desktop.locator("#massing").screenshot({ path: path.resolve("tmp", "study-001-reset-desktop.png") });
  await desktop.locator("#model").screenshot({ path: path.resolve("tmp", "study-001-model-entry-desktop.png") });
  await desktop.locator("#study-002").screenshot({ path: path.resolve("tmp", "study-002-desktop.png") });
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
  await mobile.locator("#study-002").evaluate((section) => window.scrollTo(0, section.offsetTop + 24));
  await mobile.waitForFunction(() => document.body.dataset.chapter === "study-002");
  assert(await mobile.locator("#study-002").isVisible(), "Study 002 chapter renders at mobile width");
  assert((await mobile.locator(".header-study").textContent()) === "Study 002 / trpl-S (2)", "Study 002 updates the current-study label");
  const mobileEditionImages = mobile.locator("#study-002 img");
  assert((await mobileEditionImages.count()) === 2, "Both editions remain available at mobile width");
  await mobileEditionImages.nth(1).scrollIntoViewIfNeeded();
  await mobileEditionImages.nth(1).evaluate((image) => image.decode());
  assert((await mobileEditionImages.nth(1).evaluate((image) => image.naturalWidth)) > 0, "Edition 02 loads at mobile width");
  await mobile.locator("#massing").screenshot({ path: path.resolve("tmp", "study-001-reset-mobile.png") });
  await mobile.locator("#study-002").screenshot({ path: path.resolve("tmp", "study-002-mobile.png") });
  await mobile.locator(".study-edition").nth(1).screenshot({ path: path.resolve("tmp", "study-002-edition-02-mobile.png") });
  await mobile.screenshot({ path: path.resolve("tmp", "study-001-site-mobile.png"), fullPage: true });
  assert(errors.length === 0, "Mobile verification emits no browser errors");

  process.stdout.write(`${JSON.stringify({ url, checks, errors }, null, 2)}\n`);
} finally {
  await browser.close();
}
