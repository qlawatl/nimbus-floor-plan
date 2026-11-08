#!/usr/bin/env python3
"""
Synthetic operational dataset for "Nimbus Cloud Services" (fictional data center operator).
Everything ties to POSITION. Produces raw source-system tables, curated tables
(events, edges, position_tree, rollups), and a self-contained DuckDB file.

Usage: python3 generate.py [out_dir]
"""
import os, sys, shutil, json
import numpy as np
import pandas as pd
import duckdb

SEED = 20261107
rng = np.random.default_rng(SEED)
OUT = sys.argv[1] if len(sys.argv) > 1 else "nimbus_ops"
START = pd.Timestamp("2025-01-01")
END = pd.Timestamp("2026-11-01")
DAYS = (END - START).days
DAY_IDX = pd.date_range(START, periods=DAYS, freq="D")

SITES = {"E1": ("Nimbus East 1", "Virginia"), "W1": ("Nimbus West 1", "Oregon")}
BUILDINGS = ["B1", "B2"]

# ---------------------------------------------------------------- class config
# alarms: (code, severity, [alarm messages], [CM work-order descriptions])
CLASSES = {
 "SWGR": dict(n=2, area="Electrical", system="Medium Voltage", pm=180, rate=0.012, cost=7000,
   vendors=["Volta Power Services", "GridLine Electrical"], mfr=[("Eaton", "MV-15"), ("ABB", "UniGear ZS1")],
   pm_txt="Semi-annual switchgear PM: IR scan, torque check, breaker exercise",
   alarms=[("SWGR_BRKR_TRIP", "critical", ["Main breaker trip", "Breaker tripped on overcurrent"],
            ["Investigate breaker trip, IR scan and reset", "Breaker trip - test trip unit and megger feeders", "Overcurrent trip on main, inspect bus and reset breaker"]),
           ("SWGR_RELAY_FLT", "major", ["Protective relay fault", "Relay self-test failure"],
            ["Replace failed protective relay", "Relay fault - reflash firmware and retest", "Protection relay self-test fail, swap relay"])]),
 "UPS": dict(n=4, area="Electrical", system="UPS", pm=90, rate=0.06, cost=9000,
   vendors=["Volta Power Services", "Keystone UPS Support"], mfr=[("Vertiv", "Liebert EXL S1"), ("Schneider", "Galaxy VX")],
   pm_txt="Quarterly UPS PM: battery impedance test, capacitor check, firmware review",
   alarms=[("UPS_ON_BATTERY", "critical", ["UPS on battery", "Input power lost - on battery"],
            ["UPS transferred to battery - investigate input source", "On-battery event, check rectifier input and upstream breaker"]),
           ("UPS_BATT_FAULT", "major", ["Battery string fault", "Battery impedance high"],
            ["Replace failed battery jars in string", "Battery string fault - impedance test and replace weak cells", "High impedance on batteries, swap jars"]),
           ("UPS_FAN_FAIL", "minor", ["Cooling fan failure", "Module fan fault"],
            ["Replace UPS module cooling fan", "Module fan failed, replace fan assembly"])]),
 "PDU": dict(n=8, area="Data Hall", system="Power Distribution", pm=180, rate=0.02, cost=2500,
   vendors=["GridLine Electrical"], mfr=[("Vertiv", "PDU-225"), ("Eaton", "PDU-300")],
   pm_txt="Semi-annual PDU PM: IR scan, branch circuit load check",
   alarms=[("PDU_OVERLOAD", "major", ["Branch circuit overload", "Panel load above threshold"],
            ["Rebalance branch circuit loads on PDU", "Overload on branch, redistribute circuits"]),
           ("PDU_GROUND_FLT", "major", ["Ground fault detected", "Ground current alarm"],
            ["Locate and clear ground fault", "Ground fault alarm - trace circuits with clamp meter"])]),
 "GEN": dict(n=3, area="Electrical", system="Generators", pm=30, rate=0.03, cost=6000,
   vendors=["Ironclad Generator Co", "Volta Power Services"], mfr=[("Caterpillar", "3516C"), ("Cummins", "QSK60")],
   pm_txt="Monthly generator PM: run test under load, fluid check",
   alarms=[("GEN_FAIL_START", "critical", ["Generator failed to start", "Start failure on test"],
            ["Generator failed to start - check starter and batteries", "Fail to crank on monthly test, replace starter motor", "No start on gen test, inspect fuel system"]),
           ("GEN_LOW_COOLANT", "minor", ["Low coolant level", "Coolant level warning"],
            ["Top off coolant and pressure test", "Coolant low - check for leaks, refill"])]),
 "ATS": dict(n=3, area="Electrical", system="Transfer Switches", pm=180, rate=0.01, cost=3000,
   vendors=["GridLine Electrical"], mfr=[("ASCO", "7000 Series")],
   pm_txt="Semi-annual ATS PM: transfer test, contact inspection",
   alarms=[("ATS_XFER_FAIL", "critical", ["Transfer failure", "ATS failed to transfer"],
            ["ATS failed to transfer - inspect controller and contacts", "Transfer fail, replace ATS controller board"])]),
 "CH": dict(n=3, area="Mechanical", system="Chiller Plant", pm=30, rate=0.07, cost=8000, seasonal=True,
   vendors=["Arctic Mechanical Services", "Polar HVAC Partners"], mfr=[("Trane", "CVHF 1300"), ("Carrier", "19DV")],
   pm_txt="Monthly chiller PM: log readings, oil analysis, refrigerant check",
   alarms=[("CH_HIGH_COND_PRESS", "major", ["High condenser pressure", "Cond press high trip"],
            ["Chiller tripped on high condenser pressure - clean condenser tubes", "CH trip HP cond, check CT flow and clean tubes", "Compressor shutdown on high head pressure"]),
           ("CH_LOW_EVAP_TEMP", "major", ["Low evaporator temperature", "Evap freeze protection"],
            ["Low evap temp trip - check chilled water flow", "Freeze stat trip on evaporator, verify pump flow"]),
           ("CH_COMP_FAULT", "critical", ["Compressor fault", "Compressor motor overload"],
            ["Compressor fault - megger motor, inspect starter", "Compressor overload trip, check amps and bearings"])]),
 "CT": dict(n=3, area="Mechanical", system="Condenser Water", pm=30, rate=0.05, cost=4000, seasonal=True,
   vendors=["Arctic Mechanical Services", "AquaTreat Water Services"], mfr=[("BAC", "Series 3000"), ("Marley", "NC8400")],
   pm_txt="Monthly cooling tower PM: basin clean, water treatment, fan belt check",
   alarms=[("CT_FAN_VIB", "minor", ["Fan vibration high", "Vibration switch trip"],
            ["Cooling tower fan vibration - balance fan, check gearbox", "High vibe on CT fan, inspect gearbox oil"]),
           ("CT_LOW_BASIN", "major", ["Low basin level", "Makeup water low"],
            ["Low basin level - check makeup valve", "Makeup water valve stuck, repair float valve"])]),
 "CRAH": dict(n=12, area="Data Hall", system="Air Handling", pm=90, rate=0.05, cost=1800, seasonal=True,
   vendors=["Polar HVAC Partners", "Arctic Mechanical Services"], mfr=[("Vertiv", "Liebert CW"), ("Stulz", "CyberAir 3PRO")],
   pm_txt="Quarterly CRAH PM: filter change, belt inspection, coil clean", w=[0.35, 0.08, 0.57],
   alarms=[("CRAH_HIGH_SUPPLY_TEMP", "major", ["High supply air temperature", "Supply temp above setpoint"],
            ["High supply air temp - check chilled water valve", "Supply air hot, verify CHW valve actuator", "Valve actuator stuck, CRAH discharging warm air"]),
           ("CRAH_FAN_FAIL", "critical", ["Fan failure", "EC fan fault"],
            ["CRAH fan failure - replace fan belt", "Fan belt broken on CRAH, replace belt and align sheaves", "Replace failed EC fan motor"]),
           ("CRAH_FILTER_DP", "warning", ["Filter differential pressure high", "Dirty filter alarm"],
            ["Replace clogged filters", "Filter DP high, change filters"])]),
 "PUMP": dict(n=4, area="Mechanical", system="Chilled Water", pm=90, rate=0.02, cost=3500,
   vendors=["Polar HVAC Partners"], mfr=[("Grundfos", "NKG 200"), ("Armstrong", "4300")],
   pm_txt="Quarterly pump PM: vibration analysis, seal inspection, grease bearings",
   alarms=[("PUMP_SEAL_LEAK", "major", ["Seal leak detected", "Water detected at pump base"],
            ["Pump mechanical seal leaking - replace seal", "Leak at pump seal, rebuild seal kit"]),
           ("PUMP_VFD_FAULT", "major", ["VFD fault", "Drive overcurrent"],
            ["Pump VFD fault - reset and review fault log", "Drive overcurrent trip, check motor windings"])]),
 "FIRE": dict(n=1, area="Life Safety", system="Fire Detection", pm=90, rate=0.01, cost=1500,
   vendors=["Sentinel Fire Protection"], mfr=[("Xtralis", "VESDA-E VEU")],
   pm_txt="Quarterly fire detection PM: VESDA sensitivity test, panel battery check",
   alarms=[("FIRE_VESDA_ALERT", "major", ["VESDA alert level", "Smoke detected - alert"],
            ["VESDA alert - investigate source, replace filter", "Smoke alert in data hall, inspect and reset detector"])]),
}
SEV_WO_P = {"critical": 0.9, "major": 0.55, "minor": 0.08, "warning": 0.03}
RATE_SCALE = 3.0  # overall alarm volume
SEV_ALERT_P = {"critical": 0.9, "major": 0.3, "minor": 0.0, "warning": 0.0}
TECHS = {"E1": ["A. Rivera", "D. Okafor", "M. Chen", "S. Patel", "J. Brooks", "L. Nguyen"],
         "W1": ["K. Larsen", "R. Gomez", "T. Yamada", "B. Foster", "P. Singh"]}
