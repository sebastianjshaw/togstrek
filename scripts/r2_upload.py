#!/usr/bin/env python3
"""
Bulk-upload a local directory to Cloudflare R2 (S3-compatible API).

Setup (see Cloudflare dashboard → R2 → bucket + API token):
  pip install -r scripts/requirements-r2.txt
  export R2_ACCOUNT_ID=...
  export R2_BUCKET_NAME=...
  export R2_ACCESS_KEY_ID=...
  export R2_SECRET_ACCESS_KEY=...

Optional: copy the same vars into `.env` in the repo root (loaded automatically).

Usage:
  python scripts/r2_upload.py --source /path/to/local/files --prefix my/prefix/
  python scripts/r2_upload.py --source ./dist --prefix media/ --dry-run
  python scripts/r2_upload.py --source ./photos --skip-existing

R2 has no real “folders”; keys are paths. This tool uploads every file under
--source using relative paths as object keys (under --prefix).

If local filenames contain literal “%” (e.g. “Sen%CC%83ora” copied from a URL),
the S3 key will also contain literal percent signs, which will NOT match browser
requests that use percent-encoding for UTF-8 (e.g. %CC%83 → Unicode). Before
upload, rename those files so each path segment matches the decoded URL path
(e.g. urllib.parse.unquote in Python, or decodeURIComponent in JS), or the CDN
will 404 while the site requests URLs like …/Sen%CC%83ora….
"""

from __future__ import annotations

import argparse
import mimetypes
import os
import sys
from pathlib import Path

try:
    import boto3
    from botocore.client import Config
    from botocore.exceptions import ClientError
except ImportError:
    print("Missing dependencies. Run: pip install -r scripts/requirements-r2.txt", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # type: ignore


def load_env() -> None:
    if load_dotenv is None:
        return
    # Repo root .env then .env.local (Next-style)
    here = Path(__file__).resolve().parent
    root = here.parent
    for name in (".env", ".env.local"):
        p = root / name
        if p.is_file():
            load_dotenv(p)


def r2_client():
    account_id = os.environ.get("R2_ACCOUNT_ID", "").strip()
    access_key = os.environ.get("R2_ACCESS_KEY_ID", "").strip()
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY", "").strip()
    if not account_id or not access_key or not secret_key:
        print(
            "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in the environment or .env",
            file=sys.stderr,
        )
        sys.exit(1)

    endpoint = os.environ.get(
        "R2_ENDPOINT_URL",
        f"https://{account_id}.r2.cloudflarestorage.com",
    ).strip()

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
        region_name=os.environ.get("R2_REGION", "us-east-1"),
    )


def normalize_prefix(prefix: str) -> str:
    p = prefix.strip().replace("\\", "/")
    while p.startswith("/"):
        p = p[1:]
    if p and not p.endswith("/"):
        p += "/"
    return p


def object_key_for_file(source_root: Path, file_path: Path, prefix: str) -> str:
    rel = file_path.relative_to(source_root).as_posix()
    return f"{prefix}{rel}" if prefix else rel


def should_skip_path(rel_posix: str, exclude_prefixes: tuple[str, ...]) -> bool:
    parts = rel_posix.split("/")
    for part in parts:
        if part.startswith(".") and part not in (".", ".."):
            return True
    if rel_posix == ".DS_Store" or rel_posix.endswith("/.DS_Store"):
        return True
    for ex in exclude_prefixes:
        ex = ex.strip().strip("/")
        if not ex:
            continue
        if rel_posix == ex or rel_posix.startswith(ex + "/"):
            return True
    return False


def head_exists(s3, bucket: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


def guess_content_type(path: Path) -> str | None:
    mt, _ = mimetypes.guess_type(path.name)
    return mt


def main() -> None:
    load_env()

    parser = argparse.ArgumentParser(
        description="Upload a local folder to Cloudflare R2 (recursive).",
    )
    parser.add_argument(
        "--source",
        required=True,
        type=Path,
        help="Local directory to upload (files only; directory structure becomes key prefixes).",
    )
    parser.add_argument(
        "--prefix",
        default="",
        help="Key prefix inside the bucket (e.g. media/hiking/). Created implicitly per object.",
    )
    parser.add_argument(
        "--bucket",
        default=os.environ.get("R2_BUCKET_NAME", "").strip(),
        help="R2 bucket name (or set R2_BUCKET_NAME).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions only; no uploads.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip upload when an object with the same key already exists (HEAD check).",
    )
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        metavar="PREFIX",
        help="Relative path prefix to skip (repeatable). Example: --exclude node_modules --exclude .git",
    )
    args = parser.parse_args()

    bucket = args.bucket
    if not bucket:
        print("Set --bucket or R2_BUCKET_NAME.", file=sys.stderr)
        sys.exit(1)
    if bucket.startswith("http") or "cloudflare.com" in bucket or "/" in bucket:
        print(
            "R2_BUCKET_NAME must be the bucket name only (e.g. togstrek-media), not a dashboard URL.",
            file=sys.stderr,
        )
        sys.exit(1)

    source = args.source.resolve()
    if not source.is_dir():
        print(f"--source is not a directory: {source}", file=sys.stderr)
        sys.exit(1)

    prefix = normalize_prefix(args.prefix)
    exclude = tuple(args.exclude)

    files: list[Path] = []
    for p in sorted(source.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(source).as_posix()
        if should_skip_path(rel, exclude):
            continue
        files.append(p)

    if not files:
        print("No files to upload (after filters).")
        return

    s3 = None if args.dry_run else r2_client()

    uploaded = 0
    skipped = 0
    errors = 0

    for path in sorted(files):
        key = object_key_for_file(source, path, prefix)
        size = path.stat().st_size
        ct = guess_content_type(path)

        if args.dry_run:
            print(f"[dry-run] PUT {key} ({size} bytes) <- {path}")
            uploaded += 1
            continue

        assert s3 is not None
        try:
            if args.skip_existing and head_exists(s3, bucket, key):
                print(f"[skip] exists {key}")
                skipped += 1
                continue

            extra: dict = {}
            if ct:
                extra["ContentType"] = ct

            s3.upload_file(
                str(path),
                bucket,
                key,
                ExtraArgs=extra if extra else {},
            )
            print(f"[ok] {key} ({size} bytes)")
            uploaded += 1
        except ClientError as e:
            print(f"[err] {key}: {e}", file=sys.stderr)
            errors += 1

    print(
        f"\nDone. uploaded={uploaded} skipped={skipped} errors={errors} bucket={bucket!r} prefix={prefix!r}",
        file=sys.stderr if errors else sys.stdout,
    )
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
