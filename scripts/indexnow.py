#!/usr/bin/env python3
"""Tell IndexNow (Bing, Yandex, Seznam...) which azzistudios.com pages changed.

Usage:
  python3 scripts/indexnow.py --all              # every URL in sitemap.xml
  python3 scripts/indexnow.py <before> <after>   # .html files changed between two commits

Only URLs listed in sitemap.xml are sent, so 404.html, the retired
vm-window-display page and other noindexed pages never go out.
The key is public by design: it is served at /<key>.txt.
"""
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request

HOST = "azzistudios.com"
KEY = "9a89c593eb356f62d5e2d71eca7552d8"
ENDPOINT = "https://api.indexnow.org/indexnow"


def sitemap_urls():
    with open("sitemap.xml", encoding="utf-8") as f:
        return re.findall(r"<loc>(https://azzistudios\.com/[^<]*)</loc>", f.read())


def url_for(path):
    # cleanUrls: index.html -> /, about.html -> /about
    name = path[:-len(".html")]
    return f"https://{HOST}/" + ("" if name == "index" else name)


def changed_urls(before, after):
    out = subprocess.run(
        ["git", "diff", "--name-only", before, after, "--", "*.html"],
        capture_output=True, text=True, check=True,
    ).stdout.split()
    listed = set(sitemap_urls())
    return [u for u in (url_for(p) for p in out if "/" not in p) if u in listed]


def ping(urls):
    body = json.dumps({
        "host": HOST,
        "key": KEY,
        "keyLocation": f"https://{HOST}/{KEY}.txt",
        "urlList": urls,
    }).encode()
    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def main():
    if sys.argv[1:] == ["--all"]:
        urls = sitemap_urls()
    elif len(sys.argv) == 3:
        urls = changed_urls(sys.argv[1], sys.argv[2])
    else:
        sys.exit(__doc__)
    if not urls:
        print("No sitemap pages changed; nothing to send.")
        return
    status = ping(urls)
    print(f"IndexNow: {len(urls)} URL(s), HTTP {status}")
    for u in urls:
        print("  " + u)
    # 200 = accepted, 202 = accepted, key check pending
    if status not in (200, 202):
        sys.exit(1)


if __name__ == "__main__":
    main()
