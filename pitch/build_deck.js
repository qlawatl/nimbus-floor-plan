// Location Intelligence: seed pitch deck (Berkeley SkyDeck). Native shapes only, so the file stays small and editable in Google Slides.
const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';               // 10 x 5.625 in
pres.title = 'Lumo: Location Intelligence for Critical Infrastructure';
pres.author = 'Quinn Lawery';

const F = 'Arial';
const INK = '0D1B24', TXT = '1C252D', MUT = '66737D', LINE = 'DDE2E6', BG = 'FAFAFA', CARD = 'FFFFFF';
const ACC = '0B8A7C', ACC_T = 'E3F2EF', AMB = 'D98E1F', AMB_T = 'FBF0DE', RED = 'C2463D', RED_T = 'F8E3E1';
const W = 10, M = 0.5;
let n = 0;

function base(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? INK : BG };
  n++;
  if (n > 1) s.addText(String(n), { x: W - 0.9, y: 5.22, w: 0.5, h: 0.25, fontFace: F, fontSize: 9, color: dark ? '8FA3B0' : MUT, align: 'right', isTextBox: true, margin: 0 });
  return s;
}
function title(s, t, dark) {
  s.addText(t, { x: M, y: 0.32, w: W - 2 * M, h: 0.95, fontFace: F, fontSize: 24, bold: true, color: dark ? 'FFFFFF' : INK, valign: 'top', isTextBox: true, margin: 0 });
}
function note(s, t, dark) {
  s.addText(t, { x: M, y: 5.12, w: W - 2 * M - 0.6, h: 0.38, fontFace: F, fontSize: 9, color: dark ? '8FA3B0' : MUT, valign: 'bottom', isTextBox: true, margin: 0 });
}
function txt(s, t, o) { s.addText(t, Object.assign({ fontFace: F, fontSize: 13, color: TXT, valign: 'top', isTextBox: true, margin: 0 }, o)); }
function box(s, x, y, w, h, fill, line, r) {
  s.addShape(r === 0 ? pres.shapes.RECTANGLE : pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 1 } : { type: 'none' }, rectRadius: r == null ? 0.08 : r });
}
function dot(s, x, y, d, label, fill, color, size) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' } });
  s.addText(label, { x, y, w: d, h: d, fontFace: F, fontSize: size || 12, bold: true, color: color || 'FFFFFF', align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
}
function lineAB(s, x1, y1, x2, y2, o) {
  s.addShape(pres.shapes.LINE, Object.assign({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001, flipH: (x2 - x1) * (y2 - y1) < 0 }, o));
}
function phone(s, file, x, y, h, ratio) {
  const w = h * (ratio || 560 / 1212);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14, fill: { color: '10202B' }, line: { type: 'none' }, rectRadius: 0.16,
    shadow: { type: 'outer', color: '000000', opacity: 0.22, blur: 8, offset: 3, angle: 90 } });
  s.addImage({ path: '' + __dirname + '/shots/' + file, x, y, w, h });
  return w;
}
function arrow(s, x1, y1, x2, y2, color, dash) {
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: x2 < x1, flipV: y2 < y1, line: { color: color || MUT, width: 1.5, endArrowType: 'triangle', dashType: dash ? 'dash' : 'solid' } });
}

/* 1 Title */
{
  const s = base(true);
  txt(s, 'LUMO', { x: M, y: 0.75, w: 6, h: 0.75, fontSize: 44, bold: true, color: '5FD3C2', charSpacing: 6 });
  txt(s, 'Location intelligence for the world\'s most critical infrastructure', { x: M, y: 1.55, w: 6.2, h: 1.5, fontSize: 28, bold: true, color: 'FFFFFF' });
  txt(s, 'Every alarm, work order, PO, invoice and asset move, at the exact unit, online or off.', { x: M, y: 3.2, w: 5.8, h: 0.7, fontSize: 15, color: 'B9C7D0' });
  txt(s, 'Seed pitch · Berkeley SkyDeck · November 2026\nQuinn Lawery, Founder', { x: M, y: 4.25, w: 6, h: 0.7, fontSize: 12.5, color: '8FA3B0' });
  phone(s, 'a_plan.jpg', 7.35, 0.42, 4.75);
}


