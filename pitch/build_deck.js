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

/* 2 Executive summary */
{
  const s = base(); title(s, 'Executive summary');
  const rows = [
    ['Problem', 'A data center unit\'s history is shattered across six or more systems. The technician standing at it sees one slice, and only with a signal.'],
    ['Product', 'Lumo unifies operations, purchasing, finance and workforce records at the physical unit, logs every change, and ships a whole site as an encrypted offline file.'],
    ['Proof', 'Working product (v10) on a synthetic two-site operator: 49K records packed into 0.49 MB (24x smaller than raw JSON), the whole product in 0.9 MB, every drill-down under 8 ms.'],
    ['Buyers', 'Hyperscale operators who own the sites, and integrated facility management (IFM) providers such as ABM who run them.'],
    ['Ask', '$200K SkyDeck Cohort investment to plug into live CMMS, BMS and ERP systems and land the first paid pilots.'],
  ];
  rows.forEach(([k, v], i) => {
    const y = 1.2 + i * 0.78;
    dot(s, M, y + 0.02, 0.38, String(i + 1), ACC);
    txt(s, k, { x: M + 0.55, y, w: 1.3, h: 0.4, fontSize: 14, bold: true, color: INK });
    txt(s, v, { x: M + 1.9, y, w: 7.1, h: 0.66, fontSize: 13 });
  });
}

/* 3 Problem */
{
  const s = base(); title(s, 'Data center history is shattered across six systems, and none of them meet at the unit');
  const cx = 3.2, cy = 3.05;
  const src = [['BMS', 'alarms'], ['Paging', 'alerts'], ['CMMS', 'work orders'], ['CMMS', 'labor hours'], ['ERP', 'purchase orders'], ['ERP', 'invoices']];
  const pos = [[0.5, 1.35], [2.45, 1.35], [4.4, 1.35], [0.5, 4.05], [2.45, 4.05], [4.4, 4.05]];
  src.forEach(([a, b], i) => {
    const [x, y] = pos[i];
    box(s, x, y, 1.7, 0.62, CARD, LINE);
    txt(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: MUT } }], { x: x + 0.12, y: y + 0.08, w: 1.5, h: 0.5, fontSize: 12 });
    lineAB(s, x + 0.85, y < cy ? y + 0.62 : y, cx + 0.6, y < cy ? cy - 0.25 : cy + 0.55, { line: { color: 'B8C2C9', width: 1.25, dashType: 'dash' } });
  });
  box(s, cx - 0.2, cy - 0.25, 1.6, 0.8, RED_T, RED);
  txt(s, [{ text: 'UPS-03', options: { bold: true, breakLine: true } }, { text: 'one position', options: { color: MUT } }], { x: cx - 0.05, y: cy - 0.15, w: 1.4, h: 0.6, fontSize: 13, align: 'center' });
  // right column
  txt(s, 'What that costs on the floor', { x: 6.55, y: 1.35, w: 3, h: 0.3, fontSize: 14, bold: true, color: INK });
  txt(s, [
    { text: 'Technicians see the open work order, not the 40 alarms before it.', options: { bullet: true, breakLine: true } },
    { text: 'Planners can\'t tell a refurbished spare from new stock without a records search.', options: { bullet: true, breakLine: true } },
    { text: 'Finance sees spend by PO, not by the unit that keeps failing.', options: { bullet: true, breakLine: true } },
    { text: 'Most tools need a network connection the data hall may not allow.', options: { bullet: true } },
  ], { x: 6.55, y: 1.75, w: 3.0, h: 3.0, fontSize: 12.5, paraSpaceAfter: 8 });
  note(s, 'Systems shown are the six source feeds modeled in the MVP. The "40 alarms" line is illustrative.');
}

/* 4 Stakes */
{
  const s = base(); title(s, 'Downtime is a seven-figure event, and operators say most of it is preventable');
  const stats = [['57%', 'of operators said their most recent major outage cost more than $100,000¹'], ['1 in 5', 'said it cost more than $1 million, for the second year running¹'], ['80%', 'believe better management and processes would have prevented their most recent outage²']];
  stats.forEach(([big, lab], i) => {
    const x = M + i * 3.05;
    box(s, x, 1.55, 2.8, 2.9, CARD, LINE);
    txt(s, big, { x: x + 0.25, y: 1.8, w: 2.4, h: 1.0, fontSize: 48, bold: true, color: i === 2 ? ACC : INK });
    txt(s, lab, { x: x + 0.25, y: 2.95, w: 2.35, h: 1.3, fontSize: 13 });
  });
  note(s, '¹ Uptime Institute, Annual Outage Analysis 2026 (2025 survey), May 2026. ² Uptime Institute, Annual Outage Analysis 2025, via Data Center Knowledge.');
}

