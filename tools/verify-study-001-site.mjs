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
  assert((await desktop.locator("nav a").allTextContents()).join("|") === "trpl-S (1)|trpl-S (2)|trpl-S (3)|Contact", "Navigation uses the trpl-S project names");
  assert((await desktop.locator("main > section").evaluateAll((sections) => sections.map((section) => section.id))).join("|") === "threshold|trpl-s-1|form|trpl-s-2|trpl-s-3", "The named trpl-S sections render");
  assert(!/interactive model|structural massing|direction reset/i.test(await desktop.locator("body").innerText()), "No 3D or massing copy remains");
  assert((await desktop.locator("#trpl-s-2 img").count()) === 1, "Only trpl-S (2) Edition 02 renders");
  assert((await desktop.locator("#trpl-s-2 img").getAttribute("src")) === "assets/trpl-S(2).webp", "trpl-S (2) uses the Edition 02 scan");
  assert(!/Edition 01|First lines|drawn twice/i.test(await desktop.locator("#trpl-s-2").innerText()), "Edition 01 copy is fully removed");
  assert((await desktop.locator("#trpl-s-3 img").count()) === 1, "trpl-S (3) drawing renders");
  assert((await desktop.locator("#trpl-s-3 img").getAttribute("src")) === "assets/trpl-S(3).webp", "trpl-S (3) uses the optimized drawing");
  const desktopImages = desktop.locator("img");
  for (let i = 0; i < await desktopImages.count(); i += 1) {
    await desktopImages.nth(i).scrollIntoViewIfNeeded();
    await desktopImages.nth(i).evaluate((image) => image.decode());
  }
  const desktopBrokenImages = await desktop.locator("img").evaluateAll((images) => images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")));
  assert(desktopBrokenImages.length === 0, "All local artwork resolves successfully");
  const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow <= 1, "Desktop layout has no horizontal overflow");

  await desktop.locator('nav a[href="#trpl-s-1"]').click();
  await desktop.waitForTimeout(950);
  assert(await desktop.locator("#trpl-s-1 .reveal.visible").count() === 3, "trpl-S (1) reveal sequence completes");
  await desktop.locator('nav a[href="#trpl-s-2"]').click();
  await desktop.waitForTimeout(950);
  assert((await desktop.evaluate(() => location.hash)) === "#trpl-s-2", "trpl-S (2) navigation lands correctly");
  await desktop.locator('nav a[href="#trpl-s-3"]').click();
  await desktop.waitForTimeout(950);
  assert((await desktop.evaluate(() => location.hash)) === "#trpl-s-3", "trpl-S (3) navigation lands correctly");
  assert(await desktop.locator("#trpl-s-3 .reveal.visible").count() === 4, "trpl-S (3) reveal sequence completes");
  await desktop.locator('nav a[href="#contact"]').click();
  await desktop.waitForTimeout(950);
  assert(await desktop.locator("#contact .reveal.visible").count() === 2, "Contact reveal sequence completes");
  assert(errors.length === 0, `Desktop browser emits no console or page errors${errors.length ? ` (${errors.join(" | ")})` : ""}`);
  await desktop.locator("#trpl-s-3").screenshot({ path: path.resolve("tmp", "trpl-s-3-desktop.png") });
  await desktop.screenshot({ path: path.resolve("tmp", "claude-redesign-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  attachErrorCollection(mobile, "mobile ");
  await mobile.goto(url, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(2400);
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(mobileOverflow <= 1, "Mobile layout has no horizontal overflow");
  assert(await mobile.locator(".hero-title").isVisible(), "Hero remains visible at mobile width");
  await mobile.locator('nav a[href="#trpl-s-2"]').click();
  await mobile.waitForTimeout(950);
  assert((await mobile.locator("#trpl-s-2 .edition").count()) === 1, "Only Edition 02 remains available on mobile");
  await mobile.locator('nav a[href="#trpl-s-3"]').click();
  await mobile.waitForTimeout(950);
  assert((await mobile.evaluate(() => location.hash)) === "#trpl-s-3", "trpl-S (3) navigation works on mobile");
  assert(await mobile.locator("#trpl-s-3 img").isVisible(), "trpl-S (3) drawing remains visible on mobile");
  assert(errors.length === 0, `Mobile browser emits no console or page errors${errors.length ? ` (${errors.join(" | ")})` : ""}`);
  await mobile.locator("#trpl-s-3").screenshot({ path: path.resolve("tmp", "trpl-s-3-mobile.png") });
  await mobile.screenshot({ path: path.resolve("tmp", "claude-redesign-mobile.png"), fullPage: true });

  process.stdout.write(`${JSON.stringify({ url, checks, errors }, null, 2)}\n`);
} finally {
  await browser.close();
}