/* 2 Problem */
{
  const s = base(); title(s, 'A data center unit\'s history is split across six systems that share no key');
  const ids = [['BMS alarm', 'E1.B1.CH.02.CH_LOW_EVAP_TEMP'], ['CMMS work order', 'WO-3000159 · asset A100022'], ['ERP invoice', 'INV-0000175 · PO-4500157 only']];
  ids.forEach(([sys, id], i) => {
    const y = 1.5 + i * 0.95;
    box(s, M, y, 3.3, 0.75, CARD, LINE, 0.08);
    txt(s, [{ text: sys, options: { bold: true, color: INK, breakLine: true } }, { text: id, options: { fontFace: 'Courier New', color: TXT, fontSize: 11 } }], { x: M + 0.15, y: y + 0.1, w: 3.1, h: 0.6, fontSize: 13 });
    s.addShape(pres.shapes.OVAL, { x: M + 3.4, y: y + 0.27, w: 0.22, h: 0.22, fill: { color: RED }, line: { type: 'none' } });
    txt(s, '×', { x: M + 3.4, y: y + 0.24, w: 0.22, h: 0.25, fontSize: 11, bold: true, color: 'FFFFFF', align: 'center' });
  });
  txt(s, 'Each names the same chiller differently. No technician can see all of it at the unit, and almost never without a signal.', { x: M, y: 4.4, w: 4.0, h: 0.6, fontSize: 12, color: TXT });
  const st = [['29%', 'of the average enterprise\'s 897 apps are integrated¹', RED], ['57%', 'of operators\' last major outage cost over $100K²', INK], ['1 in 5', 'cost over $1 million²', INK]];
  st.forEach(([big, lab, c], i) => {
    const y = 1.45 + i * 1.18;
    txt(s, big, { x: 5.0, y, w: 1.9, h: 0.8, fontSize: 38, bold: true, color: c });
    txt(s, lab, { x: 6.95, y: y + 0.2, w: 2.55, h: 0.6, fontSize: 12.5, color: TXT });
  });
  note(s, '¹ MuleSoft 2025 Connectivity Benchmark (1,050 IT leaders). ² Uptime Institute Annual Outage Analysis 2026 (2025 survey). IDs from the MVP\'s synthetic dataset.');
}

/* 3 Why now */
{
  const s = base(); title(s, 'Capacity nearly doubles to 200 GW by 2030. DCEO and DCO teams need Lumo on day one');
  const bars = [['2025', 103, '103 GW', 'B8C2C9'], ['2030', 200, '200 GW', ACC]];
  const by = 4.6, mh = 2.45;
  bars.forEach(([k, v, lab, c], i) => { const x = 0.9 + i * 1.55, h = mh * v / 200; box(s, x, by - h, 1.05, h, c, null, 0.04);
    txt(s, lab, { x: x - 0.2, y: by - h - 0.36, w: 1.45, h: 0.3, fontSize: 15, bold: true, color: i ? ACC : INK, align: 'center' });
    txt(s, k, { x, y: by + 0.05, w: 1.05, h: 0.28, fontSize: 12, color: MUT, align: 'center' }); });
  s.addShape(pres.shapes.LINE, { x: 0.7, y: by, w: 3.3, h: 0, line: { color: LINE, width: 1 } });
  txt(s, 'Global data center capacity¹', { x: 0.7, y: 1.38, w: 3.4, h: 0.3, fontSize: 12, bold: true, color: INK });
  const pts = [['$720–745B of hyperscaler capex in 2026²', 'every dollar lands as assets someone must keep running'], ['History from the first crate', 'breakers and drives tracked vendor to install before a hall energizes'], ['Works before the network does', 'offline-first from commissioning'], ['No slack left', 'occupancy near 97%¹: an outage hits customers at once']];
  pts.forEach(([a, b], i) => {
    const y = 1.42 + i * 0.86;
    dot(s, 4.55, y, 0.38, String(i + 1), ACC);
    txt(s, [{ text: a, options: { bold: true, color: INK, breakLine: true } }, { text: b }], { x: 5.1, y: y - 0.03, w: 4.4, h: 0.8, fontSize: 12.5 });
  });
  note(s, '¹ JLL 2026 Global Data Center Outlook, Jan 2026. ² Amazon, Alphabet, Microsoft and Meta 2026 guidance, compiled by datacentres.com, Oct 2026. DCEO/DCO: data center engineering operations / data center operations.');
}

