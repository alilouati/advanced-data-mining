// Shared slide library for "Advanced Data Mining" — Dr. Ali Louati
const pptxgen = require("/opt/npm-tools/node_modules/pptxgenjs/dist/pptxgen.patched.cjs.js");
const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const md = require("react-icons/md");
const { applyTheme } = require("/mnt/skills/public/pptx/scripts/apply_theme.js");

const FIG = path.join(__dirname, "figs");
const HEX = { ink: "0F2A3D", teal: "0E7C7B", teal2: "5BC0BE", amber: "F2A541", coral: "E4572E", plum: "6C5B9E", green: "3E9C5A", slate: "5B6B7A", light: "EEF4F5", tint: "E2F1F0", amberTint: "FDF1DE", coralTint: "FBE4DC", white: "FFFFFF", mute: "8796A3" };
const THEME = {
  name: "Advanced Data Mining",
  headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: HEX.ink, lt1: "FFFFFF", dk2: "1F3B4D", lt2: HEX.light, accent1: HEX.teal, accent2: HEX.amber, accent3: HEX.coral, accent4: HEX.plum, accent5: HEX.green, accent6: HEX.slate, hlink: HEX.teal, folHlink: HEX.plum },
};
const AUTHOR = "Dr. Ali Louati";
const AFFIL = "Department of Information Systems · Prince Sattam Bin Abdulaziz University";
const EMAIL = "a.louati@psau.edu.sa";
const W = 13.333, H = 7.5, X0 = 0.6, CW = 12.13, Y0 = 1.4, YB = 6.75;

