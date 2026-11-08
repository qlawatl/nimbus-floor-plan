#!/usr/bin/env python3
"""Export position-level data + detections from ops.duckdb into JSON for the floor-plan explorer."""
import sys, json
import duckdb, numpy as np, pandas as pd

DB = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/out/nimbus_ops/ops.duckdb"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/gen/plan_data.json"
c = duckdb.connect(DB, read_only=True)
df = lambda q: c.sql(q).df()
MONTHS = [str(p) for p in pd.period_range("2025-01", "2026-10", freq="M")]
LAST90 = "DATE '2026-08-03'"

pos = df("""
SELECT p.position_id id, p.asset_class cls, p.name, p.site, p.building, p.area, p.system,
       s.asset_tag, s.manufacturer, s.model, s.serial, i.installed_from
FROM positions p
JOIN position_install i ON i.position_id = p.position_id AND i.installed_to IS NULL
JOIN assets s ON s.asset_id = i.asset_id
WHERE p.level = 'position' ORDER BY 1""")

hist = df("""SELECT i.position_id id, s.asset_tag, s.manufacturer, s.model, i.installed_from, i.installed_to, i.removal_reason
FROM position_install i JOIN assets s USING (asset_id) ORDER BY installed_from""")

tot = df(f"""
SELECT position_id id, sum(alarms) alarms, sum(alarms_critical) crit, sum(alerts) alerts, sum(wo_opened) wos,
  sum(cm_opened) cm, round(sum(labor_hours)) labor, round(sum(spend)) spend,
  sum(alarms) FILTER (WHERE day >= {LAST90}) alarms90, round(sum(spend) FILTER (WHERE day >= {LAST90})) spend90,
  sum(cm_opened) FILTER (WHERE day >= {LAST90}) cm90
FROM rollup_daily GROUP BY 1""")

mon = df("""SELECT position_id id, strftime(day, '%Y-%m') m, sum(alarms) a, sum(spend) s, sum(cm_opened) cm
FROM rollup_daily GROUP BY ALL""")

openwo = df("SELECT position_id id, count(*) open_wos FROM cmms_work_orders WHERE status <> 'Closed' GROUP BY 1")
pm = df("""SELECT position_id id, count(*) pm_done, sum((closed_ts > due_ts)::INT) pm_late
FROM cmms_work_orders WHERE wo_type = 'PM' AND closed_ts IS NOT NULL GROUP BY 1""")

flow = df("""SELECT position_id id, from_type || '>' || to_type step, sum(n) n,
  round(sum(n * avg_lag_hrs) / sum(n), 1) lag, round(sum(amount)) amt FROM interaction_rollup GROUP BY ALL""")

orph = df("""SELECT x.position_id id, count(*) sevalarms,
  count(*) FILTER (WHERE w.wo_id IS NULL) orphans,
  count(*) FILTER (WHERE a.raised_ts >= TIMESTAMP '2026-05-01') sev6,
  count(*) FILTER (WHERE a.raised_ts >= TIMESTAMP '2026-05-01' AND w.wo_id IS NULL) orph6
FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id)
LEFT JOIN cmms_work_orders w ON w.source_alarm_id = a.alarm_id
WHERE a.severity IN ('critical', 'major') GROUP BY 1""")

codes = df("""SELECT * FROM (SELECT x.position_id id, a.alarm_code code, count(*) n FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id)
GROUP BY 1, 2) QUALIFY row_number() OVER (PARTITION BY id ORDER BY n DESC) <= 3""")

recent = df("""SELECT position_id id, strftime(ts, '%Y-%m-%d %H:%M') ts, event_type t, entity_id e, text, amount
FROM events WHERE position_id IS NOT NULL AND event_type <> 'alarm.cleared'
QUALIFY row_number() OVER (PARTITION BY position_id ORDER BY ts DESC) <= 14""")

feeds = df("SELECT from_position_id f, to_position_id t FROM position_feeds")
names = df("SELECT position_id id, name, level FROM positions WHERE level <> 'position'")