/* 4 Solution (dark) */
{
  const s = base(true); title(s, 'Lumo links every record to the physical unit, logs every change, and ships the site offline', true);
  const src = [['Alarms', '14,474'], ['Alerts', '4,486'], ['Work orders', '8,214'], ['Labor', '14,860'], ['POs', '3,505'], ['Invoices', '3,740'], ['Asset moves', '623']];
  src.forEach(([t, n], i) => {
    const y = 1.45 + i * 0.47;
    box(s, M, y, 2.0, 0.36, '1B2E3B', null, 0.06);
    txt(s, [{ text: t, options: { color: 'D5DFE5' } }, { text: '  ' + n, options: { color: '5FD3C2', bold: true } }], { x: M + 0.12, y: y + 0.07, w: 1.85, h: 0.25, fontSize: 11.5 });
    arrow(s, M + 2.05, y + 0.18, 3.25, 3.0, '3E5A6A');
  });
  box(s, 3.3, 2.4, 2.2, 1.2, ACC, null, 0.1);
  txt(s, [{ text: 'Position graph', options: { bold: true, breakLine: true } }, { text: '172 units · 71,931 logged events', options: { fontSize: 11, color: 'D9F2EE' } }], { x: 3.4, y: 2.58, w: 2.0, h: 0.9, fontSize: 15, color: 'FFFFFF', align: 'center' });
  const outs = [['Complete history', 'tap any unit, any day'], ['Traced lineage', 'vendor → rack → repair → stock'], ['Every change kept', 'not just the latest number'], ['Secure offline', 'encrypted, provisioned per site']];
  outs.forEach(([a, b], i) => {
    const y = 1.45 + i * 0.85;
    arrow(s, 5.55, 3.0, 6.25, y + 0.33, '5FD3C2');
    box(s, 6.3, y, 3.2, 0.68, '1B2E3B', null, 0.06);
    txt(s, [{ text: a, options: { bold: true, breakLine: true, color: 'FFFFFF' } }, { text: b, options: { color: 'A9BCC7' } }], { x: 6.45, y: y + 0.08, w: 2.95, h: 0.55, fontSize: 12.5 });
  });
  note(s, 'Operations, purchasing, finance and workforce data from the MVP\'s synthetic two-site dataset, Jan 2025–Oct 2026.', true);
}

/* 7 Pillar: complete history */
{
  const s = base(); title(s, 'Tap a unit. Its entire history opens. Swipe the months and it flips like a carousel');
  phone(s, 'b_burst.jpg', M + 0.07, 1.42, 3.55);
  phone(s, 'c_list.jpg', M + 1.95, 1.42, 3.55);
  const pts = [['Tap', 'a unit on the floor plan: every record type bursts out, sized by count'], ['Drill', 'by alarm code, vendor, technician or month'], ['Swipe', 'across the month bars and the list flips month by month'], ['Read priority', 'at a glance: P1–P5 shapes, Rush, Long lead, High cost']];
  pts.forEach(([a, b], i) => {
    const y = 1.45 + i * 0.86;
    dot(s, 4.55, y, 0.38, String(i + 1), ACC);
    txt(s, [{ text: a + ' ', options: { bold: true, color: INK } }, { text: b }], { x: 5.1, y: y - 0.02, w: 4.4, h: 0.8, fontSize: 13 });
  });
  note(s, 'Screens from the v10.3 build: chiller CH-02 at E1-B1, synthetic dataset (fictional operator "Nimbus").');
}

/* 8 Pillar: lineage */
{
  const s = base(); title(s, 'Every breaker, drive and chiller carries a full chain of custody, vendor to rack and back');
  const st = [['Eaton', 'vendor', '2022-12'], ['Central warehouse', 'received', '2022-12'], ['Storeroom bin C-06-1', 'stocked', '2023-01'], ['SWGR-02', 'in service', '2023-02'], ['Quarantine', 'removed after fault', '2026-05-12'], ['Eaton Service Center', 'vendor repair', '2026-05-15'], ['Bin B-04-3', 'back in stock, refurbished', '2026-06-14']];
  st.forEach(([a, b, d], i) => {
    const y = 1.42 + i * 0.47, col = i === 4 ? RED : i === 5 ? AMB : i >= 3 ? ACC : '7E8B94';
    if (i) lineAB(s, M + 0.19, y - 0.1, M + 0.19, y + 0.02, { line: { color: i >= 4 ? ACC : 'A3AEB5', width: 1.5 } });
    dot(s, M, y, 0.38, String(i + 1), col, 'FFFFFF', 12);
    txt(s, [{ text: a, options: { bold: true, color: INK } }, { text: '  ' + b, options: {} }, { text: '  ' + d, options: { color: MUT, fontSize: 10.5 } }], { x: M + 0.55, y: y + 0.06, w: 5.2, h: 0.3, fontSize: 12.5 });
  });
  box(s, M, 4.68, 6.3, 0.42, ACC_T, null, 0.06);
  txt(s, [{ text: '201 assets, 623 moves tracked. ', options: { bold: true, color: INK } }, { text: 'The repair loop replays on a map.' }], { x: M + 0.15, y: 4.75, w: 6.0, h: 0.3, fontSize: 11.5 });
  phone(s, 'd_journey.jpg', 7.35, 1.35, 3.75);
  note(s, 'Eaton VCP-W breaker TAG-BRKR-100187 at SWGR-02, synthetic dataset. Map locations in the product are labeled mock.');
}


