#!/usr/bin/env python3
"""Edit the text inside an existing PDF through the PDF Edit API. Standard library only.

    pdfedit.py edit    <file-or-url> '<edits json>' [--options '<json>'] [--out path] [--json]
    pdfedit.py find    <file-or-url> [query] [--pages 1,2] [--mode exact|icase|word|regex]
    pdfedit.py preview <file-or-url> [--page N] [--out page.png]
    pdfedit.py job     <job_id>

Environment: PDFEDIT_API_KEY (optional; without it the keyless tier is used: 20 pages a
day per IP, outputs marked SAMPLE), PDFEDIT_BASE_URL (default https://api.niubai.vip).

Exit codes: 0 every edit applied; 2 some edit unmatched or rolled back (JSON printed);
1 API or network error (the API's error code and hint printed).
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = os.environ.get("PDFEDIT_BASE_URL", "https://api.niubai.vip").rstrip("/")
KEY = os.environ.get("PDFEDIT_API_KEY", "").strip()
UA = "pdfedit-skill/1.0"


def _headers(extra=None):
    h = {"User-Agent": UA}
    if KEY:
        h["Authorization"] = f"Bearer {KEY}"
    h.update(extra or {})
    return h


def _request(method, url, data=None, headers=None, timeout=300):
    req = urllib.request.Request(url, data=data, method=method, headers=_headers(headers))
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.headers, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()


def _api(method, path, body=None, timeout=300):
    data = json.dumps(body).encode() if body is not None else None
    status, headers, raw = _request(method, BASE + path, data,
                                    {"Content-Type": "application/json"} if data else None, timeout)
    try:
        doc = json.loads(raw.decode() or "{}")
    except ValueError:
        doc = {"error": {"code": "bad_response", "message": raw[:200].decode(errors="replace")}}
    if status >= 400:
        err = doc.get("error") or {}
        sys.stderr.write(f"error {status} {err.get('code', '')}: {err.get('message', '')}\n")
        if err.get("hint"):
            sys.stderr.write(f"hint: {err['hint']}\n")
        if headers.get("Retry-After"):
            sys.stderr.write(f"retry after {headers['Retry-After']} s\n")
        sys.exit(1)
    return doc


def source_of(ref):
    """`{"url": …}` for a URL, else upload the local file and return `{"file_id": …}`."""
    if ref.startswith(("http://", "https://")):
        return {"url": ref}
    path = os.path.expanduser(ref)
    if not os.path.isfile(path):
        sys.stderr.write(f"no such file: {path}\n")
        sys.exit(1)
    with open(path, "rb") as fh:
        blob = fh.read()
    slot = _api("POST", "/v1/files", {"content_type": "application/pdf", "bytes": len(blob)})
    url = slot["upload_url"]
    if not url.startswith("http"):
        url = BASE + url
    hdrs = dict(slot.get("headers") or {})
    hdrs.setdefault("Content-Type", "application/pdf")
    status, _h, raw = _request("PUT", url, blob, hdrs, timeout=600)
    if status not in (200, 201, 204):
        sys.stderr.write(f"upload failed: HTTP {status} {raw[:200].decode(errors='replace')}\n")
        sys.exit(1)
    return {"file_id": slot["file_id"]}


def wait_job(job_id, every=2.0, limit=900):
    t0 = time.time()
    while True:
        doc = _api("GET", f"/v1/jobs/{job_id}")
        if doc.get("status") not in ("queued", "running"):
            return doc
        if time.time() - t0 > limit:
            sys.stderr.write(f"job {job_id} still {doc.get('status')} after {limit} s; "
                             f"check later with: pdfedit.py job {job_id}\n")
            sys.exit(1)
        time.sleep(every)


def output_path(ref, out):
    if out:
        return out
    if ref.startswith(("http://", "https://")):
        name = os.path.basename(urllib.parse.urlparse(ref).path) or "document.pdf"
    else:
        name = os.path.basename(ref)
    stem, ext = os.path.splitext(name)
    ext = ext or ".pdf"
    folder = "." if ref.startswith(("http://", "https://")) else os.path.dirname(os.path.expanduser(ref)) or "."
    cand = os.path.join(folder, f"{stem}.edited{ext}")
    n = 2
    while os.path.exists(cand):
        cand = os.path.join(folder, f"{stem}.edited.{n}{ext}")
        n += 1
    return os.path.normpath(cand)


def download(url, dest):
    if not url.startswith("http"):
        url = BASE + url
    status, _h, raw = _request("GET", url, timeout=600)
    if status != 200:
        sys.stderr.write(f"download failed: HTTP {status}\n")
        sys.exit(1)
    with open(dest, "wb") as fh:
        fh.write(raw)


def summary(doc, out=None):
    changes = doc.get("changes") or []
    parts = []
    by_op = {}
    for c in changes:
        by_op.setdefault(c.get("op", "replace"), []).append(c.get("page"))
    verbs = {"replace": "Replaced", "delete": "Deleted", "redact": "Redacted", "insert": "Inserted", "form": "Filled"}
    for op, pages in by_op.items():
        ps = sorted({p for p in pages if p})
        where = f" on page{'s' if len(ps) > 1 else ''} {', '.join(map(str, ps))}" if ps else ""
        parts.append(f"{verbs.get(op, op)} {len(pages)} occurrence{'s' if len(pages) != 1 else ''}{where}.")
    if not changes:
        parts.append(f"Nothing changed (status {doc.get('status')}).")
    um = doc.get("unmatched") or []
    if um:
        sugg = next((s.get("text") for u in um for s in (u.get("suggestions") or []) if s.get("text")), None)
        parts.append(f"{len(um)} edit{'s' if len(um) != 1 else ''} unmatched" + (f" (did you mean '{sugg}'?)." if sugg else "."))
    fl = doc.get("failed") or []
    if fl:
        parts.append(f"{len(fl)} edit{'s' if len(fl) != 1 else ''} rolled back ({fl[0].get('reason')}: {fl[0].get('hint', '')}).")
    w = doc.get("warnings") or []
    if "approx_font_used" in w:
        parts.append("A look-alike font was used for the changed text: check the preview.")
    other = [x for x in w if x != "approx_font_used"]
    if other:
        parts.append("Warnings: " + ", ".join(other) + ".")
    fonts = sorted({c.get("font_source", "") for c in changes} - {""})
    if fonts:
        parts.append("Font: " + ", ".join(fonts) + ".")
    if out:
        parts.append(f"Output: {out}.")
    u = doc.get("usage") or {}
    if "remaining" in u:
        parts.append(f"Pages left: {u['remaining']}.")
    return " ".join(parts)


def cmd_edit(a):
    try:
        edits = json.loads(a.edits)
    except ValueError as e:
        sys.stderr.write(f"edits is not valid JSON: {e}\n")
        sys.exit(1)
    if isinstance(edits, dict):
        edits = [edits]
    options = json.loads(a.options) if a.options else {}
    body = {"source": source_of(a.source), "edits": edits, "options": options}
    doc = _api("POST", "/v1/edit", body)
    if doc.get("status") in ("queued", "running") and doc.get("job_id"):
        doc = wait_job(doc["job_id"])
    out = None
    if (doc.get("output") or {}).get("url") and not options.get("dry_run"):
        out = output_path(a.source, a.out)
        download(doc["output"]["url"], out)
    print(summary(doc, out))
    if a.json or doc.get("status") != "done":
        print(json.dumps(doc, indent=2, ensure_ascii=False))
    sys.exit(0 if doc.get("status") == "done" else 2)


def cmd_find(a):
    body = {"source": source_of(a.source), "limit": a.limit}
    if a.query:
        body["query"] = a.query
        body["match"] = {"mode": a.mode}
    if a.pages:
        body["pages"] = [int(p) for p in a.pages.split(",")]
    doc = _api("POST", "/v1/text", body)
    spans = doc.get("spans") or []
    print(f"{doc.get('page_count', '?')} pages, {len(spans)} span{'s' if len(spans) != 1 else ''}"
          + (f" matching {a.query!r}" if a.query else "") + ("; more available (use --limit)" if doc.get("next_cursor") else ""))
    for s in spans:
        bbox = ",".join(f"{v:.0f}" for v in (s.get("bbox") or []))
        print(f"p{s.get('page')} {s.get('span_id')} [{s.get('font')} {s.get('size')}] ({bbox}) {s.get('text')!r}")
    if doc.get("fields"):
        print("form fields: " + ", ".join(f"{f.get('name')}={f.get('value')!r}" for f in doc["fields"]))


def cmd_preview(a):
    body = {"source": source_of(a.source), "page": a.page, "scale": a.scale}
    status, headers, raw = _request("POST", BASE + "/v1/preview", json.dumps(body).encode(),
                                    {"Content-Type": "application/json", "Accept": "image/png"})
    if status >= 400:
        try:
            err = json.loads(raw.decode()).get("error") or {}
        except ValueError:
            err = {"message": raw[:200].decode(errors="replace")}
        sys.stderr.write(f"error {status} {err.get('code', '')}: {err.get('message', '')}\n")
        sys.exit(1)
    ctype = headers.get("Content-Type", "")
    if ctype.startswith("image/"):
        out = a.out or f"page{a.page}.png"
        with open(out, "wb") as fh:
            fh.write(raw)
        print(f"wrote {out} ({len(raw)} bytes)")
    else:
        doc = json.loads(raw.decode())
        url = doc.get("url") or doc.get("preview_url")
        if url:
            out = a.out or f"page{a.page}.png"
            download(url, out)
            print(f"wrote {out}")
        else:
            print(json.dumps(doc, indent=2))


def cmd_job(a):
    doc = _api("GET", f"/v1/jobs/{a.job_id}")
    print(summary(doc))
    print(json.dumps(doc, indent=2, ensure_ascii=False))
    sys.exit(0 if doc.get("status") == "done" else 2)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    e = sub.add_parser("edit", help="apply edits and download the result")
    e.add_argument("source", help="local PDF path or https URL")
    e.add_argument("edits", help="JSON array of edits (or one edit object)")
    e.add_argument("--options", help="JSON object of request options (dry_run, ocr, font, atomic, ...)")
    e.add_argument("--out", help="where to write the edited PDF (default: <name>.edited.pdf next to the input)")
    e.add_argument("--json", action="store_true", help="print the full JSON result even on success")
    e.set_defaults(fn=cmd_edit)
    f = sub.add_parser("find", help="list text spans, optionally matching a query")
    f.add_argument("source")
    f.add_argument("query", nargs="?")
    f.add_argument("--pages", help="comma-separated page numbers, 1-based")
    f.add_argument("--mode", default="exact", choices=["exact", "icase", "word", "regex"])
    f.add_argument("--limit", type=int, default=200)
    f.set_defaults(fn=cmd_find)
    v = sub.add_parser("preview", help="render one page as PNG")
    v.add_argument("source")
    v.add_argument("--page", type=int, default=1)
    v.add_argument("--scale", type=int, default=2)
    v.add_argument("--out")
    v.set_defaults(fn=cmd_preview)
    j = sub.add_parser("job", help="fetch the result of a queued job")
    j.add_argument("job_id")
    j.set_defaults(fn=cmd_job)
    a = p.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main()