/* 5 Timing: hyperscaler capex bars */
{
  const s = base(); title(s, 'Hyperscalers are pouring $720–745B into 2026 capex. Every dollar lands as assets to keep running');
  const data = [['Amazon', 220, '~$220B'], ['Alphabet', 200, '$195–205B'], ['Microsoft', 175, '~$175B'], ['Meta', 137.5, '$130–145B']];
  const x0 = 2.0, maxW = 5.6, y0 = 1.65;
  data.forEach(([k, v, lab], i) => {
    const y = y0 + i * 0.78, w = maxW * v / 220;
    txt(s, k, { x: M, y: y + 0.1, w: 1.4, h: 0.35, fontSize: 14, bold: true, color: INK });
    box(s, x0, y, w, 0.52, i === 0 ? ACC : '8FC9C1', null, 0.04);
    txt(s, lab, { x: x0 + w + 0.12, y: y + 0.1, w: 1.4, h: 0.35, fontSize: 13, bold: true, color: TXT });
  });
  note(s, 'Calendar-2026 capex guidance. Figures are indicative: Amazon reports cash capex, Microsoft and Meta include finance leases. Alphabet and Meta bars use range midpoints. Source: datacentres.com, compiled from Q2 2026 earnings calls, checked Oct 2026.');
}

/* 5b Day one: DCEO and DCO */
{
  const s = base(); title(s, 'Capacity nearly doubles to 200 GW by 2030. DCEO and DCO teams need Lumo on day one');
  const bars = [['2025', 103, '103 GW', 'B8C2C9'], ['2030', 200, '200 GW', ACC]];
  const by = 4.6, mh = 2.9;
  bars.forEach(([k, v, lab, c], i) => { const x = 0.9 + i * 1.55, h = mh * v / 200; box(s, x, by - h, 1.05, h, c, null, 0.04);
    txt(s, lab, { x: x - 0.2, y: by - h - 0.36, w: 1.45, h: 0.3, fontSize: 15, bold: true, color: i ? ACC : INK, align: 'center' });
    txt(s, k, { x, y: by + 0.05, w: 1.05, h: 0.28, fontSize: 12, color: MUT, align: 'center' }); });
  s.addShape(pres.shapes.LINE, { x: 0.7, y: by, w: 3.3, h: 0, line: { color: LINE, width: 1 } });
  txt(s, 'Global capacity¹', { x: 0.7, y: 1.4, w: 3.2, h: 0.3, fontSize: 12, bold: true, color: INK });
  const pts = [['History from the first crate', 'Every breaker and drive is tracked from vendor to install before the hall energizes'], ['Same playbook at every site', 'One snapshot format across regions: a technician anywhere works the same way'], ['Works before the network does', 'Offline-first from commissioning, when site Wi-Fi and cell are not there yet'], ['No slack left', 'Global occupancy is near 97%¹: an outage hits customers immediately']];
  pts.forEach(([a, b], i) => {
    const y = 1.42 + i * 0.86;
    dot(s, 4.55, y, 0.38, String(i + 1), ACC);
    txt(s, [{ text: a, options: { bold: true, color: INK, breakLine: true } }, { text: b }], { x: 5.1, y: y - 0.03, w: 4.4, h: 0.8, fontSize: 12.5 });
  });
  note(s, '¹ JLL, 2026 Global Data Center Outlook (Jan 2026): capacity from about 103 GW to 200 GW by 2030; occupancy near 97% (via Data Center Frontier). DCEO: data center engineering operations; DCO: data center operations.');
}