// ---------- icons
const iconCache = {};
async function icon(name, color = "FFFFFF", size = 256) {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const Comp = fa[name] || md[name] || fa.FaCircle;
  if (!fa[name] && !md[name]) console.warn("missing icon", name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + buf.toString("base64"));
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
// fit image inside a box, centered
function fitImage(slide, name, x, y, w, h, opts = {}) {
  const file = path.join(FIG, name + ".png");
  const s = pngSize(file); const r = s.w / s.h;
  let iw = w, ih = w / r;
  if (ih > h) { ih = h; iw = h * r; }
  const ix = x + (w - iw) / 2, iy = y + (opts.top ? 0 : (h - ih) / 2);
  slide.addImage({ path: file, x: ix, y: iy, w: iw, h: ih, objectName: "Figure " + name, altText: opts.alt || name.replace(/_/g, " ") });
  return { x: ix, y: iy, w: iw, h: ih };
}

// rich text helper: "**bold** rest" → runs
function runs(str, base = {}) {
  const parts = String(str).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map(p => p.startsWith("**") ? { text: p.slice(2, -2), options: { ...base, bold: true } }
    : (p.startsWith("*") && p.endsWith("*") && p.length > 2) ? { text: p.slice(1, -1), options: { ...base, italic: true } } : { text: p, options: { ...base } });
}
function bulletRuns(items, o = {}) {
  const out = [];
  items.forEach((it, i) => {
    const sub = typeof it === "object" && it.sub;
    const text = sub ? it.sub : it;
    const rr = runs(text, { color: o.color || HEX.ink });
    rr.forEach((r, j) => {
      if (j === 0) r.options = { ...r.options, bullet: sub ? { indent: 18 } : { indent: 20 }, indentLevel: sub ? 1 : 0, paraSpaceAfter: o.space ?? 10 };
      r.options.fontSize = sub ? (o.size || 18) - 2 : (o.size || 18);
      if (j === rr.length - 1 && i < items.length - 1) r.options.breakLine = true;
    });
    out.push(...rr);
  });
  return out;
}

class Deck {
  constructor(ch) {
    this.ch = ch; // {num, title, short}
    const p = (this.p = new pptxgen());
    p.layout = "LAYOUT_WIDE";
    p.author = AUTHOR; p.company = "Prince Sattam Bin Abdulaziz University";
    p.title = `Advanced Data Mining — Chapter ${ch.num}: ${ch.title}`;
    p.subject = "Advanced Data Mining (M.Sc. Data Science)";
    p.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
    const C = (this.C = p.SchemeColor);
    const footer = `Advanced Data Mining  ·  Chapter ${ch.num}: ${ch.short || ch.title}  ·  ${AUTHOR}`;
    p.defineSlideMaster({
      title: "CONTENT", background: { color: "FFFFFF" },
      objects: [
        { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.32, w: CW, h: 0.9, fontFace: "Cambria", fontSize: 30, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
        { text: { text: footer, options: { x: X0, y: 7.02, w: 9, h: 0.3, fontSize: 10, color: HEX.mute, margin: 0, fontFace: "Calibri" } } },
      ],
      slideNumber: { x: 12.23, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color: HEX.mute, align: "right", fontFace: "Calibri" },
    });
    p.defineSlideMaster({ title: "SECTION", background: { color: HEX.teal },
      objects: [{ placeholder: { options: { name: "title", type: "title", x: 2.6, y: 2.9, w: 9.8, h: 1.4, fontFace: "Cambria", fontSize: 40, bold: true, color: "FFFFFF", valign: "middle", align: "left", margin: 0 }, text: "" } },
        { text: { text: footer, options: { x: X0, y: 7.02, w: 9, h: 0.3, fontSize: 10, color: "CFE9E8", margin: 0 } } }],
      slideNumber: { x: 12.23, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color: "CFE9E8", align: "right" } });
    p.defineSlideMaster({ title: "DARK", background: { color: HEX.ink }, objects: [] });
    this.section = "Introduction";
    p.addSection({ title: this.section });
  }
  sec(title) { this.section = title; this.p.addSection({ title }); }
  slide(master = "CONTENT", title) {
    const s = this.p.addSlide({ masterName: master, sectionTitle: this.section });
    if (title) s.addText(title, { placeholder: "title" });
    return s;
  }
  notes(s, n) { if (n) s.addNotes(n); }

  // ---------------- slide types
  async cover(o) {
    const s = this.slide("DARK");
    // decorative scatter motif on right
    const pts = [[9.3, 1.2, .5, HEX.teal], [10.6, .8, .32, HEX.amber], [11.7, 1.7, .62, HEX.teal2], [10.2, 2.4, .22, HEX.coral], [12.2, .6, .2, HEX.teal2], [11.0, 3.1, .4, HEX.teal], [12.4, 2.9, .28, HEX.amber], [9.7, 3.5, .18, HEX.teal2]];
    pts.forEach(([x, y, r, c], i) => s.addShape(this.p.ShapeType.ellipse, { x, y, w: r, h: r, fill: { color: c, transparency: 15 }, line: { type: "none" }, objectName: "motif dot " + i }));
    s.addText("ADVANCED DATA MINING  ·  M.Sc. DATA SCIENCE", { x: X0, y: 1.0, w: 8, h: 0.4, fontSize: 14, color: HEX.teal2, bold: true, charSpacing: 3, margin: 0, isTextBox: true });
    s.addText(`Chapter ${this.ch.num}`, { x: X0, y: 2.0, w: 8, h: 0.6, fontSize: 24, color: HEX.amber, fontFace: "Cambria", margin: 0, isTextBox: true });
    s.addText(this.ch.title, { x: X0, y: 2.6, w: 10.5, h: 1.7, fontSize: 44, bold: true, color: "FFFFFF", fontFace: "Cambria", valign: "top", margin: 0, isTextBox: true });
    if (o.subtitle) s.addText(o.subtitle, { x: X0, y: 4.35, w: 10, h: 0.6, fontSize: 20, color: "C9D6DF", margin: 0, isTextBox: true });
    s.addShape(this.p.ShapeType.ellipse, { x: X0, y: 5.55, w: 0.9, h: 0.9, fill: { color: HEX.teal }, line: { type: "none" } });
    s.addImage({ data: await icon("FaChalkboardTeacher"), x: X0 + 0.2, y: 5.75, w: 0.5, h: 0.5 });
    s.addText([{ text: AUTHOR, options: { fontSize: 22, bold: true, color: "FFFFFF", breakLine: true } },
      { text: "Associate Professor · " + AFFIL, options: { fontSize: 13, color: "C9D6DF", breakLine: true } },
      { text: EMAIL + "   ·   Academic year 2026–2027", options: { fontSize: 13, color: HEX.teal2 } }],
      { x: X0 + 1.15, y: 5.45, w: 11, h: 1.1, valign: "middle", margin: 0, isTextBox: true });
    this.notes(s, o.notes);
  }

  async agenda(items, o = {}) {
    const s = this.slide("CONTENT", o.title || "Roadmap");
    const n = items.length, cols = n <= 4 ? n : Math.ceil(n / 2), rows = n <= 4 ? 1 : 2;
    const gap = 0.3, cw = (CW - gap * (cols - 1)) / cols, ch = rows === 1 ? 2.8 : 2.45;
    items.forEach((it, i) => {
      const r = Math.floor(i / cols), c = i % cols, x = X0 + c * (cw + gap), y = Y0 + 0.2 + r * (ch + gap);
      s.addShape(this.p.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: i % 2 ? HEX.light : HEX.tint }, line: { type: "none" }, rectRadius: 0.12 });
      s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.25, y: y + 0.2, w: 1.5, h: 0.75, fontSize: 36, bold: true, color: this.C.accent1, fontFace: "Cambria", margin: 0, isTextBox: true });
      s.addText(it[0], { x: x + 0.25, y: y + 1.0, w: cw - 0.5, h: 0.75, fontSize: 19, bold: true, color: this.C.text1, valign: "top", margin: 0, isTextBox: true });
      if (it[1]) s.addText(it[1], { x: x + 0.25, y: y + 1.65, w: cw - 0.5, h: ch - 1.75, fontSize: 16, color: HEX.slate, valign: "top", margin: 0, isTextBox: true });
    });
    this.notes(s, o.notes);
  }

  async objectives(items, o = {}) {
    const s = this.slide("CONTENT", o.title || "Learning outcomes");
    s.addText("By the end of this chapter you will be able to…", { x: X0, y: Y0 - 0.05, w: CW, h: 0.4, fontSize: 16, italic: true, color: HEX.slate, margin: 0, isTextBox: true });
    const rowH = Math.min(1.0, 4.9 / items.length);
    for (let i = 0; i < items.length; i++) {
      const [ic, txt] = items[i]; const y = Y0 + 0.5 + i * rowH;
      s.addShape(this.p.ShapeType.ellipse, { x: X0, y: y + (rowH - 0.62) / 2, w: 0.62, h: 0.62, fill: { color: i % 2 ? HEX.amber : HEX.teal }, line: { type: "none" } });
      s.addImage({ data: await icon(ic), x: X0 + 0.16, y: y + (rowH - 0.62) / 2 + 0.16, w: 0.3, h: 0.3 });
      s.addText(runs(txt, { color: HEX.ink }), { x: X0 + 0.9, y, w: 11.1, h: rowH, fontSize: 19, valign: "middle", margin: 0, isTextBox: true });
    }
    this.notes(s, o.notes);
  }

  async divider(num, title, sub, notes) {
    this.sec(title);
    const s = this.slide("SECTION");
    s.addShape(this.p.ShapeType.ellipse, { x: X0, y: 2.75, w: 1.7, h: 1.7, fill: { color: "FFFFFF", transparency: 85 }, line: { color: "FFFFFF", width: 2 } });
    s.addText(String(num), { x: X0, y: 2.75, w: 1.7, h: 1.7, fontSize: 54, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: "Cambria", margin: 0, isTextBox: true });
    s.addText(title, { placeholder: "title" });
    if (sub) s.addText(sub, { x: 2.6, y: 4.3, w: 9.8, h: 0.8, fontSize: 18, color: "D7EFEE", valign: "top", margin: 0, isTextBox: true });
    this.notes(s, notes);
  }

  // text + figure side by side
  async figure(o) {
    if (o.stack) return this.figureStack(o);
    const s = this.slide("CONTENT", o.title);
    const textW = o.textW || 4.6, gap = 0.4, imgLeft = o.side === "left";
    const tx = imgLeft ? X0 + CW - textW : X0, ix = imgLeft ? X0 : X0 + textW + gap, iw = CW - textW - gap;
    let ty = Y0, th = YB - Y0;
    if (o.lead) { s.addText(runs(o.lead, { color: this.C.accent1 }), { x: tx, y: ty, w: textW, h: 0.9, fontSize: 20, bold: true, valign: "top", margin: 0, isTextBox: true }); ty += 1.0; th -= 1.0; }
    if (o.takeaway) th -= 1.25;
    if (o.bullets) s.addText(bulletRuns(o.bullets, { size: o.size || 18 }), { x: tx, y: ty, w: textW, h: th, valign: "top", margin: 0, isTextBox: true });
    if (o.takeaway) this._takeaway(s, o.takeaway, tx, YB - 1.1, textW, 1.1);
    const box = fitImage(s, o.img, ix, Y0, iw, (o.caption ? YB - 0.45 : YB) - Y0, { alt: o.alt });
    if (o.caption) s.addText(o.caption, { x: ix, y: box.y + box.h + 0.08, w: iw, h: 0.35, fontSize: 12, italic: true, color: HEX.slate, align: "center", margin: 0, isTextBox: true });
    this.notes(s, o.notes); return s;
  }

  async figureStack(o) {
    const s = this.slide("CONTENT", o.title);
    const ih = o.imgH || 3.0;
    fitImage(s, o.img, X0, Y0, CW, ih);
    const half = Math.ceil(o.bullets.length / 2), cw = (CW - 0.5) / 2, by = Y0 + ih + 0.3, bh = YB - by - (o.takeaway ? 0.9 : 0);
    [o.bullets.slice(0, half), o.bullets.slice(half)].forEach((b, i) => {
      if (b.length) s.addText(bulletRuns(b, { size: o.size || 18 }), { x: X0 + i * (cw + 0.5), y: by, w: cw, h: bh, valign: "top", margin: 0, isTextBox: true });
    });
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.75, CW, 0.75);
    this.notes(s, o.notes); return s;
  }

  _takeaway(s, text, x, y, w, h, color) {
    s.addShape(this.p.ShapeType.roundRect, { x, y, w, h, fill: { color: color || HEX.amberTint }, line: { type: "none" }, rectRadius: 0.1 });
    s.addText(runs(text, { color: HEX.ink }), { x: x + 0.2, y, w: w - 0.4, h, fontSize: 15, valign: "middle", margin: 0, isTextBox: true });
  }

  // large figure + optional takeaway band
  async bigfig(o) {
    const s = this.slide("CONTENT", o.title);
    let bottom = YB;
    if (o.takeaway) bottom -= 0.95;
    if (o.caption) bottom -= 0.4;
    const box = fitImage(s, o.img, X0, Y0, CW, bottom - Y0, { alt: o.alt });
    if (o.caption) s.addText(o.caption, { x: X0, y: box.y + box.h + 0.05, w: CW, h: 0.35, fontSize: 13, italic: true, color: HEX.slate, align: "center", margin: 0, isTextBox: true });
    if (o.takeaway) this._takeaway(s, o.takeaway, X0 + 0.8, YB - 0.8, CW - 1.6, 0.8);
    this.notes(s, o.notes); return s;
  }

  // grid of icon cards
  async cards(o) {
    const s = this.slide("CONTENT", o.title);
    const items = o.items, n = items.length;
    const cols = o.cols || (n <= 3 ? n : n === 4 ? 4 : 3), rows = Math.ceil(n / cols);
    let y0 = Y0; if (o.lead) { s.addText(runs(o.lead, { color: HEX.slate }), { x: X0, y: Y0 - 0.05, w: CW, h: 0.5, fontSize: 17, margin: 0, isTextBox: true }); y0 += 0.6; }
    const gap = 0.3, cw = (CW - gap * (cols - 1)) / cols, avail = YB - y0 - (o.takeaway ? 1.0 : 0);
    const maxT = Math.max(...items.map(it => (it.t || "").replace(/\*/g, "").length));
    const tfs = o.tSize || 17, lines = Math.max(1, Math.ceil(maxT * tfs * 0.0075 / (cw - 0.5)));
    const need = 1.75 + lines * tfs * 1.22 / 72 + 0.15;
    const ch = Math.min(o.cardH || need + 0.2, (avail - gap * (rows - 1)) / rows);
    y0 += Math.max(0, (avail - (ch * rows + gap * (rows - 1))) / 2.5);
    const palette = [HEX.teal, HEX.amber, HEX.coral, HEX.plum, HEX.green, HEX.slate];
    for (let i = 0; i < n; i++) {
      const it = items[i], r = Math.floor(i / cols), c = i % cols, x = X0 + c * (cw + gap), y = y0 + r * (ch + gap);
      const col = it.color ? HEX[it.color] : palette[i % palette.length];
      s.addShape(this.p.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: "F7FAFB" }, line: { color: "DCE5E9", width: 0.75 }, rectRadius: 0.1, shadow: { type: "outer", color: "9AA7B2", opacity: 0.25, blur: 6, offset: 2, angle: 90 } });
      const compact = ch < need;
      const ir = compact ? 0.55 : 0.7;
      s.addShape(this.p.ShapeType.ellipse, { x: x + 0.25, y: y + 0.25, w: ir, h: ir, fill: { color: col }, line: { type: "none" } });
      s.addImage({ data: await icon(it.icon || "FaCircle"), x: x + 0.25 + ir * 0.25, y: y + 0.25 + ir * 0.25, w: ir * 0.5, h: ir * 0.5 });
      if (compact) {
        s.addText(it.h, { x: x + 0.95, y: y + 0.2, w: cw - 1.15, h: 0.65, fontSize: o.hSize || 18, bold: true, color: HEX.ink, valign: "middle", margin: 0, isTextBox: true });
        if (it.t) s.addText(runs(it.t, { color: HEX.slate }), { x: x + 0.25, y: y + 0.9, w: cw - 0.5, h: ch - 1.0, fontSize: (ch - 1.0) > lines * 0.33 + 0.3 ? 18 : Math.max(o.tSize || 17, 16), valign: "top", margin: 0, isTextBox: true });
      } else {
        s.addText(it.h, { x: x + 0.25, y: y + 1.1, w: cw - 0.5, h: 0.6, fontSize: o.hSize || 20, bold: true, color: HEX.ink, valign: "top", margin: 0, isTextBox: true });
        if (it.t) s.addText(runs(it.t, { color: HEX.slate }), { x: x + 0.25, y: y + 1.7, w: cw - 0.5, h: ch - 1.8, fontSize: o.tSize || 17, valign: "top", margin: 0, isTextBox: true });
      }
    }
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.75, CW, 0.75);
    this.notes(s, o.notes); return s;
  }

  // numbered process flow
  async process(o) {
    const s = this.slide("CONTENT", o.title);
    const n = o.steps.length; let y = Y0 + (o.lead ? 0.9 : 0.6) + (o.takeaway ? 0 : 0.4);
    if (o.lead) s.addText(runs(o.lead, { color: HEX.slate }), { x: X0, y: Y0 - 0.05, w: CW, h: 0.5, fontSize: 17, margin: 0, isTextBox: true });
    const gap = 0.35, cw = (CW - gap * (n - 1)) / n, d = 0.85;
    const palette = [HEX.teal, HEX.teal2, HEX.amber, HEX.coral, HEX.plum, HEX.green, HEX.slate];
    for (let i = 0; i < n; i++) {
      const st = o.steps[i], x = X0 + i * (cw + gap);
      const col = palette[i % palette.length];
      s.addShape(this.p.ShapeType.ellipse, { x: x + (cw - d) / 2, y, w: d, h: d, fill: { color: col }, line: { type: "none" } });
      if (st.icon) s.addImage({ data: await icon(st.icon), x: x + (cw - d) / 2 + 0.22, y: y + 0.22, w: d - 0.44, h: d - 0.44 });
      else s.addText(String(i + 1), { x: x + (cw - d) / 2, y, w: d, h: d, fontSize: 28, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
      if (i < n - 1) s.addShape(this.p.ShapeType.line, { x: x + (cw + d) / 2 + 0.08, y: y + d / 2, w: cw + gap - d - 0.16, h: 0, line: { color: "B9C6CE", width: 2, endArrowType: "triangle" } });
      s.addText(st.h, { x, y: y + d + 0.2, w: cw, h: 0.7, fontSize: o.hSize || 19, bold: true, color: HEX.ink, align: "center", valign: "top", margin: 0, isTextBox: true });
      if (st.t) s.addText(runs(st.t, { color: HEX.slate }), { x, y: y + d + 0.9, w: cw, h: YB - (y + d + 0.9) - (o.takeaway ? 0.95 : 0.1), fontSize: o.tSize || 16, align: "center", valign: "top", margin: 0, isTextBox: true });
    }
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.8, CW, 0.8);
    this.notes(s, o.notes); return s;
  }

  // two-column comparison
  async compare(o) {
    const s = this.slide("CONTENT", o.title);
    const gap = 0.4, cw = (CW - gap) / 2, top = Y0, bh = YB - top - (o.takeaway ? 1.0 : 0);
    [o.left, o.right].forEach((col, i) => {
      const x = X0 + i * (cw + gap), c = HEX[col.color || (i ? "amber" : "teal")];
      s.addShape(this.p.ShapeType.roundRect, { x, y: top, w: cw, h: bh, fill: { color: "F7FAFB" }, line: { color: "DCE5E9", width: 0.75 }, rectRadius: 0.1 });
      s.addShape(this.p.ShapeType.roundRect, { x, y: top, w: cw, h: 0.75, fill: { color: c }, line: { type: "none" }, rectRadius: 0.1 });
      s.addText(col.h, { x: x + 0.3, y: top, w: cw - 0.6, h: 0.75, fontSize: 20, bold: true, color: i && !col.color ? HEX.ink : "FFFFFF", valign: "middle", margin: 0, isTextBox: true });
      if (col.img) {
        const ih = col.imgH || 2.2;
        fitImage(s, col.img, x + 0.3, top + 0.95, cw - 0.6, ih);
        s.addText(bulletRuns(col.items, { size: o.size || 16 }), { x: x + 0.3, y: top + 1.1 + ih, w: cw - 0.6, h: bh - 1.2 - ih, valign: "top", margin: 0, isTextBox: true });
      } else s.addText(bulletRuns(col.items, { size: o.size || 20, space: 14 }), { x: x + 0.3, y: top + 1.0, w: cw - 0.6, h: bh - 1.15, valign: "top", margin: 0, isTextBox: true });
    });
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.8, CW, 0.8);
    this.notes(s, o.notes); return s;
  }

  // table
  async table(o) {
    const s = this.slide("CONTENT", o.title);
    const fsz = o.size || 16;
    const rows = [o.head.map(h => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: HEX.teal }, fontSize: fsz + 1, valign: "middle" } }))];
    o.rows.forEach((r, i) => rows.push(r.map((c, j) => ({ text: String(c), options: { color: HEX.ink, fontSize: fsz, bold: j === 0 && o.boldFirst !== false, fill: { color: i % 2 ? "FFFFFF" : "F2F7F8" }, valign: "middle" } }))));
    let y = Y0; if (o.lead) { s.addText(runs(o.lead, { color: HEX.slate }), { x: X0, y: Y0 - 0.05, w: CW, h: 0.5, fontSize: 17, margin: 0, isTextBox: true }); y += 0.6; }
    const tw = o.w || CW;
    s.addTable(rows, { x: o.x || X0, y, w: tw, colW: o.colW, border: { type: "solid", pt: 0.5, color: "DCE5E9" }, margin: [4, 8, 4, 8], rowH: o.rowH || 0.55, fontFace: "Calibri" });
    if (o.img) fitImage(s, o.img, (o.x || X0) + tw + 0.3, Y0, CW - tw - 0.3, YB - Y0 - (o.takeaway ? 1 : 0));
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.8, CW, 0.8);
    this.notes(s, o.notes); return s;
  }

  // formula cards (+ optional figure)
  async formulas(o) {
    const s = this.slide("CONTENT", o.title);
    const fw = o.img ? (o.fw || 6.3) : CW; const n = o.items.length;
    let y = Y0; if (o.lead) { s.addText(runs(o.lead, { color: HEX.slate }), { x: X0, y: Y0 - 0.05, w: fw, h: 0.55, fontSize: 17, margin: 0, isTextBox: true }); y += 0.65; }
    const avail = YB - y - (o.takeaway ? 1.0 : 0), gap = 0.22, h = Math.min(1.35, (avail - gap * (n - 1)) / n);
    o.items.forEach((it, i) => {
      const yy = y + i * (h + gap);
      s.addShape(this.p.ShapeType.roundRect, { x: X0, y: yy, w: fw, h, fill: { color: i % 2 ? HEX.light : HEX.tint }, line: { type: "none" }, rectRadius: 0.08 });
      s.addText(it[0], { x: X0 + 0.25, y: yy, w: 2.3, h, fontSize: 16, bold: true, color: this.C.accent1, valign: "middle", margin: 0, isTextBox: true });
      s.addText(runs(it[1], { color: HEX.ink }), { x: X0 + 2.6, y: yy, w: fw - 2.8, h: it[2] ? h * 0.58 : h, fontSize: it.fs || 20, fontFace: /[→←⇒]/.test(it[1]) ? "Calibri" : "Cambria", color: HEX.ink, valign: it[2] ? "bottom" : "middle", margin: 0, isTextBox: true });
      if (it[2]) s.addText(it[2], { x: X0 + 2.6, y: yy + h * 0.58, w: fw - 2.8, h: h * 0.42, fontSize: 13, color: HEX.slate, valign: "top", margin: 0, isTextBox: true });
    });
    if (o.img) fitImage(s, o.img, X0 + fw + 0.35, Y0, CW - fw - 0.35, YB - Y0 - (o.takeaway ? 1.0 : 0));
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.8, CW, 0.8);
    this.notes(s, o.notes); return s;
  }

  // big stat callouts
  async stats(o) {
    const s = this.slide("CONTENT", o.title);
    const n = o.items.length, gap = 0.35, cw = (CW - gap * (n - 1)) / n, y = Y0 + 0.3;
    o.items.forEach((it, i) => {
      const x = X0 + i * (cw + gap), c = [HEX.teal, HEX.amber, HEX.coral, HEX.plum][i % 4];
      s.addShape(this.p.ShapeType.roundRect, { x, y, w: cw, h: 3.3, fill: { color: "F7FAFB" }, line: { color: "DCE5E9", width: 0.75 }, rectRadius: 0.1 });
      s.addText(it[0], { x: x + 0.2, y: y + 0.3, w: cw - 0.4, h: 1.3, fontSize: it[0].length > 6 ? 40 : 54, bold: true, color: c, fontFace: "Cambria", align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(runs(it[1], { color: HEX.ink }), { x: x + 0.25, y: y + 1.75, w: cw - 0.5, h: 1.4, fontSize: 16, align: "center", valign: "top", margin: 0, isTextBox: true });
    });
    if (o.source) s.addText(o.source, { x: X0, y: y + 3.45, w: CW, h: 0.35, fontSize: 11, italic: true, color: HEX.mute, margin: 0, isTextBox: true });
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.9, CW, 0.85);
    this.notes(s, o.notes); return s;
  }

  // big statement on dark
  async statement(text, o = {}) {
    const s = this.slide("DARK");
    s.addShape(this.p.ShapeType.ellipse, { x: X0, y: 1.6, w: 1.0, h: 1.0, fill: { color: HEX.amber }, line: { type: "none" } });
    s.addImage({ data: await icon(o.icon || "FaLightbulb", HEX.ink), x: X0 + 0.25, y: 1.85, w: 0.5, h: 0.5 });
    s.addText(runs(text, { color: "FFFFFF" }), { x: X0, y: 2.9, w: 11.5, h: 2.2, fontSize: 32, fontFace: "Cambria", valign: "top", margin: 0, isTextBox: true });
    if (o.by) s.addText(o.by, { x: X0, y: 5.2, w: 11.5, h: 0.5, fontSize: 16, color: HEX.teal2, margin: 0, isTextBox: true });
    s.addText(`Advanced Data Mining  ·  ${AUTHOR}`, { x: X0, y: 7.02, w: 9, h: 0.3, fontSize: 10, color: "8FA3B3", margin: 0, isTextBox: true });
    this.notes(s, o.notes); return s;
  }

  // code + bullets
  async code(o) {
    const s = this.slide("CONTENT", o.title);
    const cw = o.bullets ? (o.codeW || 8.2) : CW;
    s.addShape(this.p.ShapeType.roundRect, { x: X0, y: Y0, w: cw, h: YB - Y0, fill: { color: "13232F" }, line: { type: "none" }, rectRadius: 0.1 });
    s.addShape(this.p.ShapeType.ellipse, { x: X0 + 0.25, y: Y0 + 0.2, w: 0.16, h: 0.16, fill: { color: HEX.coral }, line: { type: "none" } });
    s.addShape(this.p.ShapeType.ellipse, { x: X0 + 0.5, y: Y0 + 0.2, w: 0.16, h: 0.16, fill: { color: HEX.amber }, line: { type: "none" } });
    s.addShape(this.p.ShapeType.ellipse, { x: X0 + 0.75, y: Y0 + 0.2, w: 0.16, h: 0.16, fill: { color: HEX.green }, line: { type: "none" } });
    s.addText(o.lang || "Python", { x: X0 + cw - 1.6, y: Y0 + 0.12, w: 1.4, h: 0.3, fontSize: 11, color: "8FA3B3", align: "right", margin: 0, isTextBox: true });
    const lines = o.code.split("\n");
    const maxLen = Math.max(...lines.map(l => l.length));
    const fsW = (cw - 0.6) * 72 / (0.6 * maxLen), fsH = (YB - Y0 - 0.7) * 72 / (1.2 * lines.length);
    const codeFs = Math.min(o.size || 16, Math.floor(Math.min(fsW, fsH) * 2) / 2);
    const tr = lines.map((l, i) => ({ text: l || " ", options: { color: l.trim().startsWith("#") ? "7FB8B6" : "E6EDF3", breakLine: i < lines.length - 1 } }));
    s.addText(tr, { x: X0 + 0.3, y: Y0 + 0.5, w: cw - 0.6, h: YB - Y0 - 0.65, fontFace: "Courier New", fontSize: codeFs, valign: "top", margin: 0, isTextBox: true });
    if (o.bullets) s.addText(bulletRuns(o.bullets, { size: 17 }), { x: X0 + cw + 0.4, y: Y0, w: CW - cw - 0.4, h: YB - Y0, valign: "top", margin: 0, isTextBox: true });
    this.notes(s, o.notes); return s;
  }

  // check-your-understanding
  async quiz(qs, o = {}) {
    const s = this.slide("CONTENT", o.title || "Check your understanding");
    const n = qs.length, gap = 0.25, h = Math.min(1.25, (YB - Y0 - gap * (n - 1)) / n);
    for (let i = 0; i < n; i++) {
      const y = Y0 + i * (h + gap);
      s.addShape(this.p.ShapeType.roundRect, { x: X0, y, w: CW, h, fill: { color: i % 2 ? HEX.light : HEX.amberTint }, line: { type: "none" }, rectRadius: 0.08 });
      s.addShape(this.p.ShapeType.ellipse, { x: X0 + 0.25, y: y + (h - 0.6) / 2, w: 0.6, h: 0.6, fill: { color: HEX.ink }, line: { type: "none" } });
      s.addText("Q" + (i + 1), { x: X0 + 0.25, y: y + (h - 0.6) / 2, w: 0.6, h: 0.6, fontSize: 15, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(runs(qs[i], { color: HEX.ink }), { x: X0 + 1.1, y, w: CW - 1.4, h, fontSize: 18, valign: "middle", margin: 0, isTextBox: true });
    }
    this.notes(s, o.notes); return s;
  }

  // timeline
  async timeline(o) {
    const s = this.slide("CONTENT", o.title);
    const n = o.items.length, y = 3.9, x1 = X0 + 0.2, x2 = X0 + CW - 0.2, step = (x2 - x1) / (n - 1);
    s.addShape(this.p.ShapeType.line, { x: x1, y, w: x2 - x1, h: 0, line: { color: "B9C6CE", width: 3 } });
    o.items.forEach((it, i) => {
      const x = x1 + i * step, up = i % 2 === 0, c = [HEX.teal, HEX.amber, HEX.coral, HEX.plum][i % 4];
      s.addShape(this.p.ShapeType.ellipse, { x: x - 0.17, y: y - 0.17, w: 0.34, h: 0.34, fill: { color: c }, line: { color: "FFFFFF", width: 2 } });
      const bw = Math.min(2.3, step * 1.7); const bx = Math.max(X0, Math.min(X0 + CW - bw, x - bw / 2));
      s.addText(it[0], { x: bx, y: up ? y - 1.95 : y + 0.35, w: bw, h: 0.5, fontSize: 20, bold: true, color: c, fontFace: "Cambria", align: "center", valign: up ? "bottom" : "top", margin: 0, isTextBox: true });
      s.addText(it[1], { x: bx, y: up ? y - 1.45 : y + 0.85, w: bw, h: 1.15, fontSize: 15, color: HEX.ink, align: "center", valign: up ? "bottom" : "top", margin: 0, isTextBox: true });
    });
    if (o.takeaway) this._takeaway(s, o.takeaway, X0, YB - 0.75, CW, 0.75);
    this.notes(s, o.notes); return s;
  }

  // definition / key-idea panel + bullets
  async concept(o) {
    const s = this.slide("CONTENT", o.title);
    const lw = o.lw || 4.8;
    s.addShape(this.p.ShapeType.roundRect, { x: X0, y: Y0, w: lw, h: YB - Y0, fill: { color: HEX.ink }, line: { type: "none" }, rectRadius: 0.12 });
    s.addShape(this.p.ShapeType.ellipse, { x: X0 + 0.35, y: Y0 + 0.35, w: 0.8, h: 0.8, fill: { color: HEX.teal }, line: { type: "none" } });
    s.addImage({ data: await icon(o.icon || "FaBook"), x: X0 + 0.55, y: Y0 + 0.55, w: 0.4, h: 0.4 });
    s.addText(o.kicker || "Key idea", { x: X0 + 0.35, y: Y0 + 1.35, w: lw - 0.7, h: 0.4, fontSize: 14, bold: true, color: HEX.teal2, charSpacing: 2, margin: 0, isTextBox: true });
    s.addText(runs(o.def, { color: "FFFFFF" }), { x: X0 + 0.35, y: Y0 + 1.8, w: lw - 0.7, h: YB - Y0 - 2.1, fontSize: o.defSize || 21, fontFace: /[→←⇒⟨]/.test(o.def) ? "Calibri" : "Cambria", valign: "top", margin: 0, isTextBox: true });
    const rx = X0 + lw + 0.45, rw = CW - lw - 0.45;
    if (o.img) {
      const ih = o.imgH || 2.8;
      fitImage(s, o.img, rx, Y0, rw, ih);
      if (o.bullets) s.addText(bulletRuns(o.bullets, { size: o.size || 17 }), { x: rx, y: Y0 + ih + 0.2, w: rw, h: YB - Y0 - ih - 0.2, valign: "top", margin: 0, isTextBox: true });
    } else if (o.bullets) s.addText(bulletRuns(o.bullets, { size: o.size || 19 }), { x: rx, y: Y0 + 0.1, w: rw, h: YB - Y0 - 0.1, valign: "top", margin: 0, isTextBox: true });
    this.notes(s, o.notes); return s;
  }

  // hands-on lab slide with Colab link
  async lab(o) {
    const url = `https://colab.research.google.com/github/alilouati/advanced-data-mining/blob/main/labs/${o.file}`;
    const s = this.slide("CONTENT", "Hands-on lab · " + o.name);
    const lw = 4.8;
    s.addShape(this.p.ShapeType.roundRect, { x: X0, y: Y0, w: lw, h: YB - Y0, fill: { color: HEX.ink }, line: { type: "none" }, rectRadius: 0.12 });
    s.addShape(this.p.ShapeType.ellipse, { x: X0 + 0.35, y: Y0 + 0.35, w: 0.8, h: 0.8, fill: { color: HEX.amber }, line: { type: "none" } });
    s.addImage({ data: await icon("FaLaptopCode", HEX.ink), x: X0 + 0.55, y: Y0 + 0.55, w: 0.4, h: 0.4 });
    s.addText("PYTHON LAB " + o.num, { x: X0 + 0.35, y: Y0 + 1.35, w: lw - 0.7, h: 0.4, fontSize: 14, bold: true, color: HEX.teal2, charSpacing: 2, margin: 0, isTextBox: true });
    s.addText(o.name, { x: X0 + 0.35, y: Y0 + 1.8, w: lw - 0.7, h: 1.1, fontSize: 24, bold: true, color: "FFFFFF", fontFace: "Cambria", valign: "top", margin: 0, isTextBox: true });
    s.addText([{ text: "Data: ", options: { bold: true, color: HEX.amber } }, { text: o.data, options: { color: "D7E3EA" } }],
      { x: X0 + 0.35, y: Y0 + 2.95, w: lw - 0.7, h: 0.7, fontSize: 14, valign: "top", margin: 0, isTextBox: true });
    s.addShape(this.p.ShapeType.roundRect, { x: X0 + 0.35, y: Y0 + 3.75, w: 2.6, h: 0.6, fill: { color: HEX.amber }, line: { type: "none" }, rectRadius: 0.3, hyperlink: { url, tooltip: "Open in Google Colab" } });
    s.addText("▶  Open in Colab", { x: X0 + 0.35, y: Y0 + 3.75, w: 2.6, h: 0.6, fontSize: 16, bold: true, color: HEX.ink, align: "center", valign: "middle", margin: 0, isTextBox: true, hyperlink: { url, tooltip: "Open in Google Colab" } });
    s.addText("github.com/alilouati/advanced-data-mining\nlabs/" + o.file, { x: X0 + 0.35, y: Y0 + 4.5, w: lw - 0.5, h: 0.7, fontSize: 11, color: "9FB3C2", fontFace: "Courier New", valign: "top", margin: 0, isTextBox: true });
    const rx = X0 + lw + 0.45, rw = CW - lw - 0.45, n = o.steps.length, gap = 0.18, h = Math.min(0.95, (YB - Y0 - 0.55 - gap * (n - 1)) / n);
    s.addText("What you will do", { x: rx, y: Y0, w: rw, h: 0.45, fontSize: 18, bold: true, color: HEX.ink, margin: 0, isTextBox: true });
    o.steps.forEach((st, i) => {
      const y = Y0 + 0.55 + i * (h + gap);
      s.addShape(this.p.ShapeType.roundRect, { x: rx, y, w: rw, h, fill: { color: i % 2 ? HEX.light : HEX.tint }, line: { type: "none" }, rectRadius: 0.08 });
      s.addShape(this.p.ShapeType.ellipse, { x: rx + 0.2, y: y + (h - 0.46) / 2, w: 0.46, h: 0.46, fill: { color: HEX.teal }, line: { type: "none" } });
      s.addText(String(i + 1), { x: rx + 0.2, y: y + (h - 0.46) / 2, w: 0.46, h: 0.46, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(runs(st, { color: HEX.ink }), { x: rx + 0.85, y, w: rw - 1.05, h, fontSize: 16, valign: "middle", margin: 0, isTextBox: true });
    });
    this.notes(s, (o.notes ? o.notes + " " : "") + "Notebook: " + url + " — the repository is private, so students must be added as collaborators or authorise GitHub inside Colab (File > Open notebook > GitHub, tick 'Include private repos'). Every lab runs on a built-in data set; setting USE_MY_CSV = True lets students upload their own CSV.");
    return s;
  }

  // research spotlight — instructor publications
  async spotlight(o) {
    const s = this.slide("CONTENT", o.title || "Research spotlight · Dr. Ali Louati's group");
    s.addText(runs(o.lead || "How this chapter's methods appear in our own published research", { color: HEX.slate }), { x: X0, y: Y0 - 0.05, w: CW, h: 0.45, fontSize: 16, italic: true, margin: 0, isTextBox: true });
    const n = o.pubs.length, cols = n <= 2 ? n : 2, rows = Math.ceil(n / cols), gap = 0.3;
    const cw = (CW - gap * (cols - 1)) / cols, ch = (YB - Y0 - 0.55 - gap * (rows - 1)) / rows;
    for (let i = 0; i < n; i++) {
      const p = o.pubs[i], r = Math.floor(i / cols), c = i % cols, x = X0 + c * (cw + gap), y = Y0 + 0.55 + r * (ch + gap);
      s.addShape(this.p.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: "F7FAFB" }, line: { color: "DCE5E9", width: 0.75 }, rectRadius: 0.1, shadow: { type: "outer", color: "9AA7B2", opacity: 0.25, blur: 6, offset: 2, angle: 90 } });
      s.addShape(this.p.ShapeType.roundRect, { x: x + 0.25, y: y + 0.22, w: Math.min(cw - 0.5, 0.12 * p.venue.length + 0.5), h: 0.38, fill: { color: [HEX.teal, HEX.amber, HEX.plum, HEX.coral][i % 4] }, line: { type: "none" }, rectRadius: 0.19 });
      s.addText(p.venue, { x: x + 0.25, y: y + 0.22, w: Math.min(cw - 0.5, 0.12 * p.venue.length + 0.5), h: 0.38, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(p.t, { x: x + 0.25, y: y + 0.7, w: cw - 0.5, h: 0.85, fontSize: 15.5, bold: true, color: HEX.ink, valign: "top", margin: 0, isTextBox: true });
      s.addText(runs(p.why, { color: HEX.slate }), { x: x + 0.25, y: y + 1.55, w: cw - 0.5, h: ch - 1.65, fontSize: 13.5, valign: "top", margin: 0, isTextBox: true });
    }
    this.notes(s, o.notes); return s;
  }

  async summary(items, o = {}) {
    const s = this.slide("CONTENT", o.title || "Key takeaways");
    const n = items.length, gap = 0.22, h = Math.min(1.0, (YB - Y0 - gap * (n - 1)) / n);
    for (let i = 0; i < n; i++) {
      const y = Y0 + i * (h + gap);
      s.addShape(this.p.ShapeType.ellipse, { x: X0, y: y + (h - 0.5) / 2, w: 0.5, h: 0.5, fill: { color: HEX.teal }, line: { type: "none" } });
      s.addImage({ data: await icon("FaCheck"), x: X0 + 0.13, y: y + (h - 0.5) / 2 + 0.13, w: 0.24, h: 0.24 });
      s.addText(runs(items[i], { color: HEX.ink }), { x: X0 + 0.75, y, w: CW - 0.75, h, fontSize: 18, valign: "middle", margin: 0, isTextBox: true });
    }
    this.notes(s, o.notes); return s;
  }

  async references(refs, o = {}) {
    const s = this.slide("CONTENT", o.title || "References & further reading");
    const half = Math.ceil(refs.length / 2), cw = (CW - 0.4) / 2;
    [refs.slice(0, half), refs.slice(half)].forEach((col, i) => {
      const tr = [];
      col.forEach((r, j) => tr.push(...runs(r, { color: HEX.ink }).map((rr, k, arr) => { if (k === 0) rr.options.paraSpaceAfter = 7; if (k === arr.length - 1 && j < col.length - 1) rr.options.breakLine = true; return rr; })));
      s.addText(tr, { x: X0 + i * (cw + 0.4), y: Y0, w: cw, h: YB - Y0, fontSize: o.size || 12, valign: "top", margin: 0, isTextBox: true });
    });
    this.notes(s, o.notes); return s;
  }

  async closing(o = {}) {
    const s = this.slide("DARK");
    s.addText("Thank you", { x: X0, y: 2.0, w: 8, h: 1.1, fontSize: 48, bold: true, color: "FFFFFF", fontFace: "Cambria", margin: 0, isTextBox: true });
    s.addText(o.next ? "Next: " + o.next : "Questions & discussion", { x: X0, y: 3.15, w: 11, h: 0.6, fontSize: 22, color: HEX.amber, margin: 0, isTextBox: true });
    s.addText([{ text: AUTHOR, options: { fontSize: 20, bold: true, color: "FFFFFF", breakLine: true } },
      { text: AFFIL, options: { fontSize: 14, color: "C9D6DF", breakLine: true } },
      { text: EMAIL, options: { fontSize: 14, color: HEX.teal2 } }], { x: X0, y: 4.6, w: 11, h: 1.2, margin: 0, isTextBox: true });
    const pts = [[10.3, 1.4, .7, HEX.teal], [11.5, 2.3, .4, HEX.amber], [10.9, 3.2, .25, HEX.coral], [12.1, 1.2, .3, HEX.teal2]];
    pts.forEach(([x, y, r, c], i) => s.addShape(this.p.ShapeType.ellipse, { x, y, w: r, h: r, fill: { color: c, transparency: 15 }, line: { type: "none" }, objectName: "motif dot " + i }));
    this.notes(s, o.notes);
  }

  async save(file) {
    await this.p.writeFile({ fileName: file });
    await applyTheme(file, THEME);
    console.log("wrote", file, this.p.slides.length, "slides");
  }
}
module.exports = { Deck, HEX };
