#!/usr/bin/env python3
"""Rebuild index.html.  python build.py            -> inject data/plan_data.json into the template
                        python build.py --regen    -> regenerate synthetic dataset + detections first"""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
p = lambda *a: os.path.join(ROOT, *a)
if "--regen" in sys.argv:
    subprocess.run([sys.executable, p("src", "generate.py"), p("build", "nimbus_ops")], check=True)
    subprocess.run([sys.executable, p("src", "export_plan_data.py"), p("build", "nimbus_ops", "ops.duckdb"), p("data", "plan_data.json")], check=True)
data = open(p("data", "plan_data.json")).read().replace("</", "<\\/")
html = open(p("src", "plan_template.html")).read().replace("/*__DATA__*/", data)
open(p("index.html"), "w").write(html)
print(f"index.html written ({len(html) // 1024} KB)")