/* 6 Solution (dark) */
{
  const s = base(true); title(s, 'Lumo snaps every record to the physical unit it touched', true);
  const src = ['Alarms', 'Alerts', 'Work orders', 'Labor', 'POs', 'Invoices', 'Asset moves'];
  src.forEach((t, i) => {
    const y = 1.45 + i * 0.47;
    box(s, M, y, 1.7, 0.36, '1B2E3B', null, 0.06);
    txt(s, t, { x: M + 0.12, y: y + 0.07, w: 1.5, h: 0.25, fontSize: 11.5, color: 'D5DFE5' });
    arrow(s, M + 1.75, y + 0.18, 3.25, 3.0, '3E5A6A');
  });
  box(s, 3.3, 2.45, 2.2, 1.1, ACC, null, 0.1);
  txt(s, [{ text: 'Position graph', options: { bold: true, breakLine: true } }, { text: 'site › building › room › unit', options: { fontSize: 11, color: 'D9F2EE' } }], { x: 3.45, y: 2.6, w: 1.95, h: 0.85, fontSize: 15, color: 'FFFFFF', align: 'center' });
  const outs = [['Complete history', 'tap any unit, any month'], ['Traced lineage', 'vendor → rack → repair → stock'], ['Site compression', 'a full site in under 1 MB'], ['Secure offline', 'encrypted, provisioned per site']];
  outs.forEach(([a, b], i) => {
    const y = 1.45 + i * 0.85;
    arrow(s, 5.55, 3.0, 6.25, y + 0.33, '5FD3C2');
    box(s, 6.3, y, 3.2, 0.68, '1B2E3B', null, 0.06);
    txt(s, [{ text: a, options: { bold: true, breakLine: true, color: 'FFFFFF' } }, { text: b, options: { color: 'A9BCC7' } }], { x: 6.45, y: y + 0.08, w: 2.95, h: 0.55, fontSize: 12.5 });
  });
}