# ------------------------------------------------------------------ detections (no answer key used)
findings = []
def add(pid, sev, kind, title, detail):
    findings.append(dict(id=pid, sev=sev, kind=kind, title=title, detail=detail))

season_cls = {"CH", "CT", "CRAH"}
mpiv = mon.pivot_table(index="id", columns="m", values="a", aggfunc="sum").reindex(columns=MONTHS).fillna(0)
cls_of = dict(zip(pos.id, pos.cls))
# seasonal baseline per class per calendar month (median across peers)
cls_month = mpiv.groupby(mpiv.index.map(cls_of)).median()
for pid, row in mpiv.iterrows():
    base = cls_month.loc[cls_of[pid]].replace(0, 0.5)
    ratio = row / base
    for m in MONTHS[-12:]:
        if row[m] >= 10 and ratio[m] >= 3:
            add(pid, "critical" if ratio[m] >= 4 else "warning", "alarm_surge", "Alarm surge",
                f"{int(row[m])} alarms in {m}, {ratio[m]:.1f}x the peer median for that month.")
            break

o = orph.set_index("id")
for pid, r in o.iterrows():
    if r.sev6 >= 8:
        conv6 = 1 - r.orph6 / r.sev6
        conv_prior = 1 - (r.orphans - r.orph6) / max(r.sevalarms - r.sev6, 1)
        if r.sev6 >= 10 and conv6 < 0.25 and conv_prior - conv6 > 0.4:
            add(pid, "critical", "orphan_alarms", "Alarms not becoming work orders",
                f"Since May 2026 only {conv6:.0%} of critical/major alarms produced a WO (was {conv_prior:.0%}).")

rep = df("""SELECT w.position_id id, a.alarm_code code, count(*) n FROM cmms_work_orders w
JOIN bms_alarms a ON a.alarm_id = w.source_alarm_id
WHERE w.opened_ts >= TIMESTAMP '2026-01-01' GROUP BY 1, 2""")
full = pd.MultiIndex.from_tuples([(p, cd) for p in pos.id for cd in rep.code.unique()
                                  if cd.split("_")[0] == cls_of[p]], names=["id", "code"])
rep = rep.set_index(["id", "code"]).n.reindex(full).fillna(0)
for code, grp in rep.groupby(level="code"):
    med = grp.median(); mad = max((grp - med).abs().median() * 1.4826, 1)
    for (pid, _), n in grp.items():
        if n >= 8 and (n - med) / mad > 4:
            add(pid, "warning", "repeat_failure", "Bad actor: repeat failures",
                f"{int(n)} WOs from {code} alarms in 2026 vs {med:.0f} typical for its peers.")

spiv = mon.pivot_table(index="id", columns="m", values="s", aggfunc="sum").reindex(columns=MONTHS).fillna(0)
for pid, row in spiv.iterrows():
    med = max(row.median(), 500)
    peak_m = row.idxmax()
    if row[peak_m] > 60000 and row[peak_m] > 8 * med:
        add(pid, "warning", "spend_spike", "Spend spike",
            f"${row[peak_m]:,.0f} invoiced in {peak_m}, {row[peak_m] / med:.0f}x its typical month.")

for r in hist.groupby("id").filter(lambda g: len(g) > 1).query("installed_to.notna()", engine="python").itertuples():
    add(r.id, "info", "asset_swap", "Asset replaced",
        f"{r.asset_tag} ({r.manufacturer} {r.model}) removed {pd.Timestamp(r.installed_to):%Y-%m-%d}. History stays with the position.")