CLOSE_NOTES = {"PM": ["PM completed, no deficiencies", "PM done, readings logged", "Completed, minor adjustments made", "PM complete, noted wear for follow-up"],
               "CM": ["Repaired and returned to service", "Parts replaced, tested OK", "Root cause found and corrected", "Temporary fix, follow-up required", "Vendor on site, repair complete"]}

def ts_rand(day, n=1):
    return day + pd.to_timedelta(rng.uniform(0, 86400, n), unit="s")

def season(days):  # 1.0 in winter, ~1.7 peak mid-July
    doy = np.array([d.dayofyear for d in days])
    return 1 + 0.7 * np.clip(np.sin((doy - 105) / 365 * 2 * np.pi), 0, None)

SEASON = season(DAY_IDX)

# ---------------------------------------------------------------- positions & assets
positions, feeds = [], []
def add_pos(pid, name, level, parent, site, bldg=None, area=None, system=None, cls=None):
    positions.append(dict(position_id=pid, name=name, level=level, parent_id=parent, site=site,
                          building=bldg, area=area, system=system, asset_class=cls))

for s, (sname, state) in SITES.items():
    add_pos(s, f"{sname} ({state})", "site", None, s)
    for b in BUILDINGS:
        bid = f"{s}-{b}"
        add_pos(bid, f"{sname} Building {b}", "building", s, s, bid)
        areas, systems = {}, {}
        for cls, c in CLASSES.items():
            aid = f"{bid}-{c['area'].upper().replace(' ', '')}"
            if aid not in areas:
                add_pos(aid, f"{bid} {c['area']}", "area", bid, s, bid, c["area"]); areas[aid] = 1
            sid = f"{aid}-{cls}SYS"
            if sid not in systems:
                add_pos(sid, f"{bid} {c['system']}", "system", aid, s, bid, c["area"], c["system"]); systems[sid] = 1
            for i in range(1, c["n"] + 1):
                add_pos(f"{bid}-{cls}-{i:02d}", f"{cls}-{i:02d}", "position", sid, s, bid, c["area"], c["system"], cls)
        p = lambda cls, i: f"{bid}-{cls}-{i:02d}"
        for i in range(1, 4):
            feeds += [(p("GEN", i), p("ATS", i)), (p("ATS", i), p("SWGR", 1 + (i % 2)))]
            feeds += [(p("CT", i), p("CH", i)), (p("CH", i), p("PUMP", i))]
        for k in range(1, 5):
            feeds += [(p("SWGR", 1 + (k > 2)), p("UPS", k)), (p("UPS", k), p("PDU", 2 * k - 1)), (p("UPS", k), p("PDU", 2 * k))]
            for j in range(3):
                feeds.append((p("PUMP", k), p("CRAH", 3 * (k - 1) + j + 1)))