/* 6b Unification across operations, purchasing, finance and workforce */
{
  const s = base(); title(s, 'Operations, purchasing, finance and workforce, unified at the unit in one view');
  const doms = [
    ['Operations', 'BMS · paging · CMMS', [['14,474', 'alarms'], ['4,486', 'alerts'], ['8,214', 'work orders']]],
    ['Purchasing', 'ERP · storeroom', [['3,505', 'purchase orders'], ['623', 'asset moves'], ['8', 'vendors']]],
    ['Finance', 'ERP · AP', [['3,740', 'invoices'], ['$21.0M', 'invoiced'], ['28', 'findings flagged']]],
    ['Workforce', 'CMMS labor', [['14,860', 'labor entries'], ['61,033', 'hours'], ['11', 'technicians']]],
  ];
  doms.forEach(([h, sub, rows], i) => {
    const x = M + i * 2.27;
    box(s, x, 1.4, 2.05, 2.55, CARD, LINE, 0.08);
    txt(s, h, { x: x + 0.18, y: 1.52, w: 1.75, h: 0.3, fontSize: 14, bold: true, color: INK });
    txt(s, sub, { x: x + 0.18, y: 1.82, w: 1.75, h: 0.25, fontSize: 10.5, color: MUT });
    rows.forEach(([v, l], k) => txt(s, [{ text: v + ' ', options: { bold: true, color: i === 0 ? INK : INK, fontSize: 15 } }, { text: l, options: { color: TXT } }], { x: x + 0.18, y: 2.2 + k * 0.55, w: 1.8, h: 0.45, fontSize: 11.5 }));
    lineAB(s, x + 1.02, 3.95, 4.95, 4.3, { line: { color: ACC, width: 1.5 } });
  });
  box(s, 2.7, 4.3, 4.5, 0.62, ACC, null, 0.1);
  txt(s, [{ text: '172 positions', options: { bold: true } }, { text: '  every record keyed to one', options: { color: 'D9F2EE' } }], { x: 2.8, y: 4.45, w: 4.3, h: 0.35, fontSize: 13, color: 'FFFFFF', align: 'center' });
  note(s, 'Counts for the MVP\'s synthetic two-site dataset, Jan 2025–Oct 2026. Workforce data covers labor hours by technician, not HR records such as pay.');
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

/* 7b Instant at scale */
{
  const s = base(); title(s, 'Sub-millisecond median drill-downs across 49,000 records. No spinners, no server');
  const stats = [['0.7 ms', 'median drill-down', '1,032 drill-downs: every unit × record type. Slowest 7.2 ms'], ['0.1 ms', 'median month filter', 'on the largest list (359 labor records), 110 filters'], ['0.5 s', 'to open the whole file', 'decompress and index 49K records for both sites']];
  stats.forEach(([big, lab, sub], i) => {
    const x = M + i * 3.05;
    box(s, x, 1.45, 2.8, 2.15, CARD, LINE, 0.08);
    txt(s, big, { x: x + 0.22, y: 1.6, w: 2.4, h: 0.8, fontSize: 40, bold: true, color: i < 2 ? ACC : INK });
    txt(s, lab, { x: x + 0.22, y: 2.42, w: 2.4, h: 0.3, fontSize: 13, bold: true, color: INK });
    txt(s, sub, { x: x + 0.22, y: 2.76, w: 2.4, h: 0.75, fontSize: 11.5, color: MUT });
  });
  // frame budget bar: 16.7 ms with the slowest drill marked
  txt(s, 'One screen refresh at 60 fps = 16.7 ms', { x: M, y: 3.82, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: INK });
  box(s, M, 4.17, 9.0, 0.32, 'E9EDEF', null, 0.04);
  box(s, M, 4.17, 9.0 * 7.2 / 16.7, 0.32, '8FC9C1', null, 0.04);
  box(s, M, 4.17, Math.max(0.05, 9.0 * 0.7 / 16.7), 0.32, ACC, null, 0.02);
  txt(s, 'median 0.7 ms', { x: M + 0.45, y: 4.2, w: 1.5, h: 0.26, fontSize: 10.5, bold: true, color: INK });
  txt(s, 'slowest 7.2 ms', { x: M + 9.0 * 7.2 / 16.7 + 0.1, y: 4.2, w: 1.6, h: 0.26, fontSize: 10.5, color: INK });
  txt(s, 'No server round trip: the data ships indexed by position and every query runs on the device.', { x: M, y: 4.62, w: 9, h: 0.3, fontSize: 12.5, color: TXT });
  note(s, 'Measured Nov 9 2026 in headless Chrome on a 2-core cloud VM, v10.1 build, synthetic dataset. Times are script time to build each view, before paint; phones will vary.');
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

/* 8b Event log: the latest number and every change behind it */
{
  const s = base(); title(s, 'Not just the latest number: every change is logged and traceable to its source');
  // left: one rollup number decomposing into its event chain
  box(s, M, 1.45, 2.3, 1.0, INK, null, 0.1);
  txt(s, [{ text: '$77K', options: { bold: true, fontSize: 24, breakLine: true } }, { text: 'invoiced at SWGR-02', options: { fontSize: 11, color: 'B9C7D0' } }], { x: M + 0.18, y: 1.55, w: 2.0, h: 0.85, color: 'FFFFFF' });
  const chain = [['alarm.raised', 'BMS'], ['alert.sent', 'paging'], ['wo.opened', 'CMMS'], ['activity.logged', 'labor'], ['po.created', 'ERP'], ['invoice.received', 'AP'], ['wo.closed', 'CMMS']];
  chain.forEach(([e, src], i) => {
    const y = 2.62 + i * 0.33;
    s.addShape(pres.shapes.OVAL, { x: M + 0.12, y: y + 0.07, w: 0.16, h: 0.16, fill: { color: ACC }, line: { type: 'none' } });
    if (i) lineAB(s, M + 0.2, y - 0.1, M + 0.2, y + 0.07, { line: { color: ACC, width: 1.25 } });
    txt(s, [{ text: e, options: { bold: true, color: INK } }, { text: '  ' + src, options: { color: MUT } }], { x: M + 0.4, y: y + 0.02, w: 2.6, h: 0.28, fontSize: 11 });
  });
  // right: event counts as bars
  const ev = [['activity.logged', 14860], ['alarm.raised', 14474], ['alarm.cleared', 14471], ['wo.opened', 8211], ['wo.closed', 8184], ['alert.sent', 4486], ['invoice.received', 3740], ['po.created', 3505]];
  txt(s, '71,931 events of 8 types, joined by 26,783 links', { x: 3.75, y: 1.45, w: 5.8, h: 0.3, fontSize: 13, bold: true, color: INK });
  ev.forEach(([k, v], i) => {
    const y = 1.85 + i * 0.35, w = 3.2 * v / 14860;
    txt(s, k, { x: 3.75, y: y + 0.04, w: 1.6, h: 0.26, fontSize: 11, color: TXT });
    box(s, 5.4, y, w, 0.26, i < 3 ? ACC : '8FC9C1', null, 0.03);
    txt(s, v.toLocaleString('en-US'), { x: 5.4 + w + 0.08, y: y + 0.04, w: 0.8, h: 0.26, fontSize: 11, bold: true, color: TXT });
  });
  txt(s, 'Rollups show the latest number; the log keeps who, when and what it cost.', { x: 3.75, y: 4.72, w: 5.8, h: 0.28, fontSize: 11.5, bold: true, color: ACC });
  note(s, 'Synthetic dataset. Links: WO on position 8,214 · alarm generated WO 6,291 · escalated to alert 4,486 · billed 3,732 · procured 3,505 · hierarchy and installs 555. The chain at left is illustrative.');
}

/* 9 Pillar: compression */
{
  const s = base(); title(s, 'Lumo packs 49,000 records into 0.49 MB: under 10 bytes a record, 24x smaller than raw JSON');
  const st = [['Plain JSON', 11.76, '11.8 MB', 'C9D0D5', ''], ['CSV export', 6.34, '6.3 MB', 'B8C2C9', '1.9x'], ['Lumo encoding', 1.54, '1.5 MB', '8FC9C1', '7.6x'], ['+ gzip', 0.49, '0.49 MB', ACC, '24x']];
  const x0 = 1.9, maxW = 2.55;
  st.forEach(([k, v, lab, c, x], i) => {
    const y = 1.5 + i * 0.66, w = Math.max(0.06, maxW * v / 11.76);
    txt(s, k, { x: M, y: y + 0.1, w: 1.5, h: 0.32, fontSize: 12.5, bold: i >= 2, color: INK });
    box(s, x0, y, w, 0.46, c, null, 0.04);
    txt(s, [{ text: lab, options: { bold: true, color: i === 3 ? ACC : TXT } }, { text: x ? '  ' + x : '', options: { color: MUT } }], { x: x0 + w + 0.1, y: y + 0.1, w: 1.5, h: 0.3, fontSize: 12 });
  });
  txt(s, 'How the encoding works', { x: 5.95, y: 1.45, w: 3.5, h: 0.3, fontSize: 13, bold: true, color: INK });
  const tech = [['Keyed by position', 'the unit ID is stored once, not on every row'], ['String dictionary', 'vendors, codes and statuses become small integers'], ['Delta timestamps', 'each row stores minutes since the previous one'], ['Integer IDs', 'WO-3006232 ships as 3006232'], ['gzip level 9', 'then base64, inside the one HTML file']];
  tech.forEach(([a, b], i) => {
    const y = 1.85 + i * 0.5;
    dot(s, 5.95, y, 0.3, String(i + 1), ACC, 'FFFFFF', 10);
    txt(s, [{ text: a + ': ', options: { bold: true, color: INK } }, { text: b }], { x: 6.35, y: y - 0.02, w: 3.2, h: 0.48, fontSize: 11 });
  });
  box(s, M, 4.35, 9.0, 0.6, ACC_T, null, 0.08);
  txt(s, [{ text: 'Whole product, both sites: 0.9 MB. ', options: { bold: true, color: INK } }, { text: 'App, floor plans, records and lineage in one file, 23x smaller than the 21.3 MB of modeled tables behind it, and 2.3x smaller than gzipping the CSV alone.' }], { x: M + 0.18, y: 4.42, w: 8.65, h: 0.5, fontSize: 11.5 });
  note(s, 'Measured Nov 9 2026 on the synthetic dataset: 49,279 source records (alarms, alerts, WOs, labor, POs, invoices). Encoded payload 1.54 MB, gzip 0.49 MB; CSV gzip 1.10 MB.');
}

/* 10 Pillar: security */
{
  const s = base(); title(s, 'Encrypted, site-provisioned snapshots: a lost tablet leaks nothing but ciphertext');
  const steps = [['Provision', 'Filter to one site: its units, records, assets and storeroom'], ['Encrypt', 'AES-256-GCM, key from passphrase via PBKDF2-SHA256, 310,000 rounds'], ['Bind', 'Site, version and as-of date are locked to the ciphertext; any tampering fails to unlock'], ['Work offline', 'Decrypted in memory only. Field notes queue encrypted, forward when back online']];
  steps.forEach(([a, b], i) => {
    const x = M + (i % 2) * 2.95, y = 1.4 + Math.floor(i / 2) * 1.6;
    box(s, x, y, 2.75, 1.42, CARD, LINE, 0.08);
    dot(s, x + 0.16, y + 0.15, 0.38, String(i + 1), ACC);
    txt(s, a, { x: x + 0.65, y: y + 0.19, w: 2.0, h: 0.3, fontSize: 14, bold: true, color: INK });
    txt(s, b, { x: x + 0.16, y: y + 0.62, w: 2.45, h: 0.75, fontSize: 11.5 });
  });
  const w = 3.0, h = w * 646 / 560;
  phone(s, 'e_lock.jpg', 6.6, 1.45, h, 560 / 646);
  box(s, M, 4.62, 5.7, 0.42, AMB_T, null, 0.06);
  txt(s, [{ text: 'Today: ', options: { bold: true, color: INK } }, { text: 'one passphrase per snapshot. Next: per-user keys, revoke.' }], { x: M + 0.15, y: 4.69, w: 5.45, h: 0.3, fontSize: 11.5 });
  note(s, 'Unlock screen of the E1 snapshot: 0.55 MB, 86 units, 111 assets.');
}

/* 10b RFID position tags (planned) */
{
  const s = base(); title(s, 'Next: tap a tag on the unit and its full history opens, with zero bars of signal');
  const steps = [['Tag the unit', 'An RFID/NFC tag holds only the position ID, so a read reveals nothing else'], ['Tap to identify', 'Phone or tablet reads it by NFC; no network needed'], ['Open offline', 'The unit opens from the encrypted snapshot already on the device'], ['Record in place', 'Notes and readings queue encrypted, forward once back in coverage']];
  steps.forEach(([a, b], i) => {
    const x = M + (i % 2) * 2.95, y = 1.4 + Math.floor(i / 2) * 1.6;
    box(s, x, y, 2.75, 1.42, CARD, LINE, 0.08);
    dot(s, x + 0.16, y + 0.15, 0.38, String(i + 1), i === 1 ? AMB : ACC);
    txt(s, a, { x: x + 0.65, y: y + 0.19, w: 2.0, h: 0.3, fontSize: 14, bold: true, color: INK });
    txt(s, b, { x: x + 0.16, y: y + 0.62, w: 2.45, h: 0.75, fontSize: 11.5 });
  });
  phone(s, 'f_comps.jpg', 7.35, 1.35, 3.75);
  txt(s, 'What opens on tap', { x: 7.2, y: 5.15, w: 2.2, h: 0.25, fontSize: 10, color: MUT, align: 'center' });
  note(s, 'Planned, not yet built: today units open by tap and search. Tag pilot Q2 2027.');
}

/* 11 Buyers */
{
  const s = base(); title(s, 'Two buyers with urgent pain: hyperscalers who own the fleet, and the IFM giants who run it');
  const cols = [
    ['Hyperscale operators', 'Own the sites and the risk of downtime', ['Root cause in minutes: every alarm, work order and part at the unit', 'Component lineage for audits and warranty claims', 'Offline, provisioned access for restricted halls']],
    ['IFM providers (e.g. ABM)', 'Run maintenance across many clients\' sites', ['One view across each client\'s different CMMS and ERP', 'A portable, verifiable site history at contract handover', 'Proof of work: labor and spend tied to each unit']],
  ];
  cols.forEach(([h, sub, pts], i) => {
    const x = M + i * 4.6;
    box(s, x, 1.45, 4.4, 2.75, CARD, LINE, 0.08);
    txt(s, h, { x: x + 0.25, y: 1.6, w: 3.9, h: 0.35, fontSize: 16, bold: true, color: INK });
    txt(s, sub, { x: x + 0.25, y: 1.97, w: 3.9, h: 0.3, fontSize: 12, color: MUT });
    txt(s, pts.map((p, k) => ({ text: p, options: { bullet: true, breakLine: k < pts.length - 1 } })), { x: x + 0.25, y: 2.4, w: 3.95, h: 1.75, fontSize: 12.5, paraSpaceAfter: 6 });
  });
  box(s, M + 4.6, 4.35, 4.4, 0.6, ACC_T, null, 0.08);
  txt(s, 'ABM: $8.7B FY2025 revenue; bought Quality Uptime (data center electrical and UPS services) in 2024¹', { x: M + 4.78, y: 4.42, w: 4.1, h: 0.5, fontSize: 11, color: INK });
  note(s, '¹ ABM Industries Form 10-K, fiscal year ended Oct 31 2025 ($8,745.9M revenue); Zacks research note, Jan 2026.');
}

/* 12 Market */
{
  const s = base(); title(s, 'Data center operations spend is on track to nearly 4x, to $33.3B by 2036');
  const bars = [['2025', 8.55, '$8.6B', 'B8C2C9'], ['2036', 33.33, '$33.3B', ACC]];
  const base_y = 4.55, maxH = 2.85;
  bars.forEach(([k, v, lab, c], i) => {
    const x = 1.0 + i * 1.7, h = maxH * v / 33.33;
    box(s, x, base_y - h, 1.1, h, c, null, 0.04);
    txt(s, lab, { x: x - 0.2, y: base_y - h - 0.38, w: 1.5, h: 0.3, fontSize: 15, bold: true, color: i ? ACC : INK, align: 'center' });
    txt(s, k, { x, y: base_y + 0.06, w: 1.1, h: 0.3, fontSize: 12, color: MUT, align: 'center' });
  });
  s.addShape(pres.shapes.LINE, { x: 0.8, y: base_y, w: 3.6, h: 0, line: { color: LINE, width: 1 } });
  txt(s, 'Where the layer sells', { x: 5.2, y: 1.5, w: 4.2, h: 0.35, fontSize: 14, bold: true, color: INK });
  txt(s, [
    { text: 'Third-party operations and maintenance of data center infrastructure: the work IFM providers and OEM service teams bill for.¹', options: { bullet: true, breakLine: true } },
    { text: 'Data center maintenance and support services, a narrower cut, was $7.4B in 2025 and is forecast to reach $15.8B by 2033.²', options: { bullet: true, breakLine: true } },
    { text: 'Lumo is software priced per site, so it captures a slice of this spend; pilots will set the price.', options: { bullet: true } },
  ], { x: 5.2, y: 1.95, w: 4.3, h: 2.7, fontSize: 12.5, paraSpaceAfter: 8 });
  note(s, '¹ Meticulous Research, Data Center Facility Management & O&M Services Market 2026–2036. ² Grand View Research, Data Center Maintenance and Support Services Market 2026–2033.');
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
  txt(s, 'Prices are not set yet. The first pilots are designed to measure hours saved per work order and parts reused from stock, which will anchor pricing.', { x: M + 0.18, y: 4.33, w: 8.55, h: 0.5, fontSize: 12 });
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

/* 15 Roadmap */
{
  const s = base(); title(s, 'Working product today. Live sites in 12 months');
  const ms = [['Now', 'v10 MVP', '2 sites, 172 positions; history, lineage, compression and encrypted offline snapshots working'], ['Q1 2027', 'Connectors', 'Import CMMS, BMS and ERP exports; map them to positions at one pilot site'], ['Q2 2027', 'Security + tags', 'Per-user provisioning, key rotation, review; RFID/NFC position-tag pilot'], ['Q3 2027', 'Detection', 'Run anomaly rules on live data (the demo flags 28 findings)'], ['Q4 2027', 'Partners', 'First IFM partner rollout across several client sites']];
  const y = 2.25;
  s.addShape(pres.shapes.LINE, { x: M + 0.2, y: y + 0.2, w: 8.6, h: 0, line: { color: LINE, width: 2 } });
  ms.forEach(([w, h, b], i) => {
    const x = M + i * 1.83;
    dot(s, x + 0.0, y, 0.4, String(i + 1), i === 0 ? ACC : '7E8B94');
    txt(s, w, { x, y: 1.6, w: 1.7, h: 0.3, fontSize: 12, bold: true, color: i === 0 ? ACC : MUT });
    txt(s, h, { x, y: y + 0.6, w: 1.7, h: 0.35, fontSize: 14, bold: true, color: INK });
    txt(s, b, { x, y: y + 1.0, w: 1.68, h: 1.6, fontSize: 11.5 });
  });
  note(s, 'Quarters from Q1 2027 are the plan, not commitments.');
}

/* 16 Founder */
{
  const s = base(); title(s, 'Built by an operator: 20+ years running maintenance for critical facilities');
  box(s, M, 1.45, 4.3, 3.4, CARD, LINE, 0.08);
  dot(s, M + 0.3, 1.7, 0.9, 'QL', INK, 'FFFFFF', 20);
  txt(s, [{ text: 'Quinn Lawery', options: { bold: true, breakLine: true, fontSize: 18, color: INK } }, { text: 'Founder', options: { color: MUT } }], { x: M + 1.4, y: 1.8, w: 2.7, h: 0.75, fontSize: 13 });
  txt(s, [
    { text: 'CMMS/EAM platforms: IBM Maximo/MAS, Hexagon EAM', options: { bullet: true, breakLine: true } },
    { text: 'Semiconductor fab operations and critical utilities', options: { bullet: true, breakLine: true } },
    { text: 'IFM leadership', options: { bullet: true, breakLine: true } },
    { text: 'Built the v10 MVP end to end', options: { bullet: true } },
  ], { x: M + 0.3, y: 2.85, w: 3.85, h: 1.9, fontSize: 12.5, paraSpaceAfter: 6 });
  txt(s, 'First hires', { x: 5.3, y: 1.5, w: 4, h: 0.35, fontSize: 14, bold: true, color: INK });
  const hires = [['Founding engineer', 'data pipelines and connectors'], ['Security engineer (contract)', 'provisioning, key management, review'], ['Pilot lead', 'a site operations veteran to run pilots']];
  hires.forEach(([a, b], i) => {
    const y = 2.0 + i * 0.85;
    dot(s, 5.3, y, 0.38, String(i + 1), ACC);
    txt(s, [{ text: a, options: { bold: true, breakLine: true, color: INK } }, { text: b, options: { color: MUT } }], { x: 5.85, y: y - 0.04, w: 3.6, h: 0.65, fontSize: 12.5 });
  });
}

/* 17 Ask (dark) */
{
  const s = base(true); title(s, 'Back Lumo at SkyDeck: $200K takes it from demo to paid pilots', true);
  txt(s, '$200K', { x: M, y: 1.5, w: 3.5, h: 1.0, fontSize: 54, bold: true, color: '5FD3C2' });
  txt(s, 'Berkeley SkyDeck Fund investment for Cohort teams¹', { x: M, y: 2.55, w: 3.4, h: 0.6, fontSize: 13, color: 'D5DFE5' });
  txt(s, 'Proposed use', { x: 4.5, y: 1.55, w: 5, h: 0.35, fontSize: 14, bold: true, color: 'FFFFFF' });
  const use = [['50%', 'Connectors and two paid pilot sites'], ['30%', 'Security: per-user provisioning and independent review'], ['20%', 'Founding engineer, part year']];
  use.forEach(([p, l], i) => {
    const y = 2.0 + i * 0.62;
    box(s, 4.5, y, 0.8, 0.45, '1B2E3B', null, 0.06);
    txt(s, p, { x: 4.5, y: y + 0.09, w: 0.8, h: 0.3, fontSize: 13, bold: true, color: '5FD3C2', align: 'center' });
    txt(s, l, { x: 5.45, y: y + 0.09, w: 4.0, h: 0.35, fontSize: 13, color: 'D5DFE5' });
  });
  txt(s, 'From SkyDeck\'s network: introductions to hyperscale operators and IFM providers for the first two pilots.', { x: 4.5, y: 4.0, w: 5.0, h: 0.6, fontSize: 13, color: 'FFFFFF' });
  note(s, '¹ skydeck.berkeley.edu/program: about 20 Cohort startups each six months receive $200K. Batch 22 added $810K in startup perks (SkyDeck newsletter, Jan 2026).', true);
}

/* 18 Sources */
{
  const s = base(); title(s, 'Appendix: sources');
  txt(s, [
    { text: 'Uptime Institute, Annual Outage Analysis 2026, press release, May 13 2026 (businesswire.com)', options: { bullet: true, breakLine: true } },
    { text: 'Data Center Knowledge, "Data Center Outages Decline for Fourth Straight Year" (Uptime 2025 report)', options: { bullet: true, breakLine: true } },
    { text: 'datacentres.com, Hyperscaler Capex Guidance Passes $700B for 2026, figures checked Oct 11 2026', options: { bullet: true, breakLine: true } },
    { text: 'ABM Industries, Form 10-K for fiscal year ended Oct 31 2025 (sec.gov)', options: { bullet: true, breakLine: true } },
    { text: 'Zacks Equity Research, ABM report, Jan 8 2026 (Quality Uptime acquisition)', options: { bullet: true, breakLine: true } },
    { text: 'Meticulous Research, Data Center Facility Management & O&M Services Market 2026–2036', options: { bullet: true, breakLine: true } },
    { text: 'Grand View Research, Data Center Maintenance and Support Services Market 2026–2033', options: { bullet: true, breakLine: true } },
    { text: 'Berkeley SkyDeck program page and newsletter, Jan 14 2026 (skydeck.berkeley.edu)', options: { bullet: true, breakLine: true } },
    { text: 'JLL, 2026 Global Data Center Outlook, Jan 2026; Data Center Frontier summary, Jan 8 2026', options: { bullet: true, breakLine: true } },
    { text: 'Product figures: nimbus-floor-plan v10.1 build, size and response times measured Nov 9 2026 on the synthetic dataset', options: { bullet: true } },
  ], { x: M, y: 1.3, w: 9, h: 3.7, fontSize: 12, paraSpaceAfter: 6 });
}

pres.writeFile({ fileName: __dirname + '/Lumo_SkyDeck_Pitch.pptx', compression: true }).then(f => console.log('wrote', f));