/* 7 Tech edge */
{
  const s = base(); title(s, 'Faster than a server, 24x smaller, and it works with zero bars of signal');
  const cards = [
    ['1.1 ms', 'median drill-down', 'on the device, across 49,000 records. The same question on a server with all six sources pre-joined: 6.7 ms, plus the network.'],
    ['24x', 'smaller than raw JSON', '49,000 records in 0.49 MB, under 10 bytes each: position keys, string dictionary, delta timestamps, integer IDs, gzip. Whole product 0.9 MB.'],
    ['Offline', 'encrypted per site', 'AES-256-GCM snapshot, key via PBKDF2 310K rounds, decrypted in memory only. A lost tablet holds ciphertext.'],
  ];
  cards.forEach(([big, lab, sub], i) => {
    const x = M + i * 3.05;
    box(s, x, 1.45, 2.8, 2.85, CARD, LINE, 0.08);
    txt(s, big, { x: x + 0.22, y: 1.58, w: 2.4, h: 0.8, fontSize: 40, bold: true, color: ACC });
    txt(s, lab, { x: x + 0.22, y: 2.4, w: 2.4, h: 0.3, fontSize: 13.5, bold: true, color: INK });
    txt(s, sub, { x: x + 0.22, y: 2.75, w: 2.4, h: 1.5, fontSize: 11.5, color: TXT });
  });
  box(s, M, 4.45, 9.0, 0.48, INK, null, 0.06);
  txt(s, 'Field techs need this history most when there is no signal, and no system today can give it to them.', { x: M + 0.18, y: 4.53, w: 8.7, h: 0.32, fontSize: 12.5, bold: true, color: 'FFFFFF' });
  note(s, 'Measured Nov 9 2026 on the v10.3 build and synthetic dataset: 1,032 drill-downs in headless Chrome (p95 2.1 ms, slowest 13.3 ms); server figure is DuckDB across 172 units, excluding network.');
}

/* 8 Market and buyers */
{
  const s = base(); title(s, 'Two buyers in a data center operations market growing toward $33B');
  const bars = [['2025', 8.55, '$8.6B', 'B8C2C9'], ['2036', 33.33, '$33.3B', ACC]];
  const base_y = 4.55, maxH = 2.6;
  bars.forEach(([k, v, lab, c], i) => {
    const x = 0.85 + i * 1.5, h = maxH * v / 33.33;
    box(s, x, base_y - h, 1.0, h, c, null, 0.04);
    txt(s, lab, { x: x - 0.2, y: base_y - h - 0.36, w: 1.4, h: 0.3, fontSize: 15, bold: true, color: i ? ACC : INK, align: 'center' });
    txt(s, k, { x, y: base_y + 0.05, w: 1.0, h: 0.28, fontSize: 12, color: MUT, align: 'center' });
  });
  s.addShape(pres.shapes.LINE, { x: 0.7, y: base_y, w: 3.1, h: 0, line: { color: LINE, width: 1 } });
  txt(s, 'DC facility management and O&M services¹', { x: 0.7, y: 1.42, w: 3.3, h: 0.5, fontSize: 12, bold: true, color: INK });
  const cols = [['Hyperscale operators', 'Own the fleet and the downtime risk: root cause in minutes, component lineage for audits, offline access in restricted halls.'], ['IFM providers', 'Run sites for many clients: one view across each client\'s CMMS and ERP, verifiable history at handover. ABM: $8.7B FY2025 revenue².']];
  cols.forEach(([h, b], i) => {
    const y = 1.45 + i * 1.6;
    box(s, 4.4, y, 5.1, 1.42, CARD, LINE, 0.08);
    txt(s, h, { x: 4.6, y: y + 0.13, w: 4.7, h: 0.32, fontSize: 15, bold: true, color: INK });
    txt(s, b, { x: 4.6, y: y + 0.5, w: 4.75, h: 0.85, fontSize: 12 });
  });
  note(s, '¹ Meticulous Research, DC Facility Management & O&M Services Market 2026–2036. ² ABM Industries 10-K, FY ended Oct 31 2025.');
}

