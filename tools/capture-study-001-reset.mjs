import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dependencyRoot = process.env.NODE_PATH || "C:\\Users\\aalza\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const { chromium } = require(path.join(dependencyRoot, "playwright"));
const sharp = require(path.join(dependencyRoot, "sharp"));

const url = process.env.TRPLS_MODEL_URL || "http://127.0.0.1:4174/model.html";
const outputDir = path.resolve("assets", "study-001-reset");
const tmpDir = path.resolve("tmp", "study-001-reset");
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(tmpDir, { recursive: true });

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
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  assert(response?.ok(), "Model page returns a successful response");
  await page.waitForFunction(() => Boolean(window.trplSModel), null, { timeout: 30000 });
  assert(await page.locator("#model-stage canvas").isVisible(), "WebGL canvas renders");
  assert((await page.locator("[data-model-view]").count()) === 8, "All eight inspection views render");
  assert((await page.locator("[data-model-layer]").count()) === 5, "All five model layers render");

  const views = ["perspective", "east", "north", "south", "west", "ground-plan", "upper-plan", "section"];
  for (const view of views) {
    await page.evaluate((name) => window.trplSModel.setView(name), view);
    await page.waitForTimeout(350);
    assert((await page.locator("#model-stage").getAttribute("data-current-view")) === view, `${view} preset activates`);
    const pngPath = path.join(tmpDir, `${view}.png`);
    const webpPath = path.join(outputDir, `${view}.webp`);
    await page.locator("#model-stage").screenshot({ path: pngPath });
    await sharp(pngPath).webp({ quality: 90 }).toFile(webpPath);
  }

  await page.evaluate(() => window.trplSModel.setView("perspective"));
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(tmpDir, "model-page-desktop.png"), fullPage: true });
  assert(errors.length === 0, "Desktop model emits no browser errors");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on("pageerror", (error) => errors.push(`mobile pageerror: ${error.message}`));
  mobile.on("console", (message) => {
    if (message.type() === "error") errors.push(`mobile console: ${message.text()}`);
  });
  await mobile.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await mobile.waitForFunction(() => Boolean(window.trplSModel), null, { timeout: 30000 });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, "Mobile model page has no horizontal overflow");
  await mobile.locator('[data-model-view="east"]').click();
  assert((await mobile.locator("#model-stage").getAttribute("data-current-view")) === "east", "Mobile view controls remain interactive");
  await mobile.screenshot({ path: path.join(tmpDir, "model-page-mobile.png"), fullPage: true });
  assert(errors.length === 0, "Mobile model emits no browser errors");

  process.stdout.write(`${JSON.stringify({ url, checks, errors, outputDir }, null, 2)}\n`);
} finally {
  await browser.close();
}
