# Changelog

Each version is one commit on `main`; the commit for each is listed below (`git checkout <commit>` to see that version). The page is published to the private artifact link after each release.

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
