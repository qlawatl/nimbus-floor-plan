# Changelog

Each version is one commit on `main`; the commit for each is listed below (`git checkout <commit>` to see that version). The page is published to the private artifact link after each release.

## v7.2 — 2026-11-08 · branch `release/v7.2`
- **Breadcrumbs** at the top left while you're drilling: building › unit or room › metric › … › details › Lifecycle. Every hop before the current one is a link: tap it to jump straight back to that level (it closes anything opened above it). The bar is above the windows, so it works from a lifecycle too. The Back circle moved below it.
- **Removed the blue instruction text** at the bottom of the detail, records, lifecycle and lineage windows, and the hint line over the bubbles.
- **Live lineage bar chart** at the top of the lineage window, which stays in place as you scroll. One bar shows where the asset sat over time (position = blue, storeroom bin = light blue, quarantine = red, repair depot = amber, warehouse or vendor = gray), with numbered dots at each move. The last 6 months get 65% of the width, and there's a "6 MO AGO" marker and a pulsing NOW. The segments grow in when the window opens.
  - Tap a **dot or segment** to jump to its row (highlighted in the list and on the map).
  - Tap a **row** to bring it to the top of the list, just under the chart, with its dot highlighted.
  - The **↑ Top** button appears once you scroll down and takes you back to the top.

## v7.1 — 2026-11-08 · branch `release/v7.1`
- **Fix:** double-tapping to close a record's lifecycle a second time could send you to the main page instead. Tapping a record and then double-tapping to close was being counted as a triple-tap. A triple-tap now requires three quick taps (each under 300 ms apart) in one spot, and any tap that opens something (lifecycle, details, records, lineage, a drill-down) starts a new count.

