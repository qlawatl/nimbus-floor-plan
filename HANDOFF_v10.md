# v10 handoff (work in progress on release/v10)

## Done (committed)
- generate.py: component assets with repair loops (rng2 stream, main data unchanged: 14474 alarms, 8214 WOs)
  - Eaton VCP-W breaker TAG-BRKR-100187: VENDOR:Eaton -> WH-CENTRAL -> E1-SR:C-06-1 -> installed E1-B1-SWGR-02 (2023-02-23)
    -> removed to E1-SR:QUARANTINE (2026-05-12) -> DEPOT:Eaton Service Center (05-15) -> returned E1-SR:B-04-3 (06-14); spare installed in its place
  - ABB ACS880 VFD at E1-B2-PUMP-03, same pattern (2026-08-04, ABB Drive Service)
- export_plan_data.py: positions[pid].comp = [asset ids] for BRKR/VFD (block sits just before `data = dict(`)
- data/plan_data.json regenerated

## To do (src/plan_template.html only)
1. Month filter: tapping a month bar in openPeek (details) and renderSub (records window) FILTERS the list to that month
   (tap again or chip "Mon YYYY ×" to clear), bar stays highlighted, paging 25 + load more over filtered rows.
   Replace the jumpMonth calls in both [data-mon] handlers. Add new selectors to TAPSEL (iOS).
2. CLS: add BRKR: 'Breaker element', VFD: 'VFD drive'.
3. Components list ("Components in this position") with Lineage › buttons in openUnitPeek and the panel overview.
4. Journey map (second plan, S.linView='region'): mock locations labeled "(mock)" - Eaton/ABB distribution (Sterling, VA area),
   Nimbus central warehouse (Manassas, VA area), vendor repair center (Chantilly, VA area), E1 site mini-plan with storeroom,
   quarantine and position. Numbered stops + arrows.
5. Mode chips: "From vendor" (full round trip) / "Repair loop" (from first storeroom issue -> in service -> quarantine -> repair -> stock).
   Dim list rows outside the loop.
6. ▶ Replay route: animate legs in order with a moving dot, focusing each step row.
7. Toggle Journey map / Site map inside the lineage window; lineage opens on Journey map.
8. Note: CSS anchor `.pk-open {` appears twice (line ~249 inside .nf-btns) - anchor new CSS on `\n.pk-open { margin-top`.

## Release
python3 src/generate.py <out>/nimbus_ops && python3 src/export_plan_data.py <out>/nimbus_ops/ops.duckdb data/plan_data.json
python3 build.py ; python3 build_site.py E1 "nimbus-e1-demo" nimbus_E1_offline.html
Test headless Chrome, CHANGELOG v10 entry, footer "v10 · synthetic data", merge to main, push.