pos_df = pd.DataFrame(positions)
leaf = pos_df[pos_df.level == "position"].reset_index(drop=True)

assets, installs = [], []
asset_seq = [100000]
def new_asset(cls, installed):
    asset_seq[0] += 1
    mfr, model = CLASSES[cls]["mfr"][rng.integers(len(CLASSES[cls]["mfr"]))]
    aid = f"A{asset_seq[0]}"
    assets.append(dict(asset_id=aid, asset_tag=f"TAG-{cls}-{asset_seq[0]}", asset_class=cls, manufacturer=mfr,
                       model=model, serial=f"SN{rng.integers(10**7, 10**8)}", commissioned=installed))
    return aid

SWAPS = {"E1-B2-UPS-03": pd.Timestamp("2026-03-10 14:00")}  # injected: degraded UPS replaced
for pid in rng.choice(leaf[leaf.asset_class.isin(["CRAH", "PUMP", "UPS", "CT"])].position_id, 6, replace=False):
    SWAPS.setdefault(pid, START + pd.Timedelta(days=int(rng.integers(60, DAYS - 30)), hours=10))

install_lookup = {}
for r in leaf.itertuples():
    first = pd.Timestamp("2022-06-01") + pd.Timedelta(days=int(rng.integers(0, 400)))
    a1 = new_asset(r.asset_class, first)
    if r.position_id in SWAPS:
        sw = SWAPS[r.position_id]
        a2 = new_asset(r.asset_class, sw)
        installs += [dict(asset_id=a1, position_id=r.position_id, installed_from=first, installed_to=sw, removal_reason="Replaced - end of life/degraded"),
                     dict(asset_id=a2, position_id=r.position_id, installed_from=sw, installed_to=None, removal_reason=None)]
        install_lookup[r.position_id] = [(first, sw, a1), (sw, pd.Timestamp.max, a2)]
    else:
        installs.append(dict(asset_id=a1, position_id=r.position_id, installed_from=first, installed_to=None, removal_reason=None))
        install_lookup[r.position_id] = [(first, pd.Timestamp.max, a1)]
assets_df = pd.DataFrame(assets)
tag_of = dict(zip(assets_df.asset_id, assets_df.asset_tag))

def asset_at(pid, t):
    for a, b, aid in install_lookup[pid]:
        if a <= t < b:
            return aid
    return install_lookup[pid][-1][2]

# ---------------------------------------------------------------- alarms
def mult_ramp(lo, hi, m0, m1):
    m = np.ones(DAYS)
    i0, i1 = (pd.Timestamp(lo) - START).days, (pd.Timestamp(hi) - START).days
    m[i0:i1] = np.linspace(m0, m1, i1 - i0)
    return m