/* 13 Business model */
{
  const s = base(); title(s, 'Proposed model: recurring per-site subscriptions, plus IFM partner licensing');
  const cards = [['Site subscription', 'Operators pay per site per year for the layer, connectors and snapshot provisioning.'], ['IFM partner license', 'Providers deploy across the client sites they run and include it in their service contracts.'], ['Onboarding', 'One-time fee per source system to map CMMS, BMS and ERP exports to positions.']];
  cards.forEach(([h, b], i) => {
    const x = M + i * 3.05;
    box(s, x, 1.5, 2.8, 2.5, CARD, LINE, 0.08);
    dot(s, x + 0.22, 1.7, 0.42, String(i + 1), ACC);
    txt(s, h, { x: x + 0.22, y: 2.28, w: 2.4, h: 0.35, fontSize: 15, bold: true, color: INK });
    txt(s, b, { x: x + 0.22, y: 2.7, w: 2.4, h: 1.2, fontSize: 12.5 });
  });
  box(s, M, 4.25, 8.9, 0.6, AMB_T, null, 0.08);
  txt(s, 'Prices are not set yet: pilots measure hours saved per work order and parts reused from stock to anchor them.', { x: M + 0.18, y: 4.33, w: 8.55, h: 0.5, fontSize: 12 });
}

/* 14 Positioning 2x2 */
{
  const s = base(); title(s, 'Systems of record stop at their own walls. Lumo connects them at the unit, even offline');
  const X = 1.3, Y = 1.45, Wd = 4.6, Hd = 3.4;
  box(s, X, Y, Wd, Hd, CARD, LINE, 0);
  s.addShape(pres.shapes.LINE, { x: X + Wd / 2, y: Y, w: 0, h: Hd, line: { color: LINE, width: 1 } });
  s.addShape(pres.shapes.LINE, { x: X, y: Y + Hd / 2, w: Wd, h: 0, line: { color: LINE, width: 1 } });
  txt(s, 'One system\'s data', { x: X, y: Y + Hd + 0.05, w: 2, h: 0.25, fontSize: 10.5, color: MUT });
  txt(s, 'Every system, at the unit', { x: X + Wd - 2.2, y: Y + Hd + 0.05, w: 2.2, h: 0.25, fontSize: 10.5, color: MUT, align: 'right' });
  txt(s, 'Field,\noffline', { x: M, y: Y, w: 0.75, h: 0.5, fontSize: 10.5, color: MUT });
  txt(s, 'Desk,\nonline', { x: M, y: Y + Hd - 0.5, w: 0.75, h: 0.5, fontSize: 10.5, color: MUT });
  const pts = [['CMMS / EAM', 1.85, 3.25, '7E8B94'], ['BMS / DCIM', 1.6, 4.25, '7E8B94'], ['ERP', 2.45, 4.45, '7E8B94'], ['BI dashboards', 4.3, 4.2, '7E8B94'], ['Lumo', 5.5, 1.75, ACC]];
  pts.forEach(([l, x, y, c]) => {
    s.addShape(pres.shapes.OVAL, { x: x - 0.1, y: y - 0.1, w: 0.2, h: 0.2, fill: { color: c }, line: { type: 'none' } });
    if (c === ACC) txt(s, l, { x: x - 1.85, y: y + 0.15, w: 1.85, h: 0.28, fontSize: 11, bold: true, color: ACC, align: 'right' });
    else txt(s, l, { x: x + 0.15, y: y - 0.13, w: 1.8, h: 0.28, fontSize: 11, color: TXT });
  });
  txt(s, 'Plugs in, never rips out', { x: 6.35, y: 1.5, w: 3.2, h: 0.35, fontSize: 14, bold: true, color: INK });
  txt(s, [
    { text: 'Reads exports from the systems a site already runs; nothing is migrated.', options: { bullet: true, breakLine: true } },
    { text: 'Keys every record to a position, so history stays with the unit when equipment is swapped.', options: { bullet: true, breakLine: true } },
    { text: 'Runs as one file on a tablet, so it works where the rest need a network.', options: { bullet: true } },
  ], { x: 6.35, y: 1.9, w: 3.2, h: 2.9, fontSize: 12.5, paraSpaceAfter: 8 });
  note(s, 'Placement is the founder\'s view of each category\'s typical use, not a feature-by-feature comparison.');
}


