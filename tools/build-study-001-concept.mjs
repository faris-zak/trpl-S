import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dependencyRoot = process.env.NODE_PATH || "C:\\Users\\aalza\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const sharp = require(path.join(dependencyRoot, "sharp"));
const { chromium } = require(path.join(dependencyRoot, "playwright"));

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_OUT = path.join(ROOT, "assets", "study-001-development");
const PDF_OUT = path.join(ROOT, "output", "pdf");
const WIDTH = 1600;
const HEIGHT = 1131;

const C = {
  graphite: "#292725",
  mid: "#77716b",
  pale: "#eeeae4",
  paper: "#fbfaf8",
  white: "#ffffff",
  glass: "#cdd8da",
  timber: "#c6aa85",
  green: "#aeb8a6",
  water: "#b7cdd1",
  line: "#b9b2aa",
};

const fmt = (value) => Number(value.toFixed(2));
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function text(x, y, value, size = 18, options = {}) {
  const { weight = 400, anchor = "start", fill = C.graphite, tracking = 0, rotate = null, italic = false } = options;
  const transform = rotate == null ? "" : ` transform="rotate(${rotate} ${x} ${y})"`;
  return `<text x="${fmt(x)}" y="${fmt(y)}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" font-style="${italic ? "italic" : "normal"}" text-anchor="${anchor}" letter-spacing="${tracking}" fill="${fill}"${transform}>${esc(value)}</text>`;
}

function line(x1, y1, x2, y2, options = {}) {
  const { stroke = C.graphite, width = 2, dash = "", opacity = 1 } = options;
  return `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="${dash}" opacity="${opacity}"/>`;
}

function rect(x, y, width, height, options = {}) {
  const { fill = "none", stroke = C.graphite, sw = 2, rx = 0, opacity = 1, dash = "" } = options;
  return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="${dash}" opacity="${opacity}"/>`;
}

function polygon(points, options = {}) {
  const { fill = "none", stroke = C.graphite, sw = 2, opacity = 1 } = options;
  return `<polygon points="${points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function polyline(points, options = {}) {
  const { fill = "none", stroke = C.graphite, sw = 2, dash = "" } = options;
  return `<polyline points="${points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="${dash}"/>`;
}

function circle(cx, cy, radius, options = {}) {
  const { fill = "none", stroke = C.graphite, sw = 2, opacity = 1 } = options;
  return `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function svgDocument(body, label) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${C.paper}"/>
  ${body}
</svg>`;
}

function detailDocument(width, height, body, label) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <rect width="${width}" height="${height}" fill="${C.paper}"/>
  ${body}
