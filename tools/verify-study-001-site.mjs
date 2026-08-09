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

const checks = [];
const errors = [];
const assert = (condition, label) => {
  checks.push({ label, passed: Boolean(condition) });
  if (!condition) throw new Error(label);
};

const attachErrorCollection = (page, prefix = "") => {
  page.on("pageerror", (error) => errors.push(`${prefix}pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${prefix}console: ${message.text()}`);
  });
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  attachErrorCollection(desktop);
  const response = await desktop.goto(url, { waitUntil: "domcontentloaded" });
  await desktop.waitForTimeout(2400);

  assert(response?.ok(), "Home page returns a successful response");
  assert((await desktop.locator("nav a").allTextContents()).join("|") === "Study 001|Study 002|Contact", "Navigation matches the supplied redesign");
  assert((await desktop.locator("main > section").evaluateAll((sections) => sections.map((section) => section.id))).join("|") === "threshold|study-001|form|study-002", "Only the retained Claude-design sections render");
  assert(!/interactive model|structural massing|direction reset/i.test(await desktop.locator("body").innerText()), "No 3D or massing copy remains");
  assert((await desktop.locator("#study-002 img").count()) === 1, "Only Study 002 Edition 02 renders");
  assert((await desktop.locator("#study-002 img").getAttribute("src")) === "assets/study-002-edition-02.png", "Study 002 uses the Edition 02 scan");
  assert(!/Edition 01|First lines|drawn twice/i.test(await desktop.locator("#study-002").innerText()), "Edition 01 copy is fully removed");
  const desktopBrokenImages = await desktop.locator("img").evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")));
  assert(desktopBrokenImages.length === 0, "All local artwork resolves successfully");
  const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow <= 1, "Desktop layout has no horizontal overflow");

  await desktop.locator('nav a[href="#study-001"]').click();
  await desktop.waitForTimeout(950);
  assert(await desktop.locator("#study-001 .reveal.visible").count() === 3, "Study 001 reveal sequence completes");
  await desktop.locator('nav a[href="#study-002"]').click();
  await desktop.waitForTimeout(950);
  assert((await desktop.evaluate(() => location.hash)) === "#study-002", "Study 002 navigation lands correctly");
  await desktop.locator('nav a[href="#contact"]').click();
  await desktop.waitForTimeout(950);
  assert(await desktop.locator("#contact .reveal.visible").count() === 2, "Contact reveal sequence completes");
  assert(errors.length === 0, "Desktop browser emits no console or page errors");
  await desktop.screenshot({ path: path.resolve("tmp", "claude-redesign-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  attachErrorCollection(mobile, "mobile ");
  await mobile.goto(url, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(2400);
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(mobileOverflow <= 1, "Mobile layout has no horizontal overflow");
  assert(await mobile.locator(".hero-title").isVisible(), "Hero remains visible at mobile width");
  await mobile.locator('nav a[href="#study-002"]').click();
  await mobile.waitForTimeout(950);
  assert((await mobile.locator("#study-002 .edition").count()) === 1, "Only Edition 02 remains available on mobile");
  assert(errors.length === 0, "Mobile browser emits no console or page errors");
  await mobile.screenshot({ path: path.resolve("tmp", "claude-redesign-mobile.png"), fullPage: true });

  process.stdout.write(`${JSON.stringify({ url, checks, errors }, null, 2)}\n`);
} finally {
  await browser.close();
}