RATE_MULT = {
    # injected: chiller degradation then major failure on 2026-09-22
    "E1-B1-CH-02": mult_ramp("2026-08-15", "2026-09-22", 1, 9) * np.where(DAY_IDX >= "2026-09-22", 0.4, 1),
    # injected: UPS battery degradation until swap
    "E1-B2-UPS-03": mult_ramp("2026-01-01", "2026-03-10", 1, 6) * np.where(DAY_IDX >= "2026-03-10", 0.3, 1),
}

alarms = []
aseq = 0
for r in leaf.itertuples():
    c = CLASSES[r.asset_class]
    lam = np.full(DAYS, c["rate"] * RATE_SCALE) * (SEASON if c.get("seasonal") else 1) * RATE_MULT.get(r.position_id, 1)
    counts = rng.poisson(lam)
    for di in np.nonzero(counts)[0]:
        for t in ts_rand(DAY_IDX[di], counts[di]):
            code, sev, msgs, cms = c["alarms"][rng.choice(len(c["alarms"]), p=c.get("w"))]
            if r.position_id == "E1-B1-CH-02" and DAY_IDX[di] >= pd.Timestamp("2026-08-15") and DAY_IDX[di] < pd.Timestamp("2026-09-22"):
                code, sev, msgs, cms = c["alarms"][[0, 2][rng.integers(2)]]
            if r.position_id == "E1-B2-UPS-03" and pd.Timestamp("2026-01-01") <= DAY_IDX[di] < pd.Timestamp("2026-03-10"):
                code, sev, msgs, cms = c["alarms"][1]
            aseq += 1
            alarms.append([f"ALM-{aseq:07d}", t, r.position_id, code, sev, msgs[rng.integers(len(msgs))], cms])

# injected: chronic CRAH fan-belt failure every ~3 weeks through 2026
t = pd.Timestamp("2026-01-06 03:00")
while t < END - pd.Timedelta(days=3):
    aseq += 1
    a = CLASSES["CRAH"]["alarms"][1]
    alarms.append([f"ALM-{aseq:07d}", t + pd.Timedelta(hours=float(rng.uniform(0, 20))), "E1-B2-CRAH-07", a[0], a[1], a[2][0], ["CRAH fan failure - replace fan belt", "Fan belt broken on CRAH, replace belt and align sheaves"]])
    t += pd.Timedelta(days=float(rng.normal(21, 3)))

alarms.sort(key=lambda x: x[1])

bms_alarms, alerts, work_orders, pos_for_wo = [], [], [], {}
wo_seq, alert_seq = [3000000], [0]

def make_wo(wtype, pid, opened, desc, prio, alarm_id=None, due=None, close_after_h=None):
    wo_seq[0] += 1
    wid = f"WO-{wo_seq[0]}"
    if close_after_h is None:
        close_after_h = rng.lognormal(np.log(30 if wtype == "CM" else 60), 0.8)
    closed = opened + pd.Timedelta(hours=float(close_after_h))
    status = "Closed"
    if closed >= END:
        closed, status = None, ["Open", "In Progress", "Waiting Parts"][rng.integers(3)]
    work_orders.append(dict(wo_id=wid, wo_type=wtype, priority=prio, position_id=pid, asset_id=asset_at(pid, opened),
                            description=desc, opened_ts=opened, due_ts=due if due is not None else opened + pd.Timedelta(days={"P1": 1, "P2": 3, "P3": 7, "P4": 14}[prio]),
                            closed_ts=closed, status=status, source_alarm_id=alarm_id, site=pid[:2], building=pid[:5]))
    return wid

ORPHAN_FROM = pd.Timestamp("2026-05-01")  # injected: W1-B2 CRAH alarms stop generating WOs
for aid, t, pid, code, sev, msg, cms in alarms:
    dur = rng.lognormal(np.log({"critical": 90, "major": 45, "minor": 20, "warning": 240}[sev]), 0.9)
    cleared = t + pd.Timedelta(minutes=float(dur))
    bms_alarms.append(dict(alarm_id=aid, raised_ts=t, cleared_ts=cleared if cleared < END else None,
                           asset_tag=tag_of[asset_at(pid, t)], alarm_code=code, severity=sev, message=msg,
                           bms_point=f"{pid.replace('-', '.')}.{code}"))
    if rng.random() < SEV_ALERT_P[sev]:
        alert_seq[0] += 1
        alerts.append(dict(alert_id=f"ALR-{alert_seq[0]:06d}", alarm_id=aid, sent_ts=t + pd.Timedelta(minutes=float(rng.uniform(1, 10))),
                           channel="Page" if sev == "critical" else "Email", team="Critical Facilities" if pid.split("-")[2] in ("SWGR", "UPS", "PDU", "GEN", "ATS") else "Mechanical",
                           acknowledged=bool(rng.random() < 0.93)))
    p = SEV_WO_P[sev]
    if pid == "E1-B2-CRAH-07" and code == "CRAH_FAN_FAIL" and t >= pd.Timestamp("2026-01-01"):
        p = 1.0
    if pid.startswith("W1-B2-CRAH") and t >= ORPHAN_FROM:
        p *= 0.1
    if rng.random() < p:
        lag = rng.lognormal(np.log(3 if sev == "critical" else 8), 0.9)
        make_wo("CM", pid, t + pd.Timedelta(hours=float(lag)), cms[rng.integers(len(cms))],
                {"critical": "P1", "major": "P2", "minor": "P3", "warning": "P4"}[sev], alarm_id=aid)

