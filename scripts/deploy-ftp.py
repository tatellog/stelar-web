#!/usr/bin/env python3
"""Deploy the static export to the cPanel host (stelar-app.com).

Usage:
    npm run build
    FTP_USER="admin@stelar-app.com" FTP_PASS="..." python3 scripts/deploy-ftp.py

Uploads ./out to public_html over FTPS with auto-reconnect. The host's
own .htaccess is preserved: our cache/compression block is appended to
it (idempotent — the marker line is replaced, never duplicated).
"""

from ftplib import FTP_TLS, error_perm
import io
import os
import sys
import time

HOST = "ftp.stelar-app.com"
REMOTE_ROOT = "public_html"
LOCAL = os.path.join(os.path.dirname(__file__), "..", "out")
MARKER = b"# -- Stelar landing (cache/compresion) --"

# next build regenerates ./out from scratch, so our .htaccess block lives
# here, not in the build output
HTACCESS_BLOCK = b"""AddDefaultCharset utf-8
AddType image/webp .webp

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/html "access plus 10 minutes"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
"""

USER = os.environ.get("FTP_USER")
PASS = os.environ.get("FTP_PASS")
if not USER or not PASS:
    sys.exit("define FTP_USER y FTP_PASS en el entorno")


def connect() -> FTP_TLS:
    ftp = FTP_TLS(timeout=30)
    ftp.connect(HOST, 21)
    ftp.auth()
    ftp.prot_p()
    ftp.login(USER, PASS)
    ftp.cwd(REMOTE_ROOT)
    return ftp


def merge_htaccess(ftp: FTP_TLS) -> None:
    existing = io.BytesIO()
    try:
        ftp.retrbinary("RETR .htaccess", existing.write)
    except error_perm:
        pass
    host_part = existing.getvalue().split(MARKER)[0].rstrip()
    merged = host_part + b"\n\n" + MARKER + b"\n" + HTACCESS_BLOCK
    ftp.storbinary("STOR .htaccess", io.BytesIO(merged))
    print(".htaccess fusionado")


def main() -> None:
    ftp = connect()
    merge_htaccess(ftp)
    made_dirs: set[str] = set()
    count = fails = 0

    for root, _dirs, files in os.walk(LOCAL):
        rel = os.path.relpath(root, LOCAL)
        if rel != ".":
            remote_dir = rel.replace(os.sep, "/")
            if remote_dir not in made_dirs:
                try:
                    ftp.mkd(remote_dir)
                except error_perm:
                    pass
                made_dirs.add(remote_dir)
        for name in files:
            if rel == "." and name == ".htaccess":
                continue  # merged above
            local_path = os.path.join(root, name)
            remote_path = name if rel == "." else f"{rel.replace(os.sep, '/')}/{name}"
            for attempt in range(4):
                try:
                    with open(local_path, "rb") as f:
                        ftp.storbinary(f"STOR {remote_path}", f)
                    break
                except Exception:
                    # el canal de control se desincroniza a veces: conexión fresca
                    try:
                        ftp.close()
                    except Exception:
                        pass
                    time.sleep(1)
                    ftp = connect()
            else:
                fails += 1
                print("FALLÓ", remote_path)
            count += 1
            if count % 40 == 0:
                print(f"{count} archivos...")

    print(f"subidos {count - fails}/{count}")
    ftp.quit()
    if fails:
        sys.exit(1)


if __name__ == "__main__":
    main()