/* 11 Team */
{
  const s = base(); title(s, 'Built by an operator: 20+ years running maintenance for critical facilities');
  box(s, M, 1.45, 4.3, 3.4, CARD, LINE, 0.08);
  dot(s, M + 0.3, 1.7, 0.9, 'QL', INK, 'FFFFFF', 20);
  txt(s, [{ text: 'Quinn Lawery', options: { bold: true, breakLine: true, fontSize: 18, color: INK } }, { text: 'Founder', options: { color: MUT } }], { x: M + 1.4, y: 1.8, w: 2.7, h: 0.75, fontSize: 13 });
  txt(s, [
    { text: 'CMMS/EAM platforms: IBM Maximo/MAS, Hexagon EAM', options: { bullet: true, breakLine: true } },
    { text: 'Semiconductor fab operations and critical utilities', options: { bullet: true, breakLine: true } },
    { text: 'IFM leadership', options: { bullet: true, breakLine: true } },
    { text: 'Built the working product end to end', options: { bullet: true } },
  ], { x: M + 0.3, y: 2.85, w: 3.85, h: 1.9, fontSize: 12.5, paraSpaceAfter: 6 });
  txt(s, 'First hires', { x: 5.3, y: 1.5, w: 4, h: 0.35, fontSize: 14, bold: true, color: INK });
  const hires = [['Founding engineer', 'data pipelines and connectors'], ['Security engineer (contract)', 'provisioning, key management, review'], ['Pilot lead', 'a site operations veteran to run pilots']];
  hires.forEach(([a, b], i) => {
    const y = 2.0 + i * 0.85;
    dot(s, 5.3, y, 0.38, String(i + 1), ACC);
    txt(s, [{ text: a, options: { bold: true, breakLine: true, color: INK } }, { text: b, options: { color: MUT } }], { x: 5.85, y: y - 0.04, w: 3.6, h: 0.65, fontSize: 12.5 });
  });
}

/* 12 Ask (dark) */
{
  const s = base(true); title(s, 'Back Lumo at SkyDeck: $200K takes it from working product to paid pilots', true);
  txt(s, '$200K', { x: M, y: 1.45, w: 3.5, h: 0.95, fontSize: 52, bold: true, color: '5FD3C2' });
  txt(s, 'Berkeley SkyDeck Fund investment for Cohort teams¹', { x: M, y: 2.4, w: 3.2, h: 0.55, fontSize: 12.5, color: 'D5DFE5' });
  const use = [['50%', 'Connectors and two paid pilot sites'], ['30%', 'Security: per-user keys, independent review'], ['20%', 'Founding engineer, part year']];
  use.forEach(([p, l], i) => {
    const y = 3.15 + i * 0.5;
    box(s, M, y, 0.7, 0.38, '1B2E3B', null, 0.06);
    txt(s, p, { x: M, y: y + 0.07, w: 0.7, h: 0.26, fontSize: 12, bold: true, color: '5FD3C2', align: 'center' });
    txt(s, l, { x: M + 0.85, y: y + 0.07, w: 3.2, h: 0.3, fontSize: 12, color: 'D5DFE5' });
  });
  txt(s, 'Milestones', { x: 5.2, y: 1.5, w: 4, h: 0.32, fontSize: 14, bold: true, color: 'FFFFFF' });
  const ms = [['Now', 'Working product: history, lineage, compression, encrypted offline'], ['Q1 2027', 'Live CMMS, BMS and ERP connectors at a pilot site'], ['Q2 2027', 'Per-user keys; RFID/NFC position-tag pilot'], ['Q3 2027', 'Anomaly detection on live data'], ['Q4 2027', 'First IFM partner rollout']];
  ms.forEach(([w, t], i) => {
    const y = 1.95 + i * 0.55;
    dot(s, 5.2, y, 0.32, String(i + 1), i === 0 ? ACC : '3E5A6A', 'FFFFFF', 10);
    txt(s, [{ text: w + '  ', options: { bold: true, color: '5FD3C2' } }, { text: t, options: { color: 'D5DFE5' } }], { x: 5.65, y: y + 0.02, w: 3.85, h: 0.5, fontSize: 11.5 });
  });
  note(s, '¹ skydeck.berkeley.edu/program. Quarters from Q1 2027 are the plan, not commitments. Product figures come from the MVP\'s synthetic dataset.', true);
}

pres.writeFile({ fileName: __dirname + '/Lumo_SkyDeck_Pitch.pptx', compression: true }).then(f => console.log('wrote', f));
