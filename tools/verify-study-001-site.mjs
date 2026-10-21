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
    const location = message.location().url;
    const isThirdPartyFontFailure = /fonts\.(googleapis|gstatic)\.com/i.test(location);
    if (message.type() === "error" && !isThirdPartyFontFailure) errors.push(`${prefix}console: ${message.text()}${location ? ` [${location}]` : ""}`);
  });
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  attachErrorCollection(desktop);
  const response = await desktop.goto(url, { waitUntil: "domcontentloaded" });
  await desktop.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await desktop.waitForTimeout(2400);

  assert(response?.ok(), "Home page returns a successful response");
  assert((await desktop.locator(".nav-links a").allTextContents()).join("|") === "Study 01|Study 02|Study 03|Development|Contact", "Navigation exposes all three studies and the development case study");
  assert((await desktop.locator("main > section").evaluateAll((sections) => sections.map((section) => section.id))).join("|") === "threshold|name-origin|trpl-s-1|development|trpl-s-2|trpl-s-3|closing", "The portfolio chapters render in the intended sequence");
  assert(/Support, Stabilize, Stiffen/i.test(await desktop.locator("#name-origin").innerText()), "The name origin is explained in the opening narrative");
  assert((await desktop.locator("#development .drawing-card").count()) === 2, "Development includes elevation and section drawing boards");
  assert((await desktop.locator("#development .drawing-index-grid a").count()) === 6, "Development provides the individual plans and elevations");
  assert((await desktop.locator('#development a[href="output/pdf/study-001-house-development.pdf"]').count()) === 1, "The three-sheet development PDF is linked");
  assert((await desktop.locator('meta[name="description"]').getAttribute("content")).includes("support, stability, and stiffness"), "Search description reflects the portfolio's structural idea");
  assert(!/interactive model|structural massing|direction reset/i.test(await desktop.locator("body").innerText()), "No 3D or massing copy remains");
  assert((await desktop.locator("[data-visual-comparison]").count()) === 3, "All three comparison sliders render publicly");
  assert((await desktop.locator("[data-visual-comparison][hidden]").count()) === 0, "All comparison sliders are active");
  assert(await desktop.locator("[data-visual-comparison]").evaluateAll((comparisons) => comparisons.every((comparison) => comparison.dataset.comparisonReady === "true")), "All comparison sliders initialize");
  assert(await desktop.locator("[data-comparison-fallback]").evaluateAll((fallbacks) => fallbacks.every((fallback) => fallback.hidden)), "All sketch fallbacks are suppressed by active comparisons");
  assert((await desktop.locator('[data-project="trpl-S (1)"] [data-comparison-concept]').getAttribute("src")) === "assets/trpl-S(1)-visualization.webp", "trpl-S (1) uses its supplied visualization");
  assert((await desktop.locator('[data-project="trpl-S (2)"] [data-comparison-concept]').getAttribute("src")) === "assets/trpl-S(2)-visualization.webp", "trpl-S (2) uses its supplied visualization");
  assert((await desktop.locator('[data-project="trpl-S (3)"] [data-comparison-concept]').getAttribute("src")) === "assets/trpl-S(3)-visualization.webp", "trpl-S (3) uses its supplied visualization");
  assert(!/Edition 01|First lines|drawn twice/i.test(await desktop.locator("#trpl-s-2").innerText()), "Edition 01 copy is fully removed");
  const desktopBrokenImages = await desktop.locator("img[src]").evaluateAll(async (images) => {
    const rendered = images.filter((image) => !image.closest("[hidden]"));
    rendered.forEach((image) => { image.loading = "eager"; });
    await Promise.all(rendered.map((image) => image.decode().catch(() => null)));
    return rendered.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src"));
  });
  assert(desktopBrokenImages.length === 0, `All rendered local artwork resolves successfully${desktopBrokenImages.length ? ` (${desktopBrokenImages.join(", ")})` : ""}`);
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
  assert(await desktop.locator("#trpl-s-3 .study-heading .reveal.visible").count() === 3, "trpl-S (3) chapter intro reveals on arrival");
  await desktop.locator("#trpl-s-3 .study-reflection").scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(150);
  assert(await desktop.locator("#trpl-s-3 .study-reflection").evaluate((element) => element.classList.contains("visible")), "trpl-S (3) reflection reveals when reached");
  await desktop.locator('nav a[href="#development"]').click();
  await desktop.waitForTimeout(950);
  assert((await desktop.evaluate(() => location.hash)) === "#development", "Development navigation lands correctly");
  await desktop.locator('nav a[href="#contact"]').click();
  await desktop.waitForTimeout(950);
  assert(await desktop.locator("#contact .reveal.visible").count() === 2, "Contact reveal sequence completes");
  assert(errors.length === 0, `Desktop browser emits no console or page errors${errors.length ? ` (${errors.join(" | ")})` : ""}`);
  await desktop.locator("#trpl-s-3").screenshot({ path: path.resolve("tmp", "trpl-s-3-desktop.png") });

  const comparison = desktop.locator('[data-project="trpl-S (1)"]');
  const comparisonControl = comparison.locator("[data-comparison-control]");
  assert(await comparison.isVisible(), "Public comparison is visible");
  assert(await comparison.getAttribute("data-comparison-ready") === "true", "Comparison reports its initialized state");
  assert(await comparison.locator("[data-comparison-original]").getAttribute("src") === "assets/trpl-S(1).webp", "Comparison loads the configured original drawing");
  assert(await comparison.locator("[data-comparison-concept]").getAttribute("src") === "assets/trpl-S(1)-visualization.webp", "Comparison loads the configured visualization");
  const disclaimer = (await comparison.locator("figcaption").innerText()).replace(/\s+/g, " ").trim();
  assert(/AI-assisted concept visualization.*Interpretive only.*Not for construction/i.test(disclaimer), "Interpretive visualization disclaimer is visible");
  assert(await comparison.locator("[data-comparison-fallback]").count() === 0, "Comparison shell does not duplicate its fallback internally");
  assert(await comparison.locator("xpath=..").locator("[data-comparison-fallback]").isHidden(), "Public comparison suppresses its static fallback");
  await comparisonControl.focus();
  await comparisonControl.press("Home");
  assert(await comparisonControl.inputValue() === "0", "Home reveals the complete original drawing");
  await comparisonControl.press("End");
  assert(await comparisonControl.inputValue() === "100", "End reveals the complete concept visualization");
  await comparisonControl.press("ArrowLeft");
  assert(await comparisonControl.inputValue() === "99", "Arrow keys adjust the comparison position");
  assert((await comparisonControl.getAttribute("aria-valuetext")) === "1% original drawing and 99% concept visualization", "Accessible comparison percentage stays synchronized");
  const comparisonBounds = await comparison.locator(".visual-comparison-stage").boundingBox();
  if (comparisonBounds) {
    await comparisonControl.dispatchEvent("pointerdown", { clientX: comparisonBounds.x + comparisonBounds.width * 0.25, clientY: comparisonBounds.y + comparisonBounds.height / 2, pointerId: 1 });
    await comparisonControl.dispatchEvent("pointermove", { clientX: comparisonBounds.x + comparisonBounds.width * 0.7, clientY: comparisonBounds.y + comparisonBounds.height / 2, pointerId: 1 });
    await comparisonControl.dispatchEvent("pointerup", { clientX: comparisonBounds.x + comparisonBounds.width * 0.7, clientY: comparisonBounds.y + comparisonBounds.height / 2, pointerId: 1 });
  }
  assert(Math.abs(Number(await comparisonControl.inputValue()) - 70) <= 2, "Pointer interaction updates the comparison position");
  await comparison.screenshot({ path: path.resolve("tmp", "visual-comparison-desktop.png") });
  assert(errors.length === 0, `Desktop comparison emits no console or page errors${errors.length ? ` (${errors.join(" | ")})` : ""}`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  attachErrorCollection(mobile, "mobile ");
  await mobile.goto(url, { waitUntil: "domcontentloaded" });
  await mobile.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await mobile.waitForTimeout(2400);
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(mobileOverflow <= 1, "Mobile layout has no horizontal overflow");
  assert(await mobile.locator(".hero-title").isVisible(), "Hero remains visible at mobile width");
  await mobile.locator(".nav-toggle").click();
  await mobile.locator('nav a[href="#trpl-s-2"]').click();
  await mobile.waitForTimeout(950);
  assert(await mobile.locator('[data-project="trpl-S (2)"]').isVisible(), "trpl-S (2) comparison remains visible on mobile");
  await mobile.locator(".nav-toggle").click();
  await mobile.locator('nav a[href="#trpl-s-3"]').click();
  await mobile.waitForTimeout(950);
  assert((await mobile.evaluate(() => location.hash)) === "#trpl-s-3", "trpl-S (3) navigation works on mobile");
  assert(await mobile.locator('[data-project="trpl-S (3)"]').isVisible(), "trpl-S (3) comparison remains visible on mobile");
  await mobile.locator("#trpl-s-3").screenshot({ path: path.resolve("tmp", "trpl-s-3-mobile.png") });

  const mobileComparison = mobile.locator('[data-project="trpl-S (3)"]');
  assert(await mobileComparison.isVisible(), "Public comparison remains usable at mobile width");
  const activatedMobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(activatedMobileOverflow <= 1, "Activated comparison creates no mobile horizontal overflow");
  await mobileComparison.locator("[data-comparison-control]").fill("35");
  assert((await mobileComparison.locator("[data-comparison-control]").getAttribute("aria-valuetext")) === "65% original drawing and 35% concept visualization", "Mobile control updates its accessible percentage");
  await mobileComparison.screenshot({ path: path.resolve("tmp", "visual-comparison-mobile.png") });
  assert(errors.length === 0, `Mobile browser emits no console or page errors${errors.length ? ` (${errors.join(" | ")})` : ""}`);

  const reducedMotion = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  await reducedMotion.goto(url, { waitUntil: "domcontentloaded" });
  await reducedMotion.waitForTimeout(80);
  assert(await reducedMotion.locator(".reveal").first().evaluate((element) => getComputedStyle(element).opacity) === "1", "Reduced-motion preference keeps reveal content visible");
  assert(await reducedMotion.locator(".mark-line-green").evaluate((element) => Number.parseFloat(getComputedStyle(element).strokeDashoffset)) === 0, "Reduced-motion preference skips structural line drawing");
  await reducedMotion.close();

  const noScript = await browser.newPage({ viewport: { width: 1280, height: 720 }, javaScriptEnabled: false });
  await noScript.goto(url, { waitUntil: "domcontentloaded" });
  assert(await noScript.locator("#study-one-title").isVisible(), "Project content remains visible without JavaScript");
  assert(await noScript.locator("#trpl-s-1 [data-comparison-fallback]").isVisible(), "Original drawing fallback remains available without JavaScript");
  assert(await noScript.locator("#trpl-s-1 [data-visual-comparison]").isHidden(), "Uninitialized comparison controls stay hidden without JavaScript");
  await noScript.close();

  process.stdout.write(`${JSON.stringify({ url, checks, errors }, null, 2)}\n`);
} finally {
  await browser.close();
}
