# Nimbus Site Floor Plan

An interactive 2D floor plan for a fictional data center operator. Every work order, PO, invoice, alarm, alert and labor entry is tied to a **position**. All data is synthetic.

## Using it
Live page (private Claude artifact): https://claude.ai/artifact/JY4YGV7UgUbTcRE6sRFyuA. Each update is committed here and then published to that link. You can also open `index.html` directly in any browser; it needs no server.
- **Tap** equipment to open the detail panel. It has four tabs: Overview, Flow, Connections and Activity.
- **Hold** equipment to burst its data into circles. Slide onto a circle and release to open that data's records.
- **Slide onto a circle and keep holding** to drill into it (alarm codes, vendors, technicians and so on). Release on an item to open its records filtered to that item.
- **Hold a room** (yard, electrical, mechanical, data hall) to see a rollup of everything in it. Drill into a circle to see which units drive that number.
- **Search** finds units, alarm codes, vendors, technicians and findings.
- Use the **building tiles** to switch buildings. Each tile shows its monthly alarm trend and spend.
- Use the **month slider / ▶** to watch the plan change month by month.

## Rebuilding
```bash
pip install duckdb pandas numpy pyarrow
python build.py           # put data/plan_data.json into the template and write index.html
python build.py --regen   # regenerate the synthetic dataset and detections first
```

| Path | What it is |
|---|---|
| `src/generate.py` | Synthetic dataset generator (Parquet files + DuckDB). Fixed seed, with the planted patterns listed in ANSWER_KEY.json |
| `src/export_plan_data.py` | Rollups, detection rules, drill-down breakdowns → `data/plan_data.json` |
| `src/plan_template.html` | The page: plain HTML/CSS/JS, no libraries |
| `index.html` | Built output |