# PMs and inspection-found CMs
for r in leaf.itertuples():
    c = CLASSES[r.asset_class]
    due = START + pd.Timedelta(days=int(rng.integers(0, c["pm"])))
    while due < END + pd.Timedelta(days=7):
        opened = due - pd.Timedelta(days=7, hours=-6)
        if START <= opened < END:
            late = rng.random() < (0.22 if r.position_id.startswith("W1") else 0.07)
            close_h = (rng.uniform(170, 600) if late else rng.uniform(20, 160))
            make_wo("PM", r.position_id, opened, c["pm_txt"], "P3", due=due, close_after_h=close_h)
        due += pd.Timedelta(days=c["pm"] + int(rng.integers(-3, 4)))
    n_insp = rng.poisson(DAYS / 365 * 1.0)
    for d in rng.integers(0, DAYS, n_insp):
        a = c["alarms"][rng.integers(len(c["alarms"]))]
        make_wo("CM", r.position_id, ts_rand(DAY_IDX[d])[0], "Found during rounds: " + a[3][rng.integers(len(a[3]))].lower(), "P3")

# injected one-offs
wo_ch_fail = make_wo("CM", "E1-B1-CH-02", pd.Timestamp("2026-09-22 05:40"), "Chiller compressor catastrophic failure - replace compressor assembly", "P1", close_after_h=24 * 16)
wo_gen_rent = make_wo("CM", "W1-B1-GEN-02", pd.Timestamp("2026-02-03 11:15"), "Generator crankshaft failure - emergency rental generator and engine rebuild", "P1", close_after_h=24 * 25)
for pid, sw in SWAPS.items():
    make_wo("CM", pid, sw - pd.Timedelta(hours=4), f"Replace {pid.split('-')[2]} unit - asset replacement", "P2", close_after_h=8)

wo_df = pd.DataFrame(work_orders).sort_values("opened_ts").reset_index(drop=True)

# ---------------------------------------------------------------- activities (labor)
acts = []
for w in wo_df.itertuples():
    end = w.closed_ts if pd.notna(w.closed_ts) else END
    n = 1 if w.wo_type == "PM" else int(rng.integers(1, 4))
    techs = TECHS[w.site]
    for k in range(n):
        t = w.opened_ts + (end - w.opened_ts) * float(rng.uniform(0.1, 1.0))
        if t >= END:
            continue
        note = CLOSE_NOTES[w.wo_type][rng.integers(len(CLOSE_NOTES[w.wo_type]))] if k == n - 1 and pd.notna(w.closed_ts) else "Diagnosed, awaiting parts" if w.wo_type == "CM" else "Started PM"
        acts.append(dict(activity_id=f"ACT-{len(acts) + 1:07d}", wo_id=w.wo_id, logged_ts=t, technician=techs[rng.integers(len(techs))],
                         labor_hours=round(float(rng.lognormal(np.log(2.5 if w.wo_type == "PM" else 3.5), 0.6)), 1), note=note))
acts_df = pd.DataFrame(acts)

# ---------------------------------------------------------------- POs and invoices
pos_rows, inv_rows = [], []
po_seq, inv_seq = [4500000], [0]
cls_of = dict(zip(leaf.position_id, leaf.asset_class))

def make_po(wo, created, vendor, amount, desc):
    po_seq[0] += 1
    pid = f"PO-{po_seq[0]}"
    pos_rows.append(dict(po_number=pid, wo_id=wo, vendor=vendor, created_ts=created, amount=round(amount, 2), line_description=desc,
                         status="Approved"))
    return pid

def invoice(po, vendor, inv_date, amount, memo):
    inv_seq[0] += 1
    if inv_date >= END:
        return
    inv_rows.append(dict(invoice_id=f"INV-{inv_seq[0]:07d}", vendor_invoice_no=f"{vendor[:3].upper()}-{500000 + inv_seq[0]}",
                         vendor=vendor, po_number=po, invoice_date=inv_date.normalize(), amount=round(amount, 2), memo=memo,
                         status="Paid" if inv_date < END - pd.Timedelta(days=30) else "Pending"))

DRIFT_VENDOR, DRIFT_FROM = "Arctic Mechanical Services", pd.Timestamp("2026-06-01")
for w in wo_df.itertuples():
    c = CLASSES[cls_of[w.position_id]]
    if w.wo_id in (wo_ch_fail, wo_gen_rent):
        continue
    p = (0.6 if w.priority == "P1" else 0.45) if w.wo_type == "CM" else 0.12
    if rng.random() >= p:
        continue
    vendor = c["vendors"][rng.integers(len(c["vendors"]))]
    base = c["cost"] * (0.25 if w.wo_type == "PM" else 1) * (4 if "asset replacement" in w.description else 1)
    amt = float(rng.lognormal(np.log(base), 0.55))
    created = w.opened_ts + pd.Timedelta(hours=float(rng.uniform(1, 72)))
    if created >= END:
        continue
    po = make_po(w.wo_id, created, vendor, amt, ("Parts and labor: " if w.wo_type == "CM" else "Consumables: ") + w.description[:60])
    splits = [1.0] if rng.random() > 0.1 else [0.6, 0.4]
    d = created
    for s in splits:
        d = d + pd.Timedelta(days=float(rng.uniform(7, 40)))
        f = rng.normal(1, 0.03) * (1.35 if vendor == DRIFT_VENDOR and d >= DRIFT_FROM else 1)
        invoice(po, vendor, d, amt * s * f, f"Invoice for {po}")

