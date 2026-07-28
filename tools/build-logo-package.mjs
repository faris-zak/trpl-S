import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dependencyRoot = process.env.NODE_PATH || "C:\\Users\\aalza\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const sharp = require(path.join(dependencyRoot, "sharp"));
const { chromium } = require(path.join(dependencyRoot, "playwright"));

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "brand", "trpl-s-logo-package");
const GRAPHITE = "#292725";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const dirs = ["master", "web", "print", "drawing-stamp", "concepts", "guide", "validation"];

function svgDocument(viewBox, body, { background = null, label = "trpl-S logo" } = {}) {
  const [x, y, width, height] = viewBox.split(" ").map(Number);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" role="img" aria-label="${label}">
  <title>${label}</title>
  ${background ? `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${background}"/>` : ""}
  ${body}
</svg>
`;
}

function triangleBand(outer, inner, fill) {
  const points = (list) => list.map(([x, y]) => `${x},${y}`).join(" ");
  return `<path d="M ${points(outer)} Z M ${points(inner)} Z" fill="${fill}" fill-rule="evenodd"/>`;
}

function spanSymbol(fill = GRAPHITE, compact = false) {
  const parts = compact
    ? [
        [[[18, 24], [236, 24], [127, 204]], [[58, 52], [196, 52], [127, 163]]],
        [[[145, 204], [338, 204], [242, 42]], [[188, 176], [294, 176], [242, 88]]],
        [[[62, 72], [198, 72], [130, 184]], [[103, 101], [157, 101], [130, 146]]],
      ]
    : [
        [[[18, 24], [236, 24], [127, 204]], [[52, 46], [202, 46], [127, 169]]],
        [[[145, 204], [338, 204], [242, 42]], [[181, 181], [301, 181], [242, 82]]],
        [[[62, 72], [198, 72], [130, 184]], [[96, 94], [164, 94], [130, 150]]],
      ];
  return `<g>${parts.map(([outer, inner]) => triangleBand(outer, inner, fill)).join("")}</g>`;
}

function trussSymbol(fill = GRAPHITE) {
  return `<g fill="${fill}" fill-rule="evenodd">
    <path d="M20 22H210L115 184ZM58 46H172L115 145Z"/>
    <path d="M112 36L220 196H82ZM114 82L174 172H114Z"/>
    <path d="M128 104L326 104L227 206ZM174 130H280L227 182Z"/>
  </g>`;
}

function apertureSymbol(fill = GRAPHITE, compact = false) {
  const nudge = compact ? 2 : 0;
  return `<g fill="${fill}">
    <path d="M142.5 10L210 146L190.5 184L142.5 71L123 130H82.5Z"/>
    <path d="M72 ${137 - nudge}H136.5L99 187L127.5 218H30Z"/>
    <path d="M214.5 ${149 - nudge}L270 218H139L110 187H211.5Z"/>
  </g>`;
}

function continuousSymbol(fill = GRAPHITE) {
  return `<path fill="${fill}" fill-rule="evenodd" d="M18 24H248L210 86H184L205 50H62L128 160L149 126L166 154L128 216ZM72 96H198L262 204H226L178 122H114L68 200H32L86 108ZM252 82L334 218H176L194 188H280L234 112Z"/>`;
}

function brandSymbol(fill = GRAPHITE, compact = false) {
  return apertureSymbol(fill, compact);
}

function wordmark(fill = GRAPHITE) {
  return `<g fill="${fill}" aria-label="trpl-S">
    <path d="M8 8H22V28H46V42H22V70L29 77H47V91H24L8 75V42H0V28H8Z"/>
    <path d="M58 28H72V34L80 28H108V42H80L72 50V91H58Z"/>
    <path fill-rule="evenodd" d="M118 28H160L176 44V70L160 86H132V108H118ZM132 42V72H154L162 64V50L154 42Z"/>
    <path d="M188 8H202V77H228V91H188Z"/>
    <path d="M240 52H274V66H240Z"/>
    <path d="M296 8H346V22H302L294 30V42L302 50H334L350 66V77L336 91H286V77H330L336 71V66L330 60H296L280 44V24Z"/>
  </g>`;
}

function symbolSvg(fill = GRAPHITE, background = null, compact = false) {
  return svgDocument("0 0 300 228", `<g transform="translate(0 0)">${brandSymbol(fill, compact)}</g>`, {
    background,
    label: "trpl-S interlocked triangle symbol",
  });
}

function wordmarkSvg(fill = GRAPHITE, background = null) {
  return svgDocument("0 0 350 116", `<g transform="translate(0 4)">${wordmark(fill)}</g>`, {
    background,
    label: "trpl-S custom geometric wordmark",
  });
}

function primarySvg(fill = GRAPHITE, background = null) {
  return svgDocument(
    "0 0 820 240",
    `<g transform="translate(18 6) scale(1)">${brandSymbol(fill)}</g><g transform="translate(370 64) scale(1.08)">${wordmark(fill)}</g>`,
    { background, label: "trpl-S primary horizontal logo" },
  );
}

function stackedSvg(fill = GRAPHITE, background = null) {
  return svgDocument(
    "0 0 430 390",
    `<g transform="translate(65 18)">${brandSymbol(fill)}</g><g transform="translate(40 258)">${wordmark(fill)}</g>`,
    { background, label: "trpl-S stacked logo" },
  );
}

function stampSvg(fill = GRAPHITE) {
  return svgDocument(
    "0 0 620 132",
    `<g transform="translate(8 4) scale(.52)">${brandSymbol(fill, true)}</g><g transform="translate(205 17) scale(.92)">${wordmark(fill)}</g>`,
    { label: "trpl-S drawing stamp" },
  );
}

function printTestSvg() {
  return svgDocument(
    "0 0 210 297",
    `<rect width="210" height="297" fill="${WHITE}"/>
    <text x="18" y="20" font-family="Arial, sans-serif" font-size="6" fill="${GRAPHITE}">trpl-S true-size print proof</text>
    <text x="18" y="34" font-family="Arial, sans-serif" font-size="3.5" fill="${GRAPHITE}">10 mm minimum symbol</text>
    <g transform="translate(18 39) scale(.03333)">${brandSymbol(BLACK, true)}</g>
    <text x="18" y="66" font-family="Arial, sans-serif" font-size="3.5" fill="${GRAPHITE}">32 mm minimum horizontal lockup</text>
    <g transform="translate(18 72) scale(.03902)">${brandSymbol(BLACK)}<g transform="translate(352 58) scale(1.08)">${wordmark(BLACK)}</g></g>
    <text x="18" y="106" font-family="Arial, sans-serif" font-size="3.5" fill="${GRAPHITE}">Drawing stamp / 42 mm recommended</text>
    <g transform="translate(18 112) scale(.06774)"><g transform="translate(8 4) scale(.52)">${brandSymbol(BLACK, true)}</g><g transform="translate(205 17) scale(.92)">${wordmark(BLACK)}</g></g>
    <text x="18" y="145" font-family="Arial, sans-serif" font-size="3.5" fill="${GRAPHITE}">Line reproduction reference</text>
    <path d="M18 155H95" stroke="${BLACK}" stroke-width=".25"/><text x="102" y="156" font-family="Arial, sans-serif" font-size="3" fill="${GRAPHITE}">0.25 mm</text>
    <path d="M18 166H95" stroke="${BLACK}" stroke-width=".35"/><text x="102" y="167" font-family="Arial, sans-serif" font-size="3" fill="${GRAPHITE}">0.35 mm</text>
    <path d="M18 177H95" stroke="${BLACK}" stroke-width=".5"/><text x="102" y="178" font-family="Arial, sans-serif" font-size="3" fill="${GRAPHITE}">0.50 mm</text>
    <rect x="18" y="205" width="174" height="58" fill="${GRAPHITE}"/>
    <g transform="translate(27 218) scale(.18)">${brandSymbol(WHITE, true)}</g>
    <g transform="translate(96 225) scale(.25)">${wordmark(WHITE)}</g>`,
    { label: "trpl-S true-size print proof" },
  );
}

const concepts = {
  truss: trussSymbol,
  span: spanSymbol,
  aperture: apertureSymbol,
  "continuous-frame": continuousSymbol,
};

function conceptSheet(name, symbolFn) {
  const title = name.replace(/(^|-)(\w)/g, (_, sep, letter) => `${sep ? " " : ""}${letter.toUpperCase()}`);
  return svgDocument(
    "0 0 1600 1000",
    `<rect width="1600" height="1000" fill="${WHITE}"/>
    <g transform="translate(80 80) scale(1.5)">${symbolFn(GRAPHITE)}</g>
    <g transform="translate(640 155) scale(1.55)">${wordmark(GRAPHITE)}</g>
    <g transform="translate(80 480)"><rect width="640" height="310" fill="${GRAPHITE}"/><g transform="translate(72 44) scale(1.35)">${symbolFn(WHITE)}</g></g>
    <g transform="translate(810 490)"><rect width="150" height="150" rx="0" fill="${WHITE}" stroke="${GRAPHITE}" stroke-width="2"/><g transform="translate(15 15) scale(.34)">${symbolFn(GRAPHITE)}</g></g>
    <g transform="translate(1010 490)"><rect width="150" height="150" fill="${GRAPHITE}"/><g transform="translate(15 15) scale(.34)">${symbolFn(WHITE)}</g></g>
    <g transform="translate(810 700) scale(.94)">${symbolFn(GRAPHITE)}</g><g transform="translate(1160 755) scale(.72)">${wordmark(GRAPHITE)}</g>
    <text x="80" y="910" font-family="Arial, sans-serif" font-size="30" fill="${GRAPHITE}">${title}</text>
    <text x="80" y="950" font-family="Arial, sans-serif" font-size="18" fill="${GRAPHITE}">symbol / horizontal lockup / reversed / favicon / drawing stamp</text>`,
    { label: `trpl-S ${title} concept comparison` },
  );
}

async function write(relative, content) {
  const target = path.join(OUT, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  return target;
}

async function rasterize(svg, relative, width, height = null) {
  const target = path.join(OUT, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  let pipeline = sharp(Buffer.from(svg));
  pipeline = height ? pipeline.resize(width, height, { fit: "contain" }) : pipeline.resize({ width });
  await pipeline.png({ compressionLevel: 9 }).toFile(target);
  return target;
}

async function svgToPdf(browser, svg, relative, widthMm, heightMm) {
  const target = path.join(OUT, relative);
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><style>@page{size:${widthMm}mm ${heightMm}mm;margin:0}html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${svg}`);
  await page.pdf({ path: target, width: `${widthMm}mm`, height: `${heightMm}mm`, margin: { top: 0, right: 0, bottom: 0, left: 0 }, printBackground: true });
  await page.close();
  return target;
}