# portfolio-level findings (not tied to a single position)
portfolio = []
drift = df("""SELECT p.vendor, (i.invoice_date >= DATE '2026-06-01') recent, sum(i.amount) inv, sum(p.amount) po
FROM erp_invoices i JOIN erp_purchase_orders p USING (po_number)
WHERE p.po_number IN (SELECT po_number FROM erp_invoices GROUP BY 1 HAVING count(*) = 1) GROUP BY ALL""")
dp = drift.pivot_table(index="vendor", columns="recent", values=["inv", "po"], aggfunc="sum")
for v, r in dp.iterrows():
    before, after = r[("inv", False)] / r[("po", False)], r[("inv", True)] / r[("po", True)]
    if after - before > 0.15:
        portfolio.append(dict(sev="critical", title=f"Invoice drift: {v}",
            detail=f"Invoices ran {before:.0%} of PO value before Jun 2026, {after:.0%} since."))
dup = df("""SELECT vendor_invoice_no, vendor, min(amount) amt, count(*) n FROM erp_invoices GROUP BY 1, 2 HAVING count(*) > 1""")
if len(dup):
    portfolio.append(dict(sev="critical", title=f"{len(dup)} duplicate invoices",
        detail=f"Same vendor invoice number billed twice, ${dup.amt.sum():,.0f} at risk ({', '.join(dup.vendor_invoice_no[:3])}…)."))
nopo = df("SELECT count(*) n, sum(amount) amt FROM erp_invoices WHERE po_number IS NULL").iloc[0]
if nopo.n:
    portfolio.append(dict(sev="warning", title=f"{int(nopo.n)} invoices with no PO",
        detail=f"${nopo.amt:,.0f} paid without a PO or a position link."))
late = df("""SELECT site, avg((closed_ts > due_ts)::INT) r FROM cmms_work_orders WHERE wo_type = 'PM' AND closed_ts IS NOT NULL GROUP BY 1""").set_index("site").r
for s, r in late.items():
    if r > 0.15:
        portfolio.append(dict(sev="warning", title=f"PM compliance gap at {s}",
            detail=f"{r:.0%} of PMs closed after due date (other site {late.drop(s).iloc[0]:.0%})."))


# ------------------------------------------------------------------ drill-down breakdowns + recent records
bd_alarm = df("""SELECT x.position_id id, a.alarm_code k, any_value(a.severity) sev, count(*) n,
  count(*) FILTER (WHERE a.severity IN ('critical','major') AND w.wo_id IS NULL) orph
FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id) LEFT JOIN cmms_work_orders w ON w.source_alarm_id = a.alarm_id GROUP BY 1, 2""")
bd_alert = df("""SELECT x.position_id id, l.team || ' · ' || l.channel k, count(*) n, round(avg(l.acknowledged::INT), 2) ack
FROM notify_alerts l JOIN alarm_xwalk x USING (alarm_id) GROUP BY 1, 2""")
bd_wo = df("""SELECT position_id id, wo_type || ' ' || priority k, count(*) n, count(*) FILTER (WHERE status <> 'Closed') open
FROM cmms_work_orders GROUP BY 1, 2""")
bd_po = df("""SELECT w.position_id id, p.vendor k, count(*) n, round(sum(p.amount)) amt
FROM erp_purchase_orders p JOIN cmms_work_orders w USING (wo_id) GROUP BY 1, 2""")
bd_inv = df("""SELECT w.position_id id, i.vendor k, count(*) n, round(sum(i.amount)) amt
FROM erp_invoices i JOIN erp_purchase_orders p USING (po_number) JOIN cmms_work_orders w ON w.wo_id = p.wo_id GROUP BY 1, 2""")
bd_lab = df("""SELECT w.position_id id, c.technician k, count(*) n, round(sum(c.labor_hours), 1) hrs
FROM cmms_activities c JOIN cmms_work_orders w USING (wo_id) GROUP BY 1, 2""")

rec_alarm = df("""SELECT * FROM (SELECT x.position_id id, strftime(a.raised_ts, '%Y-%m-%d %H:%M') ts, a.alarm_code k, a.severity sev, a.message msg, w.wo_id wo,
  row_number() OVER (PARTITION BY x.position_id ORDER BY a.raised_ts DESC) rn
  FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id) LEFT JOIN cmms_work_orders w ON w.source_alarm_id = a.alarm_id) WHERE rn <= 12""")