po = make_po(wo_ch_fail, pd.Timestamp("2026-09-22 09:00"), "Polar HVAC Partners", 185000, "Compressor assembly replacement, rigging, startup")
invoice(po, "Polar HVAC Partners", pd.Timestamp("2026-10-12"), 111000, "Progress billing 60%")
invoice(po, "Polar HVAC Partners", pd.Timestamp("2026-10-28"), 74000, "Final billing 40%")
po = make_po(wo_gen_rent, pd.Timestamp("2026-02-03 13:00"), "Ironclad Generator Co", 96000, "Emergency rental 2MW generator + engine rebuild")
invoice(po, "Ironclad Generator Co", pd.Timestamp("2026-02-20"), 38000, "Rental generator 3 weeks")
invoice(po, "Ironclad Generator Co", pd.Timestamp("2026-03-15"), 61500, "Engine rebuild parts and labor")

inv_df = pd.DataFrame(inv_rows)
# injected: duplicate invoices (same vendor invoice no + amount, re-submitted)
dup_src = inv_df.sample(6, random_state=7)
dups = dup_src.copy()
dups["invoice_id"] = [f"INV-{inv_seq[0] + i + 1:07d}" for i in range(len(dups))]
dups["invoice_date"] = dups.invoice_date + pd.to_timedelta(rng.integers(3, 21, len(dups)), unit="D")
inv_seq[0] += len(dups)
# injected: invoices with no PO (maverick spend)
nopo = []
for i in range(8):
    inv_seq[0] += 1
    v = ["Volta Power Services", "Arctic Mechanical Services", "Sentinel Fire Protection", "AquaTreat Water Services"][i % 4]
    d = START + pd.Timedelta(days=int(rng.integers(30, DAYS - 10)))
    nopo.append(dict(invoice_id=f"INV-{inv_seq[0]:07d}", vendor_invoice_no=f"{v[:3].upper()}-{900000 + i}", vendor=v, po_number=None,
                     invoice_date=d, amount=round(float(rng.uniform(3000, 25000)), 2),
                     memo=["Emergency call-out", "After-hours service", "Misc repairs per site request", "Water treatment chemicals"][i % 4], status="Paid"))
inv_df = pd.concat([inv_df, dups, pd.DataFrame(nopo)]).sort_values("invoice_date").reset_index(drop=True)
po_df = pd.DataFrame(pos_rows)

vendors_df = pd.DataFrame(sorted({v for c in CLASSES.values() for v in c["vendors"]} | {"Sentinel Fire Protection", "AquaTreat Water Services"}), columns=["vendor"])
vendors_df["vendor_id"] = [f"V{100 + i}" for i in range(len(vendors_df))]

# ---------------------------------------------------------------- write raw
if os.path.exists(OUT):
    shutil.rmtree(OUT)
for d in ("raw", "curated"):
    os.makedirs(f"{OUT}/{d}")

def to_parquet(df, path):
    df = df.copy()
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype("datetime64[ms]")
    df.to_parquet(f"{OUT}/{path}", index=False)

raw = {
    "positions": pos_df, "position_feeds": pd.DataFrame(feeds, columns=["from_position_id", "to_position_id"]).assign(rel="feeds"),
    "assets": assets_df, "position_install": pd.DataFrame(installs), "vendors": vendors_df,
    "cmms_work_orders": wo_df, "cmms_activities": acts_df, "erp_purchase_orders": po_df, "erp_invoices": inv_df,
    "bms_alarms": pd.DataFrame(bms_alarms), "notify_alerts": pd.DataFrame(alerts),
}
for k, df in raw.items():
    to_parquet(df, f"raw/{k}.parquet")

# ---------------------------------------------------------------- curate with DuckDB
con = duckdb.connect(f"{OUT}/ops.duckdb")
for k in raw:
    con.execute(f"CREATE TABLE {k} AS SELECT * FROM read_parquet('{OUT}/raw/{k}.parquet')")