async function buildGuidePdf(browser) {
  const target = path.join(OUT, "guide", "trpl-s-usage-guide.pdf");
  const primary = primarySvg().replace(/^<\?xml[^>]*>\s*/, "");
  const reversed = primarySvg(WHITE, GRAPHITE).replace(/^<\?xml[^>]*>\s*/, "");
  const symbol = symbolSvg().replace(/^<\?xml[^>]*>\s*/, "");
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:${GRAPHITE};margin:0;letter-spacing:0}h1{font-size:30pt;margin:0 0 8mm}h2{font-size:15pt;margin:0 0 5mm}p,li{font-size:10pt;line-height:1.45}section{break-after:page}.logo{height:62mm;display:flex;align-items:center}.logo svg{width:100%;height:auto}.swatches{display:flex;gap:8mm}.swatch{width:65mm}.chip{height:28mm;border:1px solid #ccc}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.rule{border-top:1px solid ${GRAPHITE};padding-top:4mm}.small{font-size:8.5pt}.avoid{border:1px solid #bbb;padding:6mm;min-height:40mm}.footer{margin-top:14mm;font-size:8pt}
  </style></head><body>
    <section><h1>trpl-S identity</h1><p>Version 1.1 / selected direction: Aperture</p><div class="logo">${primary}</div><p>Three structural forms turn around a central triangular opening. The mark is abstract, architectural, and intentionally free of hidden initials or a literal house silhouette.</p><div class="footer">Warm graphite. White space. Structural tension.</div></section>
    <section><h2>Logo configurations</h2><div class="logo">${primary}</div><div class="logo" style="background:${GRAPHITE};padding:10mm">${reversed}</div><p>Use the horizontal lockup by default. Use the stacked lockup where width is constrained, and the symbol alone only after the name is established or in icon contexts.</p></section>
    <section><h2>Color</h2><div class="swatches"><div class="swatch"><div class="chip" style="background:${GRAPHITE}"></div><p><strong>Warm graphite</strong><br>HEX ${GRAPHITE}<br>RGB 41 / 39 / 37</p></div><div class="swatch"><div class="chip" style="background:${WHITE}"></div><p><strong>White</strong><br>HEX ${WHITE}<br>RGB 255 / 255 / 255</p></div></div><p>For one-ink printing, use 100% process black. Do not introduce accent colors, gradients, metallic effects, or texture inside the logo.</p></section>
    <section><h2>Spacing and size</h2><div class="grid"><div>${symbol}</div><div><p class="rule"><strong>Clear space</strong><br>Keep free space equal to one frame thickness, X, around every side of the logo.</p><p class="rule"><strong>Minimum sizes</strong><br>Symbol: 16 px digital / 10 mm print<br>Horizontal lockup: 120 px digital / 32 mm print<br>Drawing stamp: 42 mm recommended</p></div></div><p>Use the dedicated small-size symbol for 16 px and 32 px favicons. It has optically reinforced openings.</p></section>
    <section><h2>Backgrounds and drawings</h2><div class="grid"><div class="avoid"><strong>Light fields</strong><p>Use the graphite mark on white, pale paper, or open areas of a drawing.</p></div><div class="avoid" style="background:${GRAPHITE};color:${WHITE}"><strong>Dark fields</strong><p>Use the white reversed mark on graphite or dense pencil shading.</p></div></div><p>Choose placement by local contrast. Never add a glow, shadow, outline, or enclosing badge to force legibility.</p></section>
    <section><h2>Do not</h2><div class="grid small"><div class="avoid">Do not stretch, rotate, skew, or rearrange the triangles.</div><div class="avoid">Do not recolor, add gradients, or apply pencil texture inside the mark.</div><div class="avoid">Do not typeset trpl-S in a substitute font.</div><div class="avoid">Do not place the mark over visually busy detail without sufficient contrast.</div></div><p class="footer">Master artwork is path-based and contains no font dependency.</p></section>
  </body></html>`);
  await page.pdf({ path: target, format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  await page.close();
}

async function buildValidationMatrix() {
  const canvas = sharp({ create: { width: 1800, height: 1100, channels: 4, background: WHITE } });
  const graphitePanel = Buffer.from(svgDocument("0 0 850 450", `<rect width="850" height="450" fill="${GRAPHITE}"/><g transform="translate(50 105)">${primarySvg(WHITE).replace(/^<\?xml[^>]*>\s*/, "")}</g>`));
  const whitePanel = Buffer.from(svgDocument("0 0 850 450", `<rect width="850" height="450" fill="${WHITE}"/><g transform="translate(50 105)">${primarySvg(GRAPHITE).replace(/^<\?xml[^>]*>\s*/, "")}</g>`));
  const stampDark = Buffer.from(stampSvg(GRAPHITE));
  const stampLight = Buffer.from(stampSvg(WHITE));
  const composites = [
    { input: await sharp(whitePanel).resize(850, 450).png().toBuffer(), left: 50, top: 50 },
    { input: await sharp(graphitePanel).resize(850, 450).png().toBuffer(), left: 900, top: 50 },
  ];
  const drawing = process.env.TRPLS_REFERENCE_DRAWING || "C:\\Users\\aalza\\AppData\\Local\\Temp\\codex-clipboard-0027a243-bd7c-4038-9bf3-a2f997744a13.png";
  try {
    const drawingBase = await sharp(drawing).resize(1700, 520, { fit: "cover", position: "centre" }).grayscale().png().toBuffer();
    composites.push({ input: drawingBase, left: 50, top: 530 });
    composites.push({ input: await sharp(stampDark).resize(520).png().toBuffer(), left: 100, top: 880 });
    composites.push({ input: await sharp(stampLight).resize(520).png().toBuffer(), left: 710, top: 850 });
  } catch {
    const fallback = await sharp({ create: { width: 1700, height: 520, channels: 4, background: "#D8D5D1" } }).png().toBuffer();
    composites.push({ input: fallback, left: 50, top: 530 });
  }
  await canvas.composite(composites).png().toFile(path.join(OUT, "validation", "trpl-s-context-matrix.png"));
  await sharp(path.join(OUT, "web", "favicon-16.png"))
    .resize(320, 320, { kernel: "nearest" })
    .png()
    .toFile(path.join(OUT, "validation", "favicon-16-pixel-check.png"));
}

async function build() {
  for (const dir of dirs) await fs.mkdir(path.join(OUT, dir), { recursive: true });

  const masters = {
    "master/trpl-s-primary-positive.svg": primarySvg(GRAPHITE),
    "master/trpl-s-primary-reversed.svg": primarySvg(WHITE, GRAPHITE),
    "master/trpl-s-primary-transparent.svg": primarySvg(GRAPHITE),
    "master/trpl-s-primary-black.svg": primarySvg(BLACK),
    "master/trpl-s-stacked-positive.svg": stackedSvg(GRAPHITE),
    "master/trpl-s-stacked-reversed.svg": stackedSvg(WHITE, GRAPHITE),
    "master/trpl-s-symbol-positive.svg": symbolSvg(GRAPHITE),
    "master/trpl-s-symbol-reversed.svg": symbolSvg(WHITE, GRAPHITE),
    "master/trpl-s-symbol-small.svg": symbolSvg(GRAPHITE, null, true),
    "master/trpl-s-wordmark-positive.svg": wordmarkSvg(GRAPHITE),
    "master/trpl-s-wordmark-reversed.svg": wordmarkSvg(WHITE, GRAPHITE),
    "drawing-stamp/trpl-s-stamp-dark.svg": stampSvg(GRAPHITE),
    "drawing-stamp/trpl-s-stamp-light.svg": stampSvg(WHITE),
  };
  for (const [relative, content] of Object.entries(masters)) await write(relative, content);

  for (const [name, fn] of Object.entries(concepts)) {
    const sheet = conceptSheet(name, fn);
    await write(`concepts/${name}-comparison.svg`, sheet);
    await rasterize(sheet, `concepts/${name}-comparison.png`, 1600, 1000);
  }

  const pngExports = [
    [primarySvg(), "web/trpl-s-primary-1x.png", 820, 240],
    [primarySvg(), "web/trpl-s-primary-2x.png", 1640, 480],
    [primarySvg(), "web/trpl-s-primary-4x.png", 3280, 960],
    [stackedSvg(), "web/trpl-s-stacked-1x.png", 430, 390],
    [stackedSvg(), "web/trpl-s-stacked-2x.png", 860, 780],
    [stackedSvg(), "web/trpl-s-stacked-4x.png", 1720, 1560],
    [symbolSvg(), "web/trpl-s-symbol-1x.png", 356, 228],
    [symbolSvg(), "web/trpl-s-symbol-2x.png", 712, 456],
    [symbolSvg(), "web/trpl-s-symbol-4x.png", 1424, 912],
    [wordmarkSvg(), "web/trpl-s-wordmark-1x.png", 350, 116],
    [wordmarkSvg(), "web/trpl-s-wordmark-2x.png", 700, 232],
    [wordmarkSvg(), "web/trpl-s-wordmark-4x.png", 1400, 464],
    [primarySvg(WHITE), "web/trpl-s-primary-reversed-2x.png", 1640, 480],
    [symbolSvg(GRAPHITE, null, true), "web/favicon-16.png", 16, 16],
    [symbolSvg(GRAPHITE, null, true), "web/favicon-32.png", 32, 32],
    [symbolSvg(), "web/apple-touch-icon-180.png", 180, 180],
    [symbolSvg(), "web/icon-192.png", 192, 192],
    [symbolSvg(), "web/icon-512.png", 512, 512],
    [stampSvg(GRAPHITE), "drawing-stamp/trpl-s-stamp-dark.png", 1240, 264],
    [stampSvg(WHITE), "drawing-stamp/trpl-s-stamp-light.png", 1240, 264],
  ];
  for (const [svg, relative, width, height] of pngExports) await rasterize(svg, relative, width, height);

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.TRPLS_BROWSER || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  await svgToPdf(browser, primarySvg(), "print/trpl-s-primary-graphite.pdf", 180, 52.7);
  await svgToPdf(browser, primarySvg(BLACK), "print/trpl-s-primary-black.pdf", 180, 52.7);
  await svgToPdf(browser, stackedSvg(), "print/trpl-s-stacked-graphite.pdf", 100, 90.7);
  await svgToPdf(browser, stackedSvg(BLACK), "print/trpl-s-stacked-black.pdf", 100, 90.7);
  await svgToPdf(browser, stackedSvg(), "print/trpl-s-portfolio-cover-lockup.pdf", 100, 90.7);
  await svgToPdf(browser, primarySvg(), "print/trpl-s-title-page-lockup.pdf", 180, 52.7);
  await svgToPdf(browser, stampSvg(BLACK), "print/trpl-s-drawing-sheet-lockup.pdf", 100, 21.3);
  await svgToPdf(browser, printTestSvg(), "validation/trpl-s-print-test-a4.pdf", 210, 297);
  await buildGuidePdf(browser);
  await browser.close();

  await buildValidationMatrix();

  const files = [];
  async function collect(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) await collect(absolute);
      else if (!absolute.endsWith("manifest.json")) {
        const data = await fs.readFile(absolute);
        files.push({
          path: path.relative(OUT, absolute).replaceAll("\\", "/"),
          bytes: data.length,
          sha256: crypto.createHash("sha256").update(data).digest("hex"),
        });
      }
    }
  }
  await collect(OUT);
  files.sort((a, b) => a.path.localeCompare(b.path));
  await write("manifest.json", JSON.stringify({ brand: "trpl-S", version: "1.1.0", selectedDirection: "Aperture", colors: { graphite: GRAPHITE, white: WHITE, oneInk: BLACK }, files }, null, 2) + "\n");
}

await build();
