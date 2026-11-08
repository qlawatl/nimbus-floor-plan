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

Also included: search (units, alarm codes, vendors, technicians), building tiles, the month slider / ▶, and a detail panel with Overview, Flow, Connections and Activity tabs.

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
| `src/plan_template.html` | The page: plain HTML/CSS/JS, no libraries |
| `index.html` | Built output |
