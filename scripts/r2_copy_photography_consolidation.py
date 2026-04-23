#!/usr/bin/env python3
"""
Server-side copy within R2: mirror photography media to canonical key prefixes
after consolidating MDX paths:

  photography/asptrophotography/gothenburgs-moon/     → photography/astrophotography/gothenburgs-moon/
  photography/astrophotographer/perseids-meteor-shower/ → photography/astrophotography/perseids-meteor-shower/

Same R2 creds as r2_upload.py. Skips if destination key already exists unless --no-skip-existing.

  python3 scripts/r2_copy_photography_consolidation.py --dry-run
  python3 scripts/r2_copy_photography_consolidation.py
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

try:
    import boto3
    from botocore.client import Config
    from botocore.exceptions import ClientError
except ImportError:
    print("Run: pip install -r scripts/requirements-r2.txt", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # type: ignore


def load_env() -> None:
    if load_dotenv is None:
        return
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
        print("Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY", file=sys.stderr)
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


def key_exists(s3, bucket: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") in ("404", "NotFound", "NoSuchKey"):
            return False
        raise


def run_copy(
    s3,
    bucket: str,
    src_prefix: str,
    dest_prefix: str,
    dry_run: bool,
    skip_existing: bool,
) -> tuple[int, int, int]:
    n_ok = n_skipped = n_fail = 0
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=src_prefix):
        for obj in page.get("Contents", []):
            src = obj["Key"]
            if not src.startswith(src_prefix):
                continue
            rest = src[len(src_prefix) :]
            if rest.startswith("/"):
                rest = rest[1:]
            if not rest:
                continue
            dest = dest_prefix + rest if dest_prefix.endswith("/") else f"{dest_prefix}/{rest}"
            if skip_existing and key_exists(s3, bucket, dest):
                n_skipped += 1
                print(f"[skip] {dest} (exists)", flush=True)
                continue
            if dry_run:
                print(f"[dry] {src}  →  {dest}", flush=True)
                n_ok += 1
                continue
            try:
                s3.copy_object(
                    Bucket=bucket,
                    Key=dest,
                    CopySource={"Bucket": bucket, "Key": src},
                )
                print(f"[ok] {src}  →  {dest}", flush=True)
                n_ok += 1
            except ClientError as e:
                n_fail += 1
                print(f"[err] {src} → {dest}: {e}", file=sys.stderr, flush=True)
    return n_ok, n_skipped, n_fail


PAIRS: list[tuple[str, str]] = [
    (
        "photography/asptrophotography/gothenburgs-moon/",
        "photography/astrophotography/gothenburgs-moon/",
    ),
    (
        "photography/astrophotographer/perseids-meteor-shower/",
        "photography/astrophotography/perseids-meteor-shower/",
    ),
]


def main() -> int:
    load_env()
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--no-skip-existing",
        action="store_true",
        help="Overwrite existing destination keys",
    )
    args = parser.parse_args()

    bucket = os.environ.get("R2_BUCKET_NAME", "togstrek-media").strip()
    s3 = r2_client()
    skip = not args.no_skip_existing

    total_ok = total_skip = total_fail = 0
    for src, dest in PAIRS:
        label = f"{src} → {dest}"
        if args.dry_run:
            a, s, f = run_copy(s3, bucket, src, dest, True, False)
            print(f"[dry-run] {label} ok={a}", flush=True)
            total_ok += a
            total_fail += f
            continue
        a, s, f = run_copy(s3, bucket, src, dest, False, skip)
        print(f"{label}: ok={a} skip={s} err={f}", flush=True)
        total_ok += a
        total_skip += s
        total_fail += f

    return 0 if total_fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