con.execute("""
CREATE TABLE position_tree AS
WITH RECURSIVE t(ancestor_id, descendant_id, depth) AS (
  SELECT position_id, position_id, 0 FROM positions
  UNION ALL
  SELECT p.parent_id, t.descendant_id, t.depth + 1
  FROM t JOIN positions p ON p.position_id = t.ancestor_id
  WHERE p.parent_id IS NOT NULL)
SELECT * FROM t;

-- crosswalk: alarm asset_tag -> asset -> position at alarm time
CREATE TABLE alarm_xwalk AS
SELECT a.alarm_id, i.position_id, s.asset_id
FROM bms_alarms a
JOIN assets s ON s.asset_tag = a.asset_tag
JOIN position_install i ON i.asset_id = s.asset_id
 AND a.raised_ts >= i.installed_from AND (i.installed_to IS NULL OR a.raised_ts < i.installed_to);

CREATE TABLE events AS
SELECT * FROM (
  SELECT 'alarm.raised' event_type, a.raised_ts ts, a.alarm_id entity_id, 'alarm' entity_type, x.position_id, x.asset_id,
         NULL::DOUBLE amount, a.severity status, a.alarm_code || ': ' || a.message text, 'BMS' source_system
  FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id)
  UNION ALL
  SELECT 'alarm.cleared', a.cleared_ts, a.alarm_id, 'alarm', x.position_id, x.asset_id, NULL, a.severity, a.alarm_code, 'BMS'
  FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id) WHERE a.cleared_ts IS NOT NULL
  UNION ALL
  SELECT 'alert.sent', l.sent_ts, l.alert_id, 'alert', x.position_id, x.asset_id, NULL, l.channel, l.team || ' paged for ' || l.alarm_id, 'NOTIFY'
  FROM notify_alerts l JOIN alarm_xwalk x USING (alarm_id)
  UNION ALL
  SELECT 'wo.opened', opened_ts, wo_id, 'wo', position_id, asset_id, NULL, wo_type || '/' || priority, description, 'CMMS' FROM cmms_work_orders
  UNION ALL
  SELECT 'wo.closed', closed_ts, wo_id, 'wo', position_id, asset_id, NULL, wo_type, description, 'CMMS' FROM cmms_work_orders WHERE closed_ts IS NOT NULL
  UNION ALL
  SELECT 'activity.logged', c.logged_ts, c.activity_id, 'activity', w.position_id, w.asset_id, c.labor_hours, c.technician, c.note, 'CMMS'
  FROM cmms_activities c JOIN cmms_work_orders w USING (wo_id)
  UNION ALL
  SELECT 'po.created', p.created_ts, p.po_number, 'po', w.position_id, w.asset_id, p.amount, p.vendor, p.line_description, 'ERP'
  FROM erp_purchase_orders p JOIN cmms_work_orders w USING (wo_id)
  UNION ALL
  SELECT 'invoice.received', i.invoice_date, i.invoice_id, 'invoice', w.position_id, w.asset_id, i.amount, i.vendor, i.memo, 'ERP'
  FROM erp_invoices i
  LEFT JOIN erp_purchase_orders p USING (po_number)
  LEFT JOIN cmms_work_orders w ON w.wo_id = p.wo_id
) e WHERE ts < TIMESTAMP '2026-11-01';
ALTER TABLE events ADD COLUMN site VARCHAR; ALTER TABLE events ADD COLUMN building VARCHAR; ALTER TABLE events ADD COLUMN event_month VARCHAR;
UPDATE events SET site = substr(position_id, 1, 2), building = substr(position_id, 1, 5), event_month = strftime(ts, '%Y-%m');

CREATE TABLE edges AS
SELECT alarm_id src_id, 'alarm' src_type, alert_id dst_id, 'alert' dst_type, 'escalated_to' rel FROM notify_alerts
UNION ALL SELECT source_alarm_id, 'alarm', wo_id, 'wo', 'generated' FROM cmms_work_orders WHERE source_alarm_id IS NOT NULL
UNION ALL SELECT wo_id, 'wo', po_number, 'po', 'procured_by' FROM erp_purchase_orders
UNION ALL SELECT po_number, 'po', invoice_id, 'invoice', 'billed_by' FROM erp_invoices WHERE po_number IS NOT NULL
UNION ALL SELECT wo_id, 'wo', position_id, 'position', 'on_position' FROM cmms_work_orders
UNION ALL SELECT asset_id, 'asset', position_id, 'position', 'installed_in' FROM position_install
UNION ALL SELECT position_id, 'position', parent_id, 'position', 'child_of' FROM positions WHERE parent_id IS NOT NULL
UNION ALL SELECT from_position_id, 'position', to_position_id, 'position', 'feeds' FROM position_feeds;

-- daily rollup at leaf positions (roll up any level by joining position_tree)
CREATE TABLE rollup_daily AS
SELECT CAST(ts AS DATE) AS day, position_id,
  count(*) FILTER (WHERE event_type = 'alarm.raised') alarms,
  count(*) FILTER (WHERE event_type = 'alarm.raised' AND status = 'critical') alarms_critical,
  count(*) FILTER (WHERE event_type = 'alert.sent') alerts,
  count(*) FILTER (WHERE event_type = 'wo.opened') wo_opened,
  count(*) FILTER (WHERE event_type = 'wo.opened' AND status LIKE 'CM%') cm_opened,
  count(*) FILTER (WHERE event_type = 'wo.closed') wo_closed,
  coalesce(sum(amount) FILTER (WHERE event_type = 'activity.logged'), 0) labor_hours,
  coalesce(sum(amount) FILTER (WHERE event_type = 'po.created'), 0) po_committed,
  coalesce(sum(amount) FILTER (WHERE event_type = 'invoice.received'), 0) spend
FROM events WHERE position_id IS NOT NULL GROUP BY ALL;

CREATE TABLE interaction_rollup AS
WITH chain AS (
  SELECT 'alarm' from_type, 'alert' to_type, x.position_id, a.raised_ts t0, l.sent_ts t1, NULL::DOUBLE amount
  FROM notify_alerts l JOIN bms_alarms a USING (alarm_id) JOIN alarm_xwalk x USING (alarm_id)
  UNION ALL
  SELECT 'alarm', 'wo', w.position_id, a.raised_ts, w.opened_ts, NULL
  FROM cmms_work_orders w JOIN bms_alarms a ON a.alarm_id = w.source_alarm_id
  UNION ALL
  SELECT 'wo', 'po', w.position_id, w.opened_ts, p.created_ts, p.amount
  FROM erp_purchase_orders p JOIN cmms_work_orders w USING (wo_id)
  UNION ALL
  SELECT 'po', 'invoice', w.position_id, p.created_ts, i.invoice_date, i.amount
  FROM erp_invoices i JOIN erp_purchase_orders p USING (po_number) JOIN cmms_work_orders w USING (wo_id)
)
SELECT CAST(t0 AS DATE) AS day, position_id, from_type, to_type, count(*) n,
       sum(amount) amount, round(avg(epoch(t1 - t0)) / 3600, 2) avg_lag_hrs
FROM chain GROUP BY ALL;

-- alarms that never produced a WO (process gap signal)
CREATE VIEW orphan_alarms AS
SELECT a.*, x.position_id FROM bms_alarms a JOIN alarm_xwalk x USING (alarm_id)
WHERE a.severity IN ('critical', 'major')
  AND a.alarm_id NOT IN (SELECT source_alarm_id FROM cmms_work_orders WHERE source_alarm_id IS NOT NULL);
""")

