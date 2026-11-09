#!/usr/bin/env python3
"""Build an encrypted single-site offline snapshot (store-and-forward demo).

  python build_site.py E1 "passphrase" [out.html]

Filters data/plan_data.json to one site, gzips it, encrypts with AES-256-GCM using a key derived
from the passphrase (PBKDF2-SHA256), and embeds it in the page with an unencrypted manifest
(site, version, as-of) that is bound to the ciphertext as AES-GCM associated data.
"""
import base64, datetime, gzip, json, os, sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = os.path.dirname(os.path.abspath(__file__))
p = lambda *a: os.path.join(ROOT, *a)
site, passphrase = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else p(f"nimbus_{site}_offline.html")
ITER = int(os.environ.get("NIMBUS_KDF_ITER", 310_000))

d = json.load(open(p("data", "plan_data.json"), encoding="utf-8"))
mine = lambda pid: pid.startswith(site + "-")
others = {pid[:2] for pid in d["positions"]} - {site}
d["positions"] = {k: v for k, v in d["positions"].items() if mine(k)}
d["findings"] = [f for f in d["findings"] if mine(f["id"])]
d["portfolio"] = [f for f in d["portfolio"] if not any(o in f["title"] for o in others)]
d["feeds"] = [f for f in d["feeds"] if mine(f[0])]
d["names"] = {k: v for k, v in d["names"].items() if k.startswith(site)}
for part in ("bd", "rec"):
    d[part] = {m: {k: v for k, v in rows.items() if mine(k)} for m, rows in d[part].items()}
sd = d["sd"]
def touches(a):   # asset's history involves this site (a position here or this site's storeroom)
    return any(x is not None and str(sd[x]).startswith(site) for mv in a["mv"] for x in (mv[2], mv[3]))
d["lineage"] = {k: v for k, v in d["lineage"].items() if touches(v)}
d["stores"] = {k: v for k, v in d["stores"].items() if k.startswith(site) or v.get("site") is None}

built = datetime.date.today().isoformat()
manifest = dict(site=site, ver=f"{built.replace('-', '.')}-1", asof=d.get("asof", "2026-10-31"), built=built,
                siteName=d["names"].get(site, site))
aad = json.dumps(manifest, sort_keys=True).encode()
salt, iv = os.urandom(16), os.urandom(12)
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(passphrase.encode())
ct = AESGCM(key).encrypt(iv, gzip.compress(json.dumps(d, separators=(",", ":")).encode(), 9), aad)

b = lambda x: base64.b64encode(x).decode()
attrs = (f' data-enc="aes-256-gcm" data-salt="{b(salt)}" data-iv="{b(iv)}" data-iter="{ITER}" data-aad="{b(aad)}"'
         + "".join(f' data-{k.lower() if k != "siteName" else "site-name"}="{v}"' for k, v in manifest.items()))
html = open(p("src", "plan_template.html"), encoding="utf-8").read().replace("/*__DATAZ_ATTRS__*/", attrs).replace("/*__DATAZ__*/", b(ct))
html = html.replace("<title>Nimbus Site Floor Plan</title>", f"<title>Nimbus {site} Offline</title>")
open(out, "w", encoding="utf-8").write(html)
print(f"{out}: {len(html) // 1024} KB · {len(d['positions'])} positions · {len(d['lineage'])} assets · encrypted")
