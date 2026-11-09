# Changelog

Each version is one commit on `main`; the commit for each is listed below (`git checkout <commit>` to see that version). The page is published to the private artifact link after each release.

## v10.5 — 2026-11-09 · branch `release/v10.5`
- **Asset number and description on every detail record.** Work order, PO, invoice, alarm, alert and labor rows now show the asset under the record text, e.g. *A100022 · Carrier 19DV · Chiller*.
  - The asset is the one **installed at that position on the record's date**, taken from the position history. After a swap, older records show the asset that was there at the time, with an *earlier asset* tag. For example, E1-B1-CRAH-07 shows the Stulz A100033 before 2026-06-03 and the Vertiv A100040 after.
  - **Table view** gains a sortable **Asset** column (number and description), and the row filter matches asset number, tag, make and model.

## v10.4 — 2026-11-09 · branch `release/v10.4`
- **New cover page: every facility on one sheet.** The app now opens on a block plan of the whole portfolio. Each site is a block holding its **operating buildings** and its **support** facilities (storeroom, site map), with the shared **central warehouse** below:
  - Each building block shows its critical/warning badge, a 2×2 grid of its rooms (yard, electrical, mechanical, data hall) shaded by their worst finding, spend, unit count and open work orders. The building you last opened is outlined and marked *Last viewed*.
  - **Tap a building** to open its floor plan, **tap a site header or Site map ›** for that site's map, and **tap a storeroom or the warehouse** for what's on hand.
- **Brand header:** Lumo mark and wordmark with a *Location Intelligence* tagline, plus a version chip. The long gesture help moved behind the **?** button.
- **Site summary** at the top of the cover, written from the snapshot on the device (no network): how many facilities and sites are shown and of what kind, tracked units and spare assets, finding counts, and which building needs attention first, with a link straight to it.
- **"You are here" breadcrumb** above the drawing on every view (*All sites › West 1 › Building B2*); tap any level to jump to it. The drawing's back button now goes up one level (building → site map → all sites), and a triple-tap returns to the cover.
- On the cover, the KPIs cover the whole portfolio, and the building tiles, color/link controls, month bar and building findings are hidden until you drill in. Links like `#W1-B2` (building) and `#W1` (site map) still open straight to that view.

## v10.3 — 2026-11-09 · branch `release/v10.3`
- **Time drill on the record timeline: all months → month → week → day.** In the details and records windows, tapping a bar now drills in rather than only filtering:
  - **Month** (`YYYY-MM`): the chart re-bins into that month's weeks.
  - **Week** (`YYYY-MM-Wn`, week of month: W1 = days 1–7, W2 = 8–14 … W5 = 29–31): the chart shows that week's days, labeled *Tue 22*.
  - **Day** (`YYYY-MM-DD`): the list narrows to that date, and the day bars stay so you can pick a neighboring day.
  - **Breadcrumb chips** above the list (*All › 2026 › Sep 2026 › W4 · Sep 22–28 › Tue 22 Sep*) jump straight back to any level; **2026** shows that year's months.
  - **Sliding** across the bars still flips through them at the current level (months, weeks or days) without changing level.
- The readout shows the full label for the bar under your finger (*W4 · Sep 22–28 · 6 records · tap to drill in*).
- The table view keeps its month filter.

## v10.2 — 2026-11-09 · branch `release/v10.2`
- **Priority icons in the header of every record row**, in the details and records windows and as a Priority column in the table view. Each level has its own shape and color, so it reads at a glance even without color:
  - **Work orders, priority 1–5:** ① red octagon *Emergency* · ② orange triangle *Urgent* · ③ amber diamond *High* · ④ blue circle *Routine* · ⑤ gray square *Planned*, shown with the type (CM or PM).
  - **Purchase orders:** red bolt **Rush** or gray clock **Normal**, then the parts flags: purple hourglass **Long lead** (with weeks), green $ **High cost** ($15K+), or gray **Std** (with days).
  - **Invoices** show their PO's flags (or a red **No PO** tag), and **labor** rows show their work order's priority.
