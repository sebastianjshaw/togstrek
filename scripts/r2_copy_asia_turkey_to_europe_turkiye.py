#!/usr/bin/env python3
"""
Server-side COPY within R2: `asia/turkey/...` → `europe/turkiye/...`
so MDX URLs match the canonical country hub `/europe/turkiye` (TR).

Same env as r2_upload.py.

Usage:
  .venv-r2/bin/python scripts/r2_copy_asia_turkey_to_europe_turkiye.py --dry-run
  .venv-r2/bin/python scripts/r2_copy_asia_turkey_to_europe_turkiye.py
  .venv-r2/bin/python scripts/r2_copy_asia_turkey_to_europe_turkiye.py --skip-existing
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


SRC_PREFIX = "asia/turkey/"
DST_PREFIX = "europe/turkiye/"


def main() -> None:
    load_env()
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()

    bucket = os.environ.get("R2_BUCKET_NAME", "").strip()
    if not bucket:
        print("Set R2_BUCKET_NAME", file=sys.stderr)
        sys.exit(1)

    client = r2_client()
    paginator = client.get_paginator("list_objects_v2")
    copied = 0
    skipped = 0
    errors = 0

    for page in paginator.paginate(Bucket=bucket, Prefix=SRC_PREFIX):
        for obj in page.get("Contents") or []:
            key = obj["Key"]
            if key.endswith("/"):
                continue
            if not key.startswith(SRC_PREFIX):
                continue
            suffix = key[len(SRC_PREFIX) :]
            dest = DST_PREFIX + suffix
            if args.dry_run:
                print(f"[dry-run] {key} -> {dest}")
                copied += 1
                continue
            if args.skip_existing:
                try:
                    client.head_object(Bucket=bucket, Key=dest)
                    skipped += 1
                    continue
                except ClientError:
                    pass
            try:
                client.copy_object(
                    Bucket=bucket,
                    Key=dest,
                    CopySource={"Bucket": bucket, "Key": key},
                )
                print(f"[ok] {dest}")
                copied += 1
            except Exception as e:  # noqa: BLE001
                print(f"[err] {key}: {e}", file=sys.stderr)
                errors += 1

    print(
        f"Done. copied={copied} skipped_existing={skipped} errors={errors} "
        f"bucket={bucket!r}",
    )
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