## v7 — 2026-11-08 · branch `release/v7`
- **Site map.** Tap "‹ Zoom out: site map" above the drawing to see both buildings on the campus (live miniatures with the same coloring), the site storeroom with its bin grid and quarantine area, the receiving dock, and the offsite band: vendor, central warehouse, repair depot and the other site's storeroom. Tap a building to zoom back into it.
- **Lineage button on every asset** (in the hold-for-details window, in the panel's Overview, and on storeroom rows). It zooms out to the site map and draws the asset's path in numbered steps: vendor → central warehouse → storeroom bin → installed position → quarantine → repair depot → back to the storeroom → reinstalled. Steps from the last 6 months are solid blue and older steps are dashed. "NOW" pulses on the current location and "6 MO AGO" marks where the asset was on 2026-04-30. The lineage window has Now, 6 months ago, moves in the last 6 months, and the full history; tap a step to find it on the map, double-tap to close.
- **Storeroom stock.** Tap the storeroom on the site map to see the units on hand (new stock, refurbished spares, quarantine), each with a Lineage button.
- **Data:** the generator adds `asset_moves` and `storerooms`, using a separate random seed so every existing record and finding stays the same. Removed units go to quarantine, then the repair depot, then come back to the storeroom as refurbished spares, and later swaps reuse them. Stories to try:
  - `TAG-CRAH-100040`: CRAH-12 → depot → storeroom bin B-03-3 (where it was 6 months ago) → installed at E1-B1 CRAH-07 on 2026-06-03.
  - `TAG-CRAH-100033`: CRAH-07 → depot → storeroom → E1-B1 CRAH-08 on 2026-08-17.
  - A W1 UPS spare transferred to the E1 storeroom on 2026-07-14.

## v6.4 — 2026-11-08 · branch `release/v6.4`
**The page is 3.2 MB → 0.8 MB, about 4× smaller.**
- Data ships gzip-compressed and base64-encoded inside the page. The browser unpacks it on load with `DecompressionStream` (iOS 16.4+ / any current browser). The page is still one file and still works offline.
- Pre-built lifecycles are no longer shipped (−870 KB). The page assembles any lifecycle on demand from the record lists, so **every record now has a lifecycle**, not just the most recent 10 alarms and 6 WOs per unit.
- Per-unit activity lists are no longer shipped (−280 KB). They're derived from the same records.
- Records are compactly encoded: timestamps are stored as minutes back from the previous row, close/due/cleared times relative to the row, IDs as numbers (the prefix is restored on load), and repeated text through a shared string table.
- Records gained link fields (alarm ID and cleared time, WO closed/due, PO → WO) so lifecycles can be rebuilt.

## v6.3 — 2026-11-08 · branch `release/v6.3`
- **Every record is available.** The export now ships all records per unit (about 49k rows, compactly encoded), not just the latest few, so a bubble showing 22 now opens a list of 22.
- **Loads in blocks of 25.** Lists show the first 25, newest first. The button at the end, "Load 25 more · 25 of 86 shown", adds the next 25 each time you tap it, until it reads "All 86 shown". Works in both the details window and the records window.
- **Line weight follows record count**, not dollars or hours: alarms, alerts, WOs, POs, invoices, labor entries and findings, each scaled to the largest on that screen.
- The details window is taller (72% of the screen) and scrolls.

## v6.2 — 2026-11-08 · branch `release/v6.2`
- Removed the stray dotted line that ran from the parent bubble (or your finger) to the center.
- **Line thickness shows weight:** each line from the center is 1.5–11.5 px, scaled to its bubble's share of the largest on that screen.
- **Triple-tap anywhere** to go back to the main page. It closes the bubbles, windows and panel, and scrolls to the top. The third tap doesn't trigger anything else.
- **Scrolling works in the detail windows** (details, records, lifecycle, equipment panel). The cause was flex layout without `min-height: 0`, which stopped the inner list from scrolling.

## v6.1 — 2026-11-08 · branch `release/v6.1`
- The lifecycle and records windows close with a **double-tap**. Their × buttons are removed, and a "Double-tap to close" footer shows on each. Tapping a record still opens its lifecycle; ‹ Back links stay.

## v6 — 2026-11-08 · branch `release/v6`
**New tap model, used everywhere from the first tap on the drawing:**

| Gesture | Drawing | Burst | Details window / lifecycle |
|---|---|---|---|
| **Tap** | Unit or room → its burst | Drill in: metric → breakdown; connected unit → its burst; unit in a room → its burst; last-level item → details | Record → its lifecycle |
| **Double-tap** | — | Back one level (closes the burst at the top) | Close and return to the bubbles |
| **Hold** (ring counts down, ~0.5 s) | Unit → full detail panel | Details window: records for a bubble, or a unit/room summary for the center or a unit bubble | — |

- The burst stays on screen; nothing depends on keeping your finger down. Navigation is a stack, so you can go room → alarms → unit → work orders and double-tap back out one step at a time.
- The unit summary window shows key numbers, findings, the latest activity, and "Open full details".
- Esc steps back on desktop.

## v5.3 — 2026-11-08 · branch `release/v5.3`
- **The records list stays open after you lift your finger.** It becomes scrollable, and tapping a record opens its lifecycle (‹ Back returns you to the list).
- **Press and hold anywhere on the list to close it.** A countdown ring fills under your finger (0.65 s); when it completes, the list closes and you're back on the same bubbles. Lifting early or scrolling cancels.

## v5.2 — 2026-11-08 · branch `release/v5.2`
- **Peek records on the last level.** In a drill-down, hold a bubble (the ring fills in under half a second) and that item's latest records pop up in a list. Lift your finger to close it and return to the same bubbles, which stay on screen so you can peek another one. A quick release still opens the full records window.
- Alarm severity tags in record lists show the real severity: critical, major or minor.

## v5.1 — 2026-11-08 · commit `31895fe`
- **Back navigation, one level at a time.**
  - In a drill-down, hold on the ‹ Back circle to return to level 1 with your finger still down.
  - Release on ‹ Back to go up a level and leave the burst on screen in tap mode.
  - In the records window, **‹ Back to burst** reopens the burst on the level you came from.
  - In a lifecycle, **‹ Back** closes just the lifecycle and returns you to the records or the details panel.

## v5 — 2026-11-08 · commit `5746da2`
- **Lifecycle view.** Tap any alarm, WO, PO or invoice to see alarm → alert → cleared → WO → labor → PO → invoice → close on one timeline.
  - Headline numbers show each lag compared with that unit's average (red when more than 1.5× slower, green when well under).
  - The timeline strip uses a log scale so minutes and weeks both fit.
  - Missing or late steps are flagged: no WO, alert not acknowledged, WO closed past due, WO still open.
- The Flow tab has a "Recent lifecycles" list with a step-dot strip on each row.
- Export adds `chains` per position: the last 10 alarm chains and 6 other WO chains.

## v4 — 2026-11-08 · commit `ccf4cd5`
- **Room bursts.** Hold a room (yard, electrical, mechanical, data hall) to see rollups of all units inside. Drill in to rank units by any metric.
- **Search** across units, alarm codes, vendors, technicians and findings. Results open details or a filtered records window.
- **Building tiles** replace the plain building buttons. Each tile shows a 22-month alarm sparkline, spend and a finding badge, and follows the month slider.

## v3 — 2026-11-08 · commit `51d8ad0`
- **Drill-down.** Hold on a data circle in the burst to break it out by alarm code, team/channel, WO type/priority, vendor or technician.
- **Records window** with breakdown bars (tap a bar to filter) and the latest records.
- Export adds `bd` (breakdowns) and `rec` (recent records) per position.

## v2.1 — 2026-11-08
- The burst is full-screen. Circle size follows the count, with a base size readable on first press. Connected units sit in rows above and below.

## v2 — 2026-11-08
- **Month slider and ▶ play.** The coloring, KPIs and burst values follow the selected month.
- **Slide to open.** Hold, slide onto a circle and release to jump to that tab or connected unit.

## v1 — 2026-11-07
- 2D floor plan for each building, colored by findings, alarms, spend or open WOs, with optional power and cooling path overlays.
- Detail panel with Overview, Flow, Connections and Activity tabs. Press and hold a unit to burst its data into circles.
- Synthetic dataset (Parquet + DuckDB) with 11 planted patterns, plus detection rules that find them.