rec_alert = df("""SELECT * FROM (SELECT x.position_id id, strftime(l.sent_ts, '%Y-%m-%d %H:%M') ts, l.team || ' · ' || l.channel k, l.alert_id aid, l.alarm_id, l.acknowledged ack,
  row_number() OVER (PARTITION BY x.position_id ORDER BY l.sent_ts DESC) rn
  FROM notify_alerts l JOIN alarm_xwalk x USING (alarm_id)) WHERE rn <= 10""")
rec_wo = df("""SELECT * FROM (SELECT position_id id, strftime(opened_ts, '%Y-%m-%d %H:%M') ts, wo_id wid, wo_type || ' ' || priority k, status, description d,
  row_number() OVER (PARTITION BY position_id ORDER BY opened_ts DESC) rn FROM cmms_work_orders) WHERE rn <= 12""")
rec_po = df("""SELECT * FROM (SELECT w.position_id id, strftime(p.created_ts, '%Y-%m-%d') ts, p.po_number pid, p.vendor k, p.amount amt, p.line_description d,
  row_number() OVER (PARTITION BY w.position_id ORDER BY p.created_ts DESC) rn FROM erp_purchase_orders p JOIN cmms_work_orders w USING (wo_id)) WHERE rn <= 10""")
rec_inv = df("""SELECT * FROM (SELECT w.position_id id, strftime(i.invoice_date, '%Y-%m-%d') ts, i.invoice_id iid, i.vendor k, i.amount amt, i.po_number po, i.memo d,
  row_number() OVER (PARTITION BY w.position_id ORDER BY i.invoice_date DESC) rn
  FROM erp_invoices i JOIN erp_purchase_orders p USING (po_number) JOIN cmms_work_orders w ON w.wo_id = p.wo_id) WHERE rn <= 10""")
rec_lab = df("""SELECT * FROM (SELECT w.position_id id, strftime(c.logged_ts, '%Y-%m-%d') ts, c.technician k, c.labor_hours hrs, c.note d, c.wo_id wid,
  row_number() OVER (PARTITION BY w.position_id ORDER BY c.logged_ts DESC) rn FROM cmms_activities c JOIN cmms_work_orders w USING (wo_id)) WHERE rn <= 10""")

def grp(frame, cols):
    out = {}
    for pid, g in frame.groupby("id"):
        out[pid] = [[(None if pd.isna(v) else (round(float(v), 2) if isinstance(v, (float, np.floating)) else (int(v) if isinstance(v, (np.integer, np.bool_)) else v))) for v in r] for r in g[cols].itertuples(index=False)]
    return out
BD = dict(
    alarms=grp(bd_alarm.sort_values("n", ascending=False), ["k", "n", "sev", "orph"]),
    alerts=grp(bd_alert.sort_values("n", ascending=False), ["k", "n", "ack"]),
    wos=grp(bd_wo.sort_values("n", ascending=False), ["k", "n", "open"]),
    po=grp(bd_po.sort_values("amt", ascending=False), ["k", "amt", "n"]),
    inv=grp(bd_inv.sort_values("amt", ascending=False), ["k", "amt", "n"]),
    labor=grp(bd_lab.sort_values("hrs", ascending=False), ["k", "hrs", "n"]),
)
REC = dict(
    alarms=grp(rec_alarm.sort_values("rn"), ["ts", "k", "sev", "msg", "wo"]),
    alerts=grp(rec_alert.sort_values("rn"), ["ts", "k", "aid", "alarm_id", "ack"]),
    wos=grp(rec_wo.sort_values("rn"), ["ts", "k", "wid", "status", "d"]),
    po=grp(rec_po.sort_values("rn"), ["ts", "k", "pid", "amt", "d"]),
    inv=grp(rec_inv.sort_values("rn"), ["ts", "k", "iid", "amt", "po"]),
    labor=grp(rec_lab.sort_values("rn"), ["ts", "k", "hrs", "d", "wid"]),
)