- **Data:** work order priority now runs 1–5. Monthly PMs are P4 (Routine), and quarterly and semi-annual PMs are P5 (Planned); corrective work keeps P1–P4. POs gain `rush`, `lead_days` and `high_cost`. Rush follows the work order's urgency (803 of 3,505 POs), 566 are long lead (30+ days) and 255 are high cost. These come from their own random stream, so every other record and finding is unchanged (checked by decoding and comparing all record lists).
- The timeline readout now says "tap or slide".

## v10.1 — 2026-11-09 · branch `release/v10.1`
- **Slide across the month bars to scrub through the records like a carousel.** In the details window and the records window, drag a finger (or the mouse) across the timeline and the list switches to each month as you pass over it. The new month slides in from the direction you're moving, with a light tick on phones. Lifting your finger keeps the last month. A plain tap still filters or clears one month. Empty months are skipped. The details window keeps its height while you scrub, so the bars stay under your finger.

## v10 — 2026-11-09 · branch `release/v10` · component lineage and journey map
- **Tapping a month bar filters the list to that month.** This works in the details window and the records window. A chip ("Sep 2026 ×") and a "5 of 81 records" count appear, and the bar stays highlighted. Tap the chip or the same bar again to clear it. Paging (25 + Load more) runs over the filtered rows. Choosing a breakdown row resets the month. Before this, tapping a month only jumped to it.
- **Components in a position.** Breaker elements (Eaton VCP-W, `BRKR`) and VFD drives (ABB ACS880, `VFD`) are tracked as their own assets. The unit details window and the panel overview list them: the current one shows as *In service*, and earlier ones as *Removed* with where they are now. A **REPAIRED** tag marks any that have been through a vendor repair. Each has a **Lineage ›** button.
- **Journey map** (the new default in the lineage window) is a second plan showing mock Northern Virginia locations, each labeled "(mock)": the vendor's distribution center (Sterling), the Nimbus central warehouse (Manassas), the vendor service center (Chantilly), and the E1 site (Ashburn). It also has an **E1 site mini-plan** with the storeroom bins, the quarantine cage, the receiving dock and both buildings, with the asset's position(s) marked. Stops are numbered with arrows between them, ◆ marks where the trip starts, and NOW pulses at the current location. **Journey map / Site map** switches between this and the existing site map.
- **Two route modes:** **From vendor** shows the whole trip (vendor → warehouse → storeroom → in service → quarantine → vendor repair → back into stock). **Repair loop** shows only the storeroom issue → in service → quarantine → repair depot → back into stock. Steps outside the loop are dimmed on the map and in the list. Repair loop is disabled for assets that have never been repaired.
- **▶ Replay route** animates a dot along each leg in order and highlights each step's row as the dot arrives. Tap **■ Stop** to end it early. With reduced motion turned on, it steps through without the animation. The map and mode controls now stay pinned with the time chart at the top of the lineage window.
- **Fix: Load more could open a record.** On phones, the browser's own tap that follows "Load 25 more" could land on the newly loaded row, because the button had moved, and open its lifecycle. That follow-up tap is now ignored wherever it lands.
- Stories to try: **SWGR-02 · E1-B1** → Components → `TAG-BRKR-100187` (removed 2026-05-12, Eaton Service Center, back in bin B-04-3) → Repair loop → ▶ Replay. **PUMP-03 · E1-B2** → `TAG-VFD-100196` (ABB Drive Service, 2026-08).

## v9.1 — 2026-11-09 · branch `release/v9.1`
- **Fix: tapping a unit opened the keyboard** (encrypted E1 build). Hidden windows were still drawn, just transparent: their `display: flex` overrode the `hidden` attribute, so they sat invisibly over the bottom of the screen. A tap on a unit there landed on the hidden field-note text box. Now anything `hidden` is fully removed (`[hidden] { display: none !important }`). This also stops hidden records, lifecycle and lineage windows from silently swallowing taps.

