# Nimbus Site Floor Plan

An interactive 2D floor plan for a fictional data center operator. Every work order, PO, invoice, alarm, alert and labor entry is tied to a **position**. All data is synthetic.

## Using it
Open the artifact link, or `index.html` in any browser.

| Gesture | Drawing | Burst | Details window / lifecycle |
|---|---|---|---|
| **Tap** | Unit or room → its burst | Drill in | Record → its lifecycle |
| **Double-tap** | — | Back one level | Close and return to the bubbles |
| **Hold** (ring countdown) | Unit → full detail panel | Details window for that bubble | — |

**Triple-tap** anywhere to go back to the main page.

**Site map and lineage:** "‹ Zoom out: site map" shows both buildings, the storeroom and offsite locations. Every asset has a **Lineage** button that draws where it has been (warehouse → storeroom bin → positions → repair depot …) and where it was 6 months ago.

Also included: search (units, alarm codes, vendors, technicians), building tiles, the month slider / ▶, and a detail panel with Overview, Flow, Connections and Activity tabs.

## Encrypted single-site snapshot (store-and-forward demo)
```bash
pip install cryptography
python build_site.py E1 "your-passphrase"     # writes nimbus_E1_offline.html (AES-256-GCM, PBKDF2-SHA256 310k)
```
Open the file, enter the passphrase, and work offline. Field notes queue encrypted on the device and forward when the device is online (simulated in the demo).

## Rebuilding
```bash
pip install duckdb pandas numpy pyarrow
python build.py           # put data/plan_data.json into the template and write index.html
python build.py --regen   # regenerate the synthetic dataset, detections and lifecycle chains first
```

| Path | What it is |
|---|---|
| `src/generate.py` | Synthetic dataset generator (Parquet files + DuckDB). Fixed seed, with the planted patterns listed in ANSWER_KEY.json |
| `src/export_plan_data.py` | Rollups, detection rules, drill-down breakdowns → `data/plan_data.json` |
| `src/plan_template.html` | The page: plain HTML/CSS/JS, no libraries. Data is injected gzip-compressed + base64 and unpacked in the browser |
| `index.html` | Built output |