</svg>`;
}

function boardHeader(index, titleValue, subtitle) {
  return [
    text(58, 62, `STUDY 001 / ${index}`, 13, { weight: 700, tracking: 2 }),
    text(58, 116, titleValue, 42, { weight: 500 }),
    text(1540, 64, "trpl-S", 22, { weight: 700, anchor: "end" }),
    text(1540, 92, subtitle, 12, { anchor: "end", fill: C.mid }),
    line(58, 142, 1542, 142, { width: 1.5 }),
  ].join("");
}

function boardFooter(page, note) {
  return [
    line(58, 1074, 1542, 1074, { stroke: C.line, width: 1 }),
    text(58, 1104, note, 11, { fill: C.mid }),
    text(800, 1104, "CONCEPT DESIGN - NOT FOR CONSTRUCTION", 11, { weight: 700, anchor: "middle", tracking: 1.2 }),
    text(1542, 1104, `A1 / ${page} OF 3`, 11, { weight: 700, anchor: "end" }),
  ].join("");
}

function titleBlock(x, y, titleValue, subtitle) {
  return [
    text(x, y, titleValue.toUpperCase(), 14, { weight: 700, tracking: 1.5 }),
    text(x, y + 24, subtitle, 11, { fill: C.mid }),
  ].join("");
}

function northArrow(x, y, scale = 1) {
  return [
    line(x, y + 28 * scale, x, y - 20 * scale, { width: 2 }),
    polygon([[x, y - 30 * scale], [x - 7 * scale, y - 16 * scale], [x + 7 * scale, y - 16 * scale]], { fill: C.graphite, sw: 0 }),
    text(x, y - 40 * scale, "N", 12 * scale, { weight: 700, anchor: "middle" }),
  ].join("");
}

function dimension(x1, y1, x2, y2, label, offset = 0, vertical = false) {
  if (vertical) {
    const x = x1 + offset;
    return [line(x, y1, x, y2, { stroke: C.mid, width: 1 }), line(x - 5, y1, x + 5, y1, { stroke: C.mid, width: 1 }), line(x - 5, y2, x + 5, y2, { stroke: C.mid, width: 1 }), text(x + 8, (y1 + y2) / 2, label, 10, { fill: C.mid, rotate: -90, anchor: "middle" })].join("");
  }
  const y = y1 + offset;
  return [line(x1, y, x2, y, { stroke: C.mid, width: 1 }), line(x1, y - 5, x1, y + 5, { stroke: C.mid, width: 1 }), line(x2, y - 5, x2, y + 5, { stroke: C.mid, width: 1 }), text((x1 + x2) / 2, y - 7, label, 10, { fill: C.mid, anchor: "middle" })].join("");
}

function room(px, py, scale, data) {
  const { x, y, w, h, name, detail = "", fill = C.white, labelSize = 11 } = data;
  const rx = px + x * scale;
  const ry = py + y * scale;
  const rw = w * scale;
  const rh = h * scale;
  const centerX = rx + rw / 2;
  const centerY = ry + rh / 2;
  return [
    rect(rx, ry, rw, rh, { fill, stroke: C.line, sw: 1 }),
    text(centerX, centerY - (detail ? 3 : -3), name.toUpperCase(), labelSize, { weight: 700, anchor: "middle", tracking: 0.5 }),
    detail ? text(centerX, centerY + 14, detail, 9, { anchor: "middle", fill: C.mid }) : "",
  ].join("");
}

function bed(x, y, w, h) {
  return [rect(x, y, w, h, { fill: C.pale, stroke: C.mid, sw: 1 }), rect(x + 5, y + 5, w / 2 - 7, 16, { fill: C.white, stroke: C.line, sw: 1 }), rect(x + w / 2 + 2, y + 5, w / 2 - 7, 16, { fill: C.white, stroke: C.line, sw: 1 }), line(x + 4, y + 25, x + w - 4, y + 25, { stroke: C.line, width: 1 })].join("");
}

function sofa(x, y, w, h) {
  return [rect(x, y, w, h, { fill: C.pale, stroke: C.mid, sw: 1, rx: 4 }), line(x + 8, y + 5, x + 8, y + h - 5, { stroke: C.line, width: 1 }), line(x + w - 8, y + 5, x + w - 8, y + h - 5, { stroke: C.line, width: 1 })].join("");
}

function door(x, y, radius, flip = false) {
  const endX = x + (flip ? -radius : radius);
  const sweep = flip ? 0 : 1;
  return `${line(x, y, endX, y - radius, { stroke: C.mid, width: 1.2 })}<path d="M ${fmt(x)} ${fmt(y - radius)} A ${radius} ${radius} 0 0 ${sweep} ${fmt(endX)} ${fmt(y)}" fill="none" stroke="${C.line}" stroke-width="1"/>`;
}

function stair(x, y, width, height, steps = 10) {
  const result = [rect(x, y, width, height, { fill: C.white, stroke: C.mid, sw: 1 })];
  for (let i = 1; i < steps; i += 1) result.push(line(x, y + (height / steps) * i, x + width, y + (height / steps) * i, { stroke: C.line, width: 1 }));
  result.push(line(x + width / 2, y + height - 8, x + width / 2, y + 14, { stroke: C.graphite, width: 1.5 }));
  result.push(polygon([[x + width / 2, y + 8], [x + width / 2 - 4, y + 17], [x + width / 2 + 4, y + 17]], { fill: C.graphite, sw: 0 }));
  return result.join("");
}

function drawSitePlan(x, y, scale) {
  const plotW = 30 * scale;
  const plotH = 25 * scale;
  const hx = x + 6 * scale;
  const hy = y + 5 * scale;
  const houseW = 18 * scale;
  const houseH = 13.5 * scale;
  const poolX = x + 12 * scale;
  const poolY = y + 19.7 * scale;
  const parts = [
    rect(x, y, plotW, plotH, { fill: C.white, stroke: C.graphite, sw: 2 }),
    rect(x, y - 20, plotW, 18, { fill: C.pale, stroke: "none", sw: 0 }),
    text(x + plotW / 2, y - 8, "NORTH ROAD", 10, { weight: 700, anchor: "middle", tracking: 1.5 }),
    rect(hx, hy, houseW, houseH, { fill: C.pale, stroke: C.graphite, sw: 2.5 }),
    text(hx + houseW / 2, hy + houseH / 2, "HOUSE", 13, { weight: 700, anchor: "middle", tracking: 1.5 }),
    text(hx + houseW / 2, hy + houseH / 2 + 18, "18.0 x 13.5 m", 10, { anchor: "middle", fill: C.mid }),
    rect(x + 0.5 * scale, y + 4.7 * scale, 5 * scale, 6 * scale, { fill: C.graphite, stroke: "none", sw: 0, opacity: 0.82 }),
    line(x + 3 * scale, y + 5.2 * scale, x + 3 * scale, y + 10.2 * scale, { stroke: C.white, width: 1 }),
    text(x + 3 * scale, y + 7.8 * scale, "2 CAR", 9, { fill: C.white, weight: 700, anchor: "middle" }),
    text(x + 3 * scale, y + 9.2 * scale, "CARPORT", 9, { fill: C.white, weight: 700, anchor: "middle" }),
    rect(hx, y + 18.5 * scale, houseW, 2.5 * scale, { fill: C.timber, stroke: C.graphite, sw: 1, opacity: 0.75 }),
    text(hx + 2.6 * scale, y + 20.05 * scale, "SHADED TERRACE", 9, { weight: 700, anchor: "middle" }),
    rect(poolX, poolY, 10 * scale, 3 * scale, { fill: C.water, stroke: C.graphite, sw: 1.5 }),
    text(poolX + 5 * scale, poolY + 1.75 * scale, "10 x 3 m POOL", 9, { weight: 700, anchor: "middle" }),
    polyline([[x + 8.5 * scale, y], [x + 8.5 * scale, y + 3.2 * scale], [x + 15 * scale, y + 5 * scale]], { stroke: C.mid, sw: 1.5, dash: "5 4" }),
    text(x + 11.5 * scale, y + 2.4 * scale, "PEDESTRIAN ARRIVAL", 8, { fill: C.mid, anchor: "middle" }),
    dimension(x, y, x + plotW, y, "30.0 m", -31),
    dimension(x, y, x, y + plotH, "25.0 m", -20, true),
    northArrow(x + plotW - 24, y + 30, 0.72),
  ];
  const trees = [[2, 15], [3, 21], [27, 4], [27, 12], [27, 21], [7, 22], [23, 23]];
  trees.forEach(([tx, ty]) => {
    parts.push(circle(x + tx * scale, y + ty * scale, 9, { fill: C.green, stroke: C.graphite, sw: 1, opacity: 0.75 }));
    parts.push(circle(x + tx * scale + 5, y + ty * scale - 4, 5, { fill: C.paper, stroke: C.mid, sw: 0.8 }));
  });
  return parts.join("");
}

function drawGroundPlan(px, py, scale) {
  const w = 18 * scale;
  const h = 13.5 * scale;
  const parts = [
    rect(px, py, w, h, { fill: C.white, stroke: C.graphite, sw: 5 }),
    room(px, py, scale, { x: 0, y: 0, w: 5.2, h: 4.2, name: "Hybrid studio", detail: "clean + making bay", fill: "#f2eee8" }),
    room(px, py, scale, { x: 0, y: 4.2, w: 4.2, h: 4, name: "", detail: "" }),
    room(px, py, scale, { x: 4.2, y: 4.2, w: 2.4, h: 2.2, name: "Ensuite", labelSize: 9 }),
    room(px, py, scale, { x: 7.5, y: 0, w: 3, h: 3, name: "Foyer", detail: "screened entry" }),
    room(px, py, scale, { x: 14.5, y: 1.6, w: 3.5, h: 5.4, name: "Stair", detail: "east glass wall", fill: "#eef3f3", labelSize: 9 }),
    room(px, py, scale, { x: 12, y: 7.5, w: 6, h: 6, name: "Family living", detail: "double-height edge", fill: "#edf2f1", labelSize: 8 }),
    room(px, py, scale, { x: 7.5, y: 9.5, w: 4.5, h: 4, name: "Dining", detail: "opens to terrace" }),
    room(px, py, scale, { x: 0, y: 9.3, w: 4.5, h: 4.2, name: "Closed kitchen", detail: "4.5 x 4.2 m", fill: "#f1ede7" }),
    room(px, py, scale, { x: 4.5, y: 9.3, w: 3, h: 2.1, name: "Pantry", labelSize: 9 }),
    room(px, py, scale, { x: 4.5, y: 11.4, w: 3, h: 2.1, name: "Laundry", labelSize: 9 }),
    room(px, py, scale, { x: 6.6, y: 4.2, w: 2.1, h: 2.2, name: "Powder", labelSize: 9 }),
    room(px, py, scale, { x: 7, y: 6.5, w: 5, h: 3, name: "Gallery", detail: "family circulation", fill: C.paper }),
    stair(px + 15 * scale, py + 1.9 * scale, 2.5 * scale, 4.8 * scale, 11),
    bed(px + 0.45 * scale, py + 4.7 * scale, 2.4 * scale, 2.7 * scale),
    text(px + 3.45 * scale, py + 6.0 * scale, "GUEST", 8, { weight: 700, anchor: "middle" }),
    text(px + 3.45 * scale, py + 6.55 * scale, "4.2 x 4.0 m", 8, { anchor: "middle", fill: C.mid }),
    sofa(px + 12.5 * scale, py + 8.2 * scale, 3.8 * scale, 0.8 * scale),
    sofa(px + 16.3 * scale, py + 9 * scale, 0.9 * scale, 3 * scale),
    rect(px + 8.3 * scale, py + 10.2 * scale, 2.7 * scale, 1.4 * scale, { fill: C.pale, stroke: C.mid, sw: 1, rx: 6 }),
    rect(px + 0.5 * scale, py + 0.55 * scale, 3 * scale, 1 * scale, { fill: C.white, stroke: C.mid, sw: 1 }),
    rect(px + 0.55 * scale, py + 2.2 * scale, 1.3 * scale, 1.2 * scale, { fill: C.pale, stroke: C.mid, sw: 1 }),
    door(px + 8.4 * scale, py, 0.9 * scale),
    dimension(px, py, px + w, py, "18.0 m", -24),
    dimension(px, py, px, py + h, "13.5 m", -16, true),
    northArrow(px + w - 18, py + 40, 0.55),
  ];
  [8.2, 9.2, 10.2, 11.2, 12.2].forEach((sx) => parts.push(line(px + sx * scale, py + 10.2 * scale, px + sx * scale, py + 11.6 * scale, { stroke: C.mid, width: 1 })));
  return parts.join("");
}

function drawFirstPlan(px, py, scale) {
  const w = 18 * scale;
  const h = 13.5 * scale;
  const parts = [
    rect(px, py, w, h, { fill: C.white, stroke: C.graphite, sw: 5 }),
    room(px, py, scale, { x: 0, y: 0, w: 4.1, h: 4.2, name: "", detail: "" }),
    room(px, py, scale, { x: 4.1, y: 0, w: 2.4, h: 2.2, name: "Ensuite", labelSize: 9 }),
    room(px, py, scale, { x: 13.9, y: 0, w: 4.1, h: 4.2, name: "", detail: "" }),
    room(px, py, scale, { x: 11.5, y: 0, w: 2.4, h: 2.2, name: "Ensuite", labelSize: 9 }),
    room(px, py, scale, { x: 12.5, y: 4.2, w: 5.5, h: 4.7, name: "Family lounge", detail: "east frame view", fill: "#eef3f3" }),
    room(px, py, scale, { x: 0, y: 9, w: 5, h: 4.5, name: "", detail: "", fill: "#f2eee8" }),
    room(px, py, scale, { x: 5, y: 9, w: 3, h: 2.4, name: "Dressing", labelSize: 9 }),
    room(px, py, scale, { x: 5, y: 11.4, w: 3, h: 2.1, name: "Master bath", labelSize: 9 }),
    room(px, py, scale, { x: 7.4, y: 3.6, w: 5.1, h: 5.4, name: "Bridge gallery", detail: "linen + circulation", fill: C.paper }),
    room(px, py, scale, { x: 12.5, y: 8.9, w: 5.5, h: 4.6, name: "Living void", detail: "open to ground", fill: C.paper }),
    rect(px + 0.3 * scale, py + 13.5 * scale, 8 * scale, 1.15 * scale, { fill: C.timber, stroke: C.graphite, sw: 1.5 }),
    text(px + 4.15 * scale, py + 14.2 * scale, "PRIVATE GARDEN BALCONY", 9, { weight: 700, anchor: "middle" }),
    bed(px + 0.5 * scale, py + 0.6 * scale, 2.5 * scale, 2.7 * scale),
    bed(px + 15 * scale, py + 0.6 * scale, 2.5 * scale, 2.7 * scale),
    bed(px + 0.6 * scale, py + 9.5 * scale, 2.8 * scale, 3.2 * scale),
    text(px + 3.55 * scale, py + 2.0 * scale, "BEDROOM 2", 8, { weight: 700, anchor: "middle" }),
    text(px + 3.55 * scale, py + 2.55 * scale, "ensuite", 8, { anchor: "middle", fill: C.mid }),
    text(px + 14.45 * scale, py + 2.0 * scale, "BEDROOM 3", 8, { weight: 700, anchor: "middle" }),
    text(px + 14.45 * scale, py + 2.55 * scale, "ensuite", 8, { anchor: "middle", fill: C.mid }),
    text(px + 4.2 * scale, py + 11.1 * scale, "MASTER", 8, { weight: 700, anchor: "middle" }),
    text(px + 4.2 * scale, py + 11.65 * scale, "garden outlook", 8, { anchor: "middle", fill: C.mid }),
    sofa(px + 13.1 * scale, py + 5 * scale, 3.6 * scale, 0.85 * scale),
    polyline([[px + 13 * scale, py + 9.4 * scale], [px + 17.5 * scale, py + 9.4 * scale], [px + 17.5 * scale, py + 13 * scale], [px + 13 * scale, py + 13 * scale], [px + 13 * scale, py + 9.4 * scale]], { stroke: C.mid, sw: 1.2, dash: "7 5" }),
    dimension(px, py, px + w, py, "18.0 m", -24),
    dimension(px, py, px, py + h, "13.5 m", -16, true),
    northArrow(px + w - 18, py + 40, 0.55),
  ];
  return parts.join("");
}

function boardArrangement() {
  return svgDocument([
    boardHeader("01", "House arrangement", "Site + ground floor + first floor"),
    titleBlock(58, 184, "Site plan", "Assumed 30 x 25 m plot / 1:200 diagram"),
    drawSitePlan(72, 258, 14.2),
    titleBlock(548, 184, "Ground floor", "Approx. 220 sq m / family + guest + hybrid studio"),
    drawGroundPlan(565, 276, 24.2),
    titleBlock(1050, 184, "First floor", "Approx. 170 sq m / three bedrooms + family lounge"),
    drawFirstPlan(1066, 276, 24.2),
    text(58, 962, "PROGRAM CHECK", 12, { weight: 700, tracking: 1.2 }),
    text(58, 991, "4 bedrooms total", 20, { weight: 700 }),
    text(240, 991, "1 guest ground", 14, { fill: C.mid }),
    text(240, 1014, "3 bedrooms upper", 14, { fill: C.mid }),
    text(478, 991, "No majlis", 14, { weight: 700 }),
    text(478, 1014, "No maid accommodation", 14, { fill: C.mid }),
    text(694, 991, "East frame serves", 14, { weight: 700 }),
    text(694, 1014, "stair + family living", 14, { fill: C.mid }),
    text(962, 991, "Upper floor occupied", 14, { weight: 700 }),
    text(962, 1014, "limited living void only", 14, { fill: C.mid }),
    boardFooter(1, "Areas and dimensions are indicative and require local consultant verification."),
  ].join(""), "Study 001 house arrangement board");
}

function treeElevation(x, baseY, scale = 1) {
  return [line(x, baseY, x, baseY - 52 * scale, { stroke: C.mid, width: 2 }), circle(x, baseY - 70 * scale, 30 * scale, { fill: C.green, stroke: C.mid, sw: 1, opacity: 0.7 }), circle(x - 17 * scale, baseY - 62 * scale, 19 * scale, { fill: C.paper, stroke: C.mid, sw: 1, opacity: 0.8 })].join("");
}

function person(x, baseY, scale = 1) {
  return [circle(x, baseY - 38 * scale, 5 * scale, { fill: C.graphite, stroke: "none", sw: 0 }), line(x, baseY - 32 * scale, x, baseY - 14 * scale, { width: 2 * scale }), line(x, baseY - 25 * scale, x - 7 * scale, baseY - 18 * scale, { width: 2 * scale }), line(x, baseY - 25 * scale, x + 7 * scale, baseY - 18 * scale, { width: 2 * scale }), line(x, baseY - 14 * scale, x - 6 * scale, baseY, { width: 2 * scale }), line(x, baseY - 14 * scale, x + 6 * scale, baseY, { width: 2 * scale })].join("");
}

function elevationBase(x, y, width, height) {
  return [line(x, y + height, x + width, y + height, { width: 2 }), rect(x + 30, y + 44, width - 60, height - 44, { fill: C.pale, stroke: C.graphite, sw: 2 }), rect(x + 18, y + 28, width - 36, 18, { fill: C.graphite, stroke: "none", sw: 0 })].join("");
}

function drawNorthElevation(x, y, width = 660, height = 300) {
  const parts = [elevationBase(x, y, width, height)];
  parts.push(rect(x + 300, y + 155, 70, 145, { fill: C.graphite, stroke: C.graphite, sw: 2 }));
  parts.push(rect(x + 310, y + 168, 50, 132, { fill: C.timber, stroke: C.graphite, sw: 1 }));
  parts.push(rect(x + 70, y + 170, 145, 62, { fill: C.glass, stroke: C.graphite, sw: 2 }));
  for (let i = 1; i < 4; i += 1) parts.push(line(x + 70 + i * 36.25, y + 170, x + 70 + i * 36.25, y + 232, { stroke: C.mid, width: 1 }));
  parts.push(rect(x + 86, y + 78, 92, 46, { fill: C.glass, stroke: C.graphite, sw: 2 }));
  parts.push(rect(x + 476, y + 78, 88, 46, { fill: C.glass, stroke: C.graphite, sw: 2 }));
  parts.push(polygon([[x + 550, y + 46], [x + 630, y + 300], [x + 608, y + 300], [x + 526, y + 46]], { fill: C.graphite, stroke: C.graphite, sw: 1 }));
  parts.push(rect(x + 10, y + 216, 130, 84, { fill: C.graphite, stroke: C.graphite, sw: 1, opacity: 0.85 }));
  parts.push(line(x + 75, y + 218, x + 75, y + 298, { stroke: C.white, width: 1 }));
  parts.push(treeElevation(x + 615, y + height, 0.75));
  parts.push(person(x + 392, y + height, 0.85));
  parts.push(text(x + width / 2, y + height + 31, "NORTH / ARRIVAL", 12, { weight: 700, anchor: "middle", tracking: 1.2 }));
  return parts.join("");
}

function drawEastElevation(x, y, width = 660, height = 300) {
  const parts = [line(x, y + height, x + width, y + height, { width: 2 })];
  parts.push(rect(x + 55, y + 55, width - 110, height - 55, { fill: C.glass, stroke: C.graphite, sw: 2 }));
  parts.push(rect(x + 18, y + 28, width - 36, 18, { fill: C.graphite, stroke: "none", sw: 0 }));
  parts.push(rect(x + 70, y + 132, width - 140, 13, { fill: C.graphite, stroke: "none", sw: 0 }));
  for (let i = 0; i < 8; i += 1) parts.push(line(x + 85 + i * 70, y + 46, x + 85 + i * 70, y + 132, { stroke: C.mid, width: 2 }));
  parts.push(polygon([[x + 48, y + 48], [x + 330, y + 283], [x + 612, y + 48], [x + 585, y + 48], [x + 330, y + 254], [x + 75, y + 48]], { fill: C.graphite, stroke: C.graphite, sw: 1 }));
  parts.push(polygon([[x + 42, y + 300], [x + 382, y + 48], [x + 418, y + 48], [x + 78, y + 300]], { fill: C.pale, stroke: C.graphite, sw: 3 }));
  parts.push(polyline([[x + 430, y + 276], [x + 490, y + 224], [x + 430, y + 172], [x + 490, y + 120]], { stroke: C.graphite, sw: 5 }));
  parts.push(line(x + 55, y + 205, x + 605, y + 205, { stroke: C.mid, width: 1.5 }));
  parts.push(text(x + 505, y + 100, "OCCUPIED UPPER FLOOR", 9, { weight: 700, anchor: "middle", fill: C.graphite }));
  parts.push(person(x + 520, y + height, 0.85));
  parts.push(text(x + width / 2, y + height + 31, "EAST / ORIGINAL RIGHT SIDE", 12, { weight: 700, anchor: "middle", tracking: 1.2 }));
  return parts.join("");
}

function drawSouthElevation(x, y, width = 660, height = 300) {
  const parts = [elevationBase(x, y, width, height)];
  parts.push(rect(x + 54, y + 177, 552, 123, { fill: C.glass, stroke: C.graphite, sw: 2 }));
  for (let i = 1; i < 8; i += 1) parts.push(line(x + 54 + i * 69, y + 177, x + 54 + i * 69, y + 300, { stroke: C.mid, width: 1.3 }));
  parts.push(rect(x + 78, y + 98, 300, 52, { fill: C.glass, stroke: C.graphite, sw: 2 }));
  parts.push(rect(x + 56, y + 154, 350, 16, { fill: C.timber, stroke: C.graphite, sw: 1 }));
  for (let i = 0; i < 7; i += 1) parts.push(rect(x + 416 + i * 24, y + 70, 8, 102, { fill: C.graphite, stroke: "none", sw: 0 }));
  parts.push(rect(x + 140, y + 312, 380, 18, { fill: C.water, stroke: C.graphite, sw: 1 }));
  parts.push(treeElevation(x + 620, y + height, 0.72));
  parts.push(person(x + 420, y + height, 0.85));
  parts.push(text(x + width / 2, y + height + 48, "SOUTH / TERRACE + POOL", 12, { weight: 700, anchor: "middle", tracking: 1.2 }));
  return parts.join("");
}

function drawWestElevation(x, y, width = 660, height = 300) {
  const parts = [elevationBase(x, y, width, height)];
  [[72, 84, 80, 42], [200, 84, 54, 42], [362, 84, 74, 42], [504, 84, 58, 42], [92, 196, 62, 38], [238, 196, 52, 38], [382, 196, 86, 38]].forEach(([wx, wy, ww, wh]) => parts.push(rect(x + wx, y + wy, ww, wh, { fill: C.glass, stroke: C.graphite, sw: 2 })));
  parts.push(rect(x + 503, y + 192, 72, 108, { fill: C.graphite, stroke: C.graphite, sw: 1 }));
  parts.push(rect(x + 514, y + 205, 50, 95, { fill: C.timber, stroke: C.graphite, sw: 1 }));
  parts.push(rect(x + 16, y + 222, 150, 78, { fill: C.graphite, stroke: C.graphite, sw: 1, opacity: 0.85 }));
  parts.push(line(x + 91, y + 224, x + 91, y + 298, { stroke: C.white, width: 1 }));
  parts.push(treeElevation(x + 616, y + height, 0.72));
  parts.push(person(x + 488, y + height, 0.85));
  parts.push(text(x + width / 2, y + height + 31, "WEST / SERVICE + PRIVACY", 12, { weight: 700, anchor: "middle", tracking: 1.2 }));
  return parts.join("");
}

async function boardElevations() {
  let sketchData = "";
  try {
    const sketch = await fs.readFile(path.join(ROOT, "assets", "study-001.jpg"));
    sketchData = `data:image/jpeg;base64,${sketch.toString("base64")}`;
  } catch {}
  return svgDocument([
    boardHeader("02", "Four exterior sides", "Coordinated 1:100 elevation studies"),
    titleBlock(58, 181, "North elevation", "Protected family arrival + two-car canopy"),
    drawNorthElevation(58, 218),
    titleBlock(812, 181, "East elevation", "The original right-side sketch resolved as buildable space"),
    drawEastElevation(812, 218),
    titleBlock(58, 600, "South elevation", "Family terrace + pool + master balcony"),
    drawSouthElevation(58, 636),
    titleBlock(812, 600, "West elevation", "Solid service edge + controlled openings"),
    drawWestElevation(812, 636),
    sketchData ? `<image href="${sketchData}" x="1390" y="154" width="100" height="62" preserveAspectRatio="xMidYMid slice" opacity="0.62"/>` : "",
    sketchData ? rect(1390, 154, 100, 62, { fill: "none", stroke: C.graphite, sw: 1 }) : "",
    sketchData ? text(1380, 174, "ORIGINAL SKETCH", 8, { weight: 700, anchor: "end", tracking: 0.8 }) : "",
    text(58, 1017, "MATERIAL KEY", 11, { weight: 700, tracking: 1.3 }),
    rect(58, 1033, 34, 16, { fill: C.pale, stroke: C.graphite, sw: 1 }), text(102, 1046, "Pale fair-faced concrete", 10),
    rect(268, 1033, 34, 16, { fill: C.graphite, stroke: C.graphite, sw: 1 }), text(312, 1046, "Graphite steel", 10),
    rect(447, 1033, 34, 16, { fill: C.glass, stroke: C.graphite, sw: 1 }), text(491, 1046, "Solar-controlled glass", 10),
    rect(674, 1033, 34, 16, { fill: C.timber, stroke: C.graphite, sw: 1 }), text(718, 1046, "Warm timber soffit", 10),
    boardFooter(2, "Openings, shading and material proportions align with the coordinated plans."),
  ].join(""), "Study 001 four exterior elevations board");
}

function drawSection(x, y, width = 980, height = 560) {
  const ground = y + height;
  const first = ground - 210;
  const roof = ground - 410;
  const parts = [
    line(x, ground, x + width, ground, { width: 2.5 }),
    rect(x + 90, first, 790, 18, { fill: C.graphite, stroke: "none", sw: 0 }),
    rect(x + 55, roof, 875, 20, { fill: C.graphite, stroke: "none", sw: 0 }),
    rect(x + 75, roof + 20, 835, 13, { fill: C.timber, stroke: "none", sw: 0 }),
    rect(x + 115, ground - 185, 335, 185, { fill: C.pale, stroke: C.graphite, sw: 2 }),
    rect(x + 115, roof + 33, 335, first - roof - 33, { fill: C.pale, stroke: C.graphite, sw: 2 }),
    rect(x + 450, roof + 33, 395, ground - roof - 33, { fill: C.glass, stroke: C.graphite, sw: 2 }),
    line(x + 450, first, x + 845, first, { stroke: C.mid, width: 1.4, dash: "7 5" }),
    text(x + 645, first + 25, "DOUBLE-HEIGHT FAMILY LIVING", 11, { weight: 700, anchor: "middle" }),
    text(x + 282, first - 73, "OCCUPIED UPPER FLOOR", 13, { weight: 700, anchor: "middle" }),
    text(x + 282, ground - 84, "DINING / KITCHEN ZONE", 12, { weight: 700, anchor: "middle" }),
    polygon([[x + 440, roof + 10], [x + 685, ground - 12], [x + 895, roof + 10], [x + 868, roof + 10], [x + 684, ground - 39], [x + 467, roof + 10]], { fill: C.graphite, stroke: C.graphite, sw: 1 }),
    polygon([[x + 440, ground], [x + 755, roof], [x + 790, roof], [x + 478, ground]], { fill: C.pale, stroke: C.graphite, sw: 3 }),
    polyline([[x + 705, ground - 20], [x + 760, ground - 78], [x + 705, ground - 136], [x + 760, ground - 194], [x + 705, ground - 252]], { stroke: C.graphite, sw: 5 }),
    person(x + 610, ground, 1.1),
    person(x + 350, first, 1.05),
    dimension(x + 18, ground, x + 18, first, "3.60 m", -2, true),
    dimension(x + 18, first, x + 18, roof, "3.40 m", -2, true),
    text(x + 60, roof - 18, "+8.05 ROOF CANOPY", 10, { fill: C.mid }),
    text(x + 60, first - 14, "+3.60 UPPER FLOOR", 10, { fill: C.mid }),
    text(x + 60, ground - 12, "+0.00 GROUND FLOOR", 10, { fill: C.mid }),
  ];
  for (let i = 0; i < 9; i += 1) parts.push(line(x + 505 + i * 43, roof + 34, x + 520 + i * 37, first - 5, { stroke: C.mid, width: 1.6 }));
  return parts.join("");
}

function conceptDiagram(x, y) {
  const content = [
    text(x, y, "DESIGN LOGIC", 12, { weight: 700, tracking: 1.3 }),
    polygon([[x + 20, y + 70], [x + 145, y + 205], [x + 270, y + 70]], { fill: "none", stroke: C.graphite, sw: 14 }),
    rect(x + 40, y + 92, 210, 82, { fill: C.glass, stroke: C.mid, sw: 1 }),
    text(x + 145, y + 124, "FRAME OUTSIDE", 11, { weight: 700, anchor: "middle" }),
    text(x + 145, y + 145, "ROOMS CONTINUE BEHIND", 10, { anchor: "middle", fill: C.mid }),
    line(x + 310, y + 136, x + 390, y + 136, { width: 2 }),
    polygon([[x + 402, y + 136], [x + 390, y + 130], [x + 390, y + 142]], { fill: C.graphite, sw: 0 }),
    rect(x + 430, y + 70, 190, 135, { fill: C.pale, stroke: C.graphite, sw: 2 }),
    line(x + 430, y + 136, x + 620, y + 136, { width: 5 }),
    rect(x + 452, y + 87, 146, 38, { fill: C.white, stroke: C.line, sw: 1 }),
    text(x + 525, y + 111, "UPPER ROOMS", 10, { weight: 700, anchor: "middle" }),
    rect(x + 452, y + 151, 146, 38, { fill: C.white, stroke: C.line, sw: 1 }),
    text(x + 525, y + 175, "GROUND ROOMS", 10, { weight: 700, anchor: "middle" }),
  ].join("");
  return `<g transform="translate(${x} ${y}) scale(.7) translate(${-x} ${-y})">${content}</g>`;
}

function boardSection() {
  return svgDocument([
    boardHeader("03", "Structure becomes shelter", "East frame section + material and environmental strategy"),
    titleBlock(58, 181, "Section A-A", "Through occupied upper floor, living void, stair and east frame"),
    drawSection(58, 228),
    titleBlock(1090, 181, "Key idea", "The lines support the roof; they do not replace the upper floor"),
    conceptDiagram(1090, 237),
    text(1090, 510, "HOT-SUNNY RESPONSE", 12, { weight: 700, tracking: 1.3 }),
    rect(1090, 535, 450, 94, { fill: C.white, stroke: C.line, sw: 1 }),
    text(1112, 565, "1", 18, { weight: 700 }), text(1148, 563, "Oversized roof shades the east glass", 12),
    text(1112, 595, "2", 18, { weight: 700 }), text(1148, 593, "Deep south terrace protects family openings", 12),
    text(1112, 625, "3", 18, { weight: 700 }), text(1148, 623, "Solid west wall limits afternoon heat", 12),
    text(1090, 682, "MATERIAL PALETTE", 12, { weight: 700, tracking: 1.3 }),
    rect(1090, 706, 100, 78, { fill: C.pale, stroke: C.graphite, sw: 1 }),
    rect(1205, 706, 100, 78, { fill: C.graphite, stroke: C.graphite, sw: 1 }),
    rect(1320, 706, 100, 78, { fill: C.glass, stroke: C.graphite, sw: 1 }),
    rect(1435, 706, 100, 78, { fill: C.timber, stroke: C.graphite, sw: 1 }),
    text(1140, 805, "CONCRETE", 9, { weight: 700, anchor: "middle" }),
    text(1255, 805, "STEEL", 9, { weight: 700, anchor: "middle" }),
    text(1370, 805, "GLASS", 9, { weight: 700, anchor: "middle" }),
    text(1485, 805, "TIMBER", 9, { weight: 700, anchor: "middle" }),
    text(1090, 866, "STRUCTURAL NOTE", 12, { weight: 700, tracking: 1.3 }),
    text(1090, 896, "Frame depth, hanger spacing and canopy cantilever are conceptual.", 12, { fill: C.mid }),
    text(1090, 918, "Architect and structural engineer to resolve local loads, movement,", 12, { fill: C.mid }),
    text(1090, 940, "waterproofing, thermal bridging and glass performance.", 12, { fill: C.mid }),
    text(58, 995, "SECTIONAL EXPERIENCE", 12, { weight: 700, tracking: 1.3 }),
    text(58, 1026, "Dramatic structure outside. Calm, practical rooms inside.", 25, { weight: 500 }),
    boardFooter(3, "A single structural idea coordinates roof, upper floor, stair, shade and movement."),
  ].join(""), "Study 001 explanatory building section board");
}

async function writeFile(target, content) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

async function build() {
  const boards = [
    { name: "board-01-arrangement", svg: boardArrangement() },
    { name: "board-02-elevations", svg: await boardElevations() },
    { name: "board-03-section", svg: boardSection() },
  ];

  await fs.mkdir(ASSET_OUT, { recursive: true });
  await fs.mkdir(PDF_OUT, { recursive: true });

  for (const board of boards) {
    await writeFile(path.join(ASSET_OUT, `${board.name}.svg`), board.svg);
    await sharp(Buffer.from(board.svg)).resize({ width: 1800 }).webp({ quality: 88 }).toFile(path.join(ASSET_OUT, `${board.name}.webp`));
  }

  const details = [
    {
      name: "floor-ground",
      svg: detailDocument(1000, 780, `${text(58, 54, "GROUND FLOOR", 20, { weight: 700, tracking: 1.6 })}${text(942, 54, "Approx. 220 sq m", 12, { anchor: "end", fill: C.mid })}${line(58, 76, 942, 76, { stroke: C.line, width: 1 })}${drawGroundPlan(82, 126, 46)}`, "Study 001 ground floor plan"),
    },
    {
      name: "floor-first",
      svg: detailDocument(1000, 780, `${text(58, 54, "FIRST FLOOR", 20, { weight: 700, tracking: 1.6 })}${text(942, 54, "Approx. 170 sq m", 12, { anchor: "end", fill: C.mid })}${line(58, 76, 942, 76, { stroke: C.line, width: 1 })}${drawFirstPlan(82, 126, 46)}`, "Study 001 first floor plan"),
    },
    ...[
      ["north", "NORTH / ARRIVAL", drawNorthElevation],
      ["east", "EAST / ORIGINAL RIGHT SIDE", drawEastElevation],
      ["south", "SOUTH / TERRACE + POOL", drawSouthElevation],
      ["west", "WEST / SERVICE + PRIVACY", drawWestElevation],
    ].map(([key, label, renderer]) => ({
      name: `elevation-${key}`,
      svg: detailDocument(1000, 620, `${text(58, 54, label, 20, { weight: 700, tracking: 1.6 })}${line(58, 76, 942, 76, { stroke: C.line, width: 1 })}<g transform="translate(78 126) scale(1.28)">${renderer(0, 0)}</g>`, `Study 001 ${key} elevation`),
    })),
  ];

  for (const detail of details) {
    await writeFile(path.join(ASSET_OUT, `${detail.name}.svg`), detail.svg);
    await sharp(Buffer.from(detail.svg)).resize({ width: 1400 }).webp({ quality: 88 }).toFile(path.join(ASSET_OUT, `${detail.name}.webp`));
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.TRPLS_BROWSER || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();
  const pages = boards.map((board) => `<section class="sheet">${board.svg.replace(/^<\?xml[^>]*>\s*/, "")}</section>`).join("");
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><title>Study 001 - House Development</title><style>
    @page { size: 841mm 594mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; }
    .sheet { width: 841mm; height: 594mm; break-after: page; overflow: hidden; }
    .sheet:last-child { break-after: auto; }
    svg { display: block; width: 100%; height: 100%; }
  </style></head><body>${pages}</body></html>`, { waitUntil: "load" });
  await page.pdf({
    path: path.join(PDF_OUT, "study-001-house-development.pdf"),
    width: "841mm",
    height: "594mm",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: true,
  });
  await browser.close();
}

await build();