## v9 — 2026-11-08 · branch `release/v9-site-e1` · store-and-forward demo
- **`build_site.py SITE "passphrase"`** builds an **encrypted single-site offline snapshot**. It filters the data to one site (E1: 86 positions, 95 assets with E1 history, E1 storeroom + central warehouse), gzips it, and encrypts it with **AES-256-GCM** using a key derived from the passphrase with **PBKDF2-SHA256 (310,000 rounds)**. The unencrypted manifest (site, version, as-of, build date) is bound to the ciphertext as associated data, so a changed manifest or ciphertext fails to unlock. The page is about 530 KB.
- **Unlock screen:** passphrase → decrypted in memory only (never written to disk). "Wrong passphrase, or the snapshot has been altered" on failure. **🔒 Lock** wipes it by reloading.
- **Snapshot bar:** online/offline dot · site · *as of* date · version · "encrypted" · Outbox · Lock.
- **Field notes outbox (store and forward):** "✎ Add field note" on any unit (in the panel or the unit details window). Notes are encrypted with the snapshot key and stored on the device (localStorage, ciphertext only), and forwarded automatically when the device comes online. **Demo:** no server is attached, so forwarding is simulated and returns a receipt ID; in production this POSTs to the sync API.
- The building list now comes from the data, so single-site builds show only their own buildings.

## v8.4 — 2026-11-08 · branch `release/v8.4`
- **Fix: "Load 25 more" on phones.** Buttons and rows inside the scrolling details, records, table and panel windows now act when your finger lifts, instead of waiting for the browser's click event, which iOS can drop inside a scrolling panel. The native click that follows is ignored, so nothing fires twice. After loading, the list scrolls to the first new row, flashes it, and a toast shows "Loaded 25 more · 50 of 86".
- **Fix: timeline readout on phones.** It reset the moment your finger lifted, so it only flashed. On touch it now stays on the last month you touched or slid to; it still resets when a mouse leaves.

## v8.3 — 2026-11-08 · branch `release/v8.3`
- **Timeline bars show their data.** Hover with a mouse, or touch and slide a finger across the bars on a phone, and the line above the chart shows that month: count, plus critical (alarms), open (work orders), $ (POs and invoices) or hours (labor). The bar under your finger lights up. Tap still jumps to that month's rows (or filters, in the table). With no bar selected, the line shows the peak month.

## v8.2 — 2026-11-08 · branch `release/v8.2`
- **Fix: Back is reliable on every tap.** The ‹ Back circle was waiting 0.28 s to see if a tap was the first half of a double-tap, so tapping it twice quickly counted as one double-tap (one step back), and three quick taps counted as a triple-tap (main page). Now every tap on Back acts immediately and goes back exactly one step: details list → bubbles → previous level → … Taps on Back, the breadcrumbs and the Back buttons no longer count toward double- or triple-taps.
- The ‹ Back circle now also appears on the first level of bubbles, so you can step all the way out with Back alone.

## v8.1 — 2026-11-08 · branch `release/v8.1`
- **Timeline at the top of every records list:** the details list, the records window and the table grid. It's a monthly bar chart (Jan 2025 – Oct 2026) of exactly the records in that list, with the peak month labeled. In the details and records lists it stays put while you scroll.
  - **Tap a month** in a list to jump to its first record there. It loads more pages automatically if needed and highlights the row.
  - **Tap a month** in the table to filter the grid to that month (a chip appears; × clears it). Tap again to clear.

## v8 — 2026-11-08 · branch `release/v8`
- **Table view.** The **▦ Table** button at the end of the breadcrumbs shows your current drill position as a grid, and **◎ Bubbles** switches back. Both follow the same navigation and breadcrumbs, so switching never loses your place.
  - **Unit or room level:** one row per record type (alarms, alerts, WOs, POs, invoices, labor, findings) with counts and a summary, plus the connected units (↑ feeds / ↓ fed by) or the units in the room. Tap a row to drill in.
  - **Metric level:** the drill-down groups (alarm code, vendor, technician… or units for a room) with records and value; tap a group to filter by it (a chip shows the filter, × clears it), or › to open that unit. Below that is the record grid with sortable columns (tap a header; tap again to reverse), a text filter, a row count, and loading in blocks of 25. Tap a row to follow its lifecycle.
  - If a details list is open when you switch, the table opens already filtered to that group.

## v7.3 — 2026-11-08 · branch `release/v7.3`
- **Fix:** while a details list was open, tapping the ‹ Back circle (or anywhere outside the list) did nothing. Now it closes the list and returns to the bubbles. Double-tap and the breadcrumbs still work as before.

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