# ------------------------------------------------------------------ lifecycle chains (alarm -> alert -> WO -> labor -> PO -> invoice)
ca = df("""SELECT * FROM (SELECT x.position_id id, a.alarm_id, strftime(a.raised_ts, '%Y-%m-%d %H:%M') raised, strftime(a.cleared_ts, '%Y-%m-%d %H:%M') cleared,
  a.alarm_code code, a.severity sev, a.message msg, row_number() OVER (PARTITION BY x.position_id ORDER BY a.raised_ts DESC) rn
  FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id)) WHERE rn <= 10""")
cw_alarm = df("""SELECT w.source_alarm_id alarm_id, w.wo_id FROM cmms_work_orders w WHERE source_alarm_id IS NOT NULL""")
cw_free = df("""SELECT * FROM (SELECT position_id id, wo_id, row_number() OVER (PARTITION BY position_id ORDER BY opened_ts DESC) rn
  FROM cmms_work_orders WHERE source_alarm_id IS NULL) WHERE rn <= 6""")
alerts_all = df("""SELECT alarm_id, alert_id, strftime(sent_ts, '%Y-%m-%d %H:%M') sent, channel, team, acknowledged ack FROM notify_alerts""").set_index("alarm_id")
wo_all = df("""SELECT wo_id, wo_type, priority, strftime(opened_ts, '%Y-%m-%d %H:%M') opened, strftime(closed_ts, '%Y-%m-%d %H:%M') closed,
  strftime(due_ts, '%Y-%m-%d %H:%M') due, status, description FROM cmms_work_orders""").set_index("wo_id")
act_all = df("""SELECT wo_id, strftime(logged_ts, '%Y-%m-%d %H:%M') ts, technician, labor_hours, note FROM cmms_activities ORDER BY logged_ts""")
po_all = df("""SELECT wo_id, po_number, strftime(created_ts, '%Y-%m-%d %H:%M') ts, vendor, amount FROM erp_purchase_orders ORDER BY created_ts""")
inv_all = df("""SELECT po_number, invoice_id, strftime(invoice_date, '%Y-%m-%d') ts, amount, vendor_invoice_no FROM erp_invoices WHERE po_number IS NOT NULL ORDER BY invoice_date""")
wo_of_alarm = dict(zip(cw_alarm.alarm_id, cw_alarm.wo_id))
acts_by = {k: g[["ts", "technician", "labor_hours", "note"]].values.tolist() for k, g in act_all.groupby("wo_id")}
pos_by = {k: g[["po_number", "ts", "vendor", "amount"]].values.tolist() for k, g in po_all.groupby("wo_id")}
inv_by = {k: g[["invoice_id", "ts", "amount", "vendor_invoice_no"]].values.tolist() for k, g in inv_all.groupby("po_number")}
def nn(v):
    if v is None or (isinstance(v, float) and np.isnan(v)) or v is pd.NaT: return None
    if isinstance(v, (np.floating,)): return round(float(v), 2)
    if isinstance(v, (np.integer, np.bool_)): return int(v)
    if isinstance(v, float): return round(v, 2)
    return v
def wo_part(wid):
    if wid is None or wid not in wo_all.index: return None, [], [], []
    w = wo_all.loc[wid]
    pos = pos_by.get(wid, [])
    invs = [[*i, p[0]] for p in pos for i in inv_by.get(p[0], [])]
    return ([wid, w.wo_type, w.priority, w.opened, nn(w.closed), w.due, w.status, w.description],
            [[a[0], a[1], nn(a[2]), a[3]] for a in acts_by.get(wid, [])],
            [[p[0], p[1], p[2], nn(p[3])] for p in pos],
            [[i[0], i[1], nn(i[2]), i[3], i[4]] for i in invs])
