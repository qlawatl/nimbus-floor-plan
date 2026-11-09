#!/usr/bin/env python3
"""Rebuild index.html.  python build.py            -> inject data/plan_data.json into the template
                        python build.py --regen    -> regenerate synthetic dataset + detections first"""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
p = lambda *a: os.path.join(ROOT, *a)
if "--regen" in sys.argv:
    subprocess.run([sys.executable, p("src", "generate.py"), p("build", "nimbus_ops")], check=True)
    subprocess.run([sys.executable, p("src", "export_plan_data.py"), p("build", "nimbus_ops", "ops.duckdb"), p("data", "plan_data.json")], check=True)
import base64, gzip
raw = open(p("data", "plan_data.json"), "rb").read()
data = base64.b64encode(gzip.compress(raw, 9)).decode()   # page unpacks with DecompressionStream
html = open(p("src", "plan_template.html"), encoding="utf-8").read().replace("/*__DATAZ_ATTRS__*/", "").replace("/*__DATAZ__*/", data)
open(p("index.html"), "w", encoding="utf-8").write(html)
print(f"index.html written ({len(html) // 1024} KB)")