for t in ("position_tree", "edges", "rollup_daily", "interaction_rollup"):
    con.execute(f"COPY {t} TO '{OUT}/curated/{t}.parquet' (FORMAT parquet)")
con.execute(f"COPY events TO '{OUT}/curated/events' (FORMAT parquet, PARTITION_BY (event_month))")

counts = {t: con.execute(f"SELECT count(*) FROM {t}").fetchone()[0] for t in
          ["positions", "assets", "bms_alarms", "notify_alerts", "cmms_work_orders", "cmms_activities",
           "erp_purchase_orders", "erp_invoices", "events", "edges", "rollup_daily", "interaction_rollup"]}
con.close()

answer_key = {
  "seed": SEED, "range": [str(START.date()), str(END.date())],
  "injected": [
    {"id": 1, "type": "degradation_then_failure", "position_id": "E1-B1-CH-02", "window": ["2026-08-15", "2026-09-22"],
     "detail": "Alarm rate ramps ~9x (high cond pressure / compressor fault), then catastrophic compressor failure WO on 2026-09-22 with $185K PO (Polar HVAC)."},
    {"id": 2, "type": "degradation_then_asset_swap", "position_id": "E1-B2-UPS-03", "window": ["2026-01-01", "2026-03-10"],
     "detail": "Battery-fault alarms ramp ~6x on the old asset; asset replaced 2026-03-10. Position history continues across the swap."},
    {"id": 3, "type": "orphan_alarms", "position_id": "W1-B2-CRAH-*", "window": ["2026-05-01", "2026-11-01"],
     "detail": "Alarm-to-WO conversion drops ~90% at W1-B2 CRAHs - alarms firing with no work orders."},
    {"id": 4, "type": "vendor_price_drift", "vendor": DRIFT_VENDOR, "from": str(DRIFT_FROM.date()),
     "detail": "Invoices run ~35% above PO amount from June 2026."},
    {"id": 5, "type": "duplicate_invoices", "invoice_ids": dups.invoice_id.tolist(),
     "detail": "Same vendor_invoice_no and amount re-submitted 3-20 days later."},
    {"id": 6, "type": "invoices_without_po", "invoice_ids": [r["invoice_id"] for r in nopo], "detail": "Maverick spend - no PO, no position link."},
    {"id": 7, "type": "chronic_repeat_failure", "position_id": "E1-B2-CRAH-07", "window": ["2026-01-06", "2026-11-01"],
     "detail": "Fan-belt failure every ~21 days; each produces a CM WO. Bad-actor pattern."},
    {"id": 8, "type": "spend_spike", "position_id": "W1-B1-GEN-02", "window": ["2026-02-03", "2026-03-15"],
     "detail": "Generator crankshaft failure: $96K emergency rental + rebuild."},
    {"id": 9, "type": "seasonality", "classes": ["CH", "CT", "CRAH"], "detail": "Alarm rates up to ~1.7x in summer. Detectors should not flag this."},
    {"id": 10, "type": "pm_compliance_gap", "site": "W1", "detail": "~22% of PMs close late at W1 vs ~7% at E1."},
    {"id": 11, "type": "asset_swaps", "positions": {k: str(v) for k, v in SWAPS.items()}, "detail": "Asset replaced at position; see position_install."},
  ],
  "row_counts": counts,
}
with open(f"{OUT}/ANSWER_KEY.json", "w") as f:
    json.dump(answer_key, f, indent=2)
print(json.dumps(counts, indent=2))