CH = {}
for r in ca.itertuples():
    al = None
    if r.alarm_id in alerts_all.index:
        x = alerts_all.loc[r.alarm_id]
        if isinstance(x, pd.DataFrame): x = x.iloc[0]
        al = [x.alert_id, x.sent, x.channel, x.team, int(bool(x.ack))]
    w, act, po_, inv_ = wo_part(wo_of_alarm.get(r.alarm_id))
    CH.setdefault(r.id, []).append(dict(a=[r.alarm_id, r.raised, nn(r.cleared), r.code, r.sev, r.msg], al=al, w=w, act=act, po=po_, inv=inv_))
for r in cw_free.itertuples():
    w, act, po_, inv_ = wo_part(r.wo_id)
    CH.setdefault(r.id, []).append(dict(a=None, al=None, w=w, act=act, po=po_, inv=inv_))

# ------------------------------------------------------------------ assemble
def g(frame, pid, col, default=0):
    try:
        v = frame.at[pid, col]
        return default if pd.isna(v) else (v.item() if hasattr(v, "item") else v)
    except KeyError:
        return default

T, OW, PM = tot.set_index("id"), openwo.set_index("id"), pm.set_index("id")
apiv, cmpiv = mpiv, mon.pivot_table(index="id", columns="m", values="cm", aggfunc="sum").reindex(columns=MONTHS).fillna(0)
P = {}
for r in pos.itertuples():
    pid = r.id
    fl = {s.step: dict(n=int(s.n), lag=s.lag, amt=None if pd.isna(s.amt) else s.amt) for s in flow[flow.id == pid].itertuples()}
    P[pid] = dict(
        cls=r.cls, name=r.name, site=r.site, b=r.building, area=r.area, system=r.system,
        asset=dict(tag=r.asset_tag, mfr=r.manufacturer, model=r.model, serial=r.serial, since=f"{r.installed_from:%Y-%m-%d}"),
        hist=[dict(tag=h.asset_tag, mfr=h.manufacturer, model=h.model, frm=f"{h.installed_from:%Y-%m-%d}",
                   to=None if pd.isna(h.installed_to) else f"{h.installed_to:%Y-%m-%d}") for h in hist[hist.id == pid].itertuples()],
        k={col: g(T, pid, col) for col in ["alarms", "crit", "alerts", "wos", "cm", "labor", "spend", "alarms90", "spend90", "cm90"]}
          | dict(open=g(OW, pid, "open_wos"), pm=g(PM, pid, "pm_done"), pmlate=g(PM, pid, "pm_late"),
                 sev=g(o, pid, "sevalarms"), orph=g(o, pid, "orphans")),
        ma=[int(x) for x in apiv.loc[pid]] if pid in apiv.index else [0] * len(MONTHS),
        ms=[round(float(x)) for x in spiv.loc[pid]] if pid in spiv.index else [0] * len(MONTHS),
        mc=[int(x) for x in cmpiv.loc[pid]] if pid in cmpiv.index else [0] * len(MONTHS),
        flow=fl,
        codes=[dict(code=x.code, n=int(x.n)) for x in codes[codes.id == pid].itertuples()],
        ev=[dict(ts=e.ts, t=e.t, e=e.e, x=e.text, a=None if pd.isna(e.amount) else round(float(e.amount), 1))
            for e in recent[recent.id == pid].itertuples()],
    )

data = dict(months=MONTHS, positions=P, feeds=feeds.values.tolist(), names=dict(zip(names.id, names.name)),
            findings=findings, portfolio=portfolio, bd=BD, rec=REC, chains=CH,
            asof="2026-10-31")
json.dump(data, open(OUT, "w"), separators=(",", ":"), default=float)
print(len(json.dumps(data)) // 1024, "KB;", len(findings), "position findings;", len(portfolio), "portfolio findings")
for f in findings: print(f["sev"], f["id"], f["kind"], f["detail"])
for f in portfolio: print(f)
