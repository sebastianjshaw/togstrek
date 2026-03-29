#!/usr/bin/env python3
"""
Server-side COPY within R2 for North America media keys so URLs match current MDX
without re-uploading bytes from your laptop.

Rewrites under prefix `north-america/`:
  - First path segment `usa` → `united-states-of-america`
  - `california-*` folder → `california/*`
  - `texas-dallas` → `texas/dallas`
  - `ny-new-york` → `new-york/new-york` (state slug `new-york`, not `ny`)
  - `new-jersey-scotch-plains` → `new-jersey/scotch-plains`
  - `massachusetts-boston` → `massachusetts/boston`

Setup: same env as r2_upload.py (R2_ACCOUNT_ID, R2_BUCKET_NAME, keys).

Usage:
  python3 scripts/r2_copy_north_america_keys.py --dry-run
  python3 scripts/r2_copy_north_america_keys.py
  python3 scripts/r2_copy_north_america_keys.py --skip-existing

Optional: delete source keys after successful copy (use only when you are sure):
  python3 scripts/r2_copy_north_america_keys.py --delete-sources
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


def rekey_dir_segments(dirs: list[str]) -> list[str]:
    if not dirs:
        return []
    out: list[str] = []
    country = dirs[0]
    if country == "usa":
        country = "united-states-of-america"
    out.append(country)
    i = 1
    while i < len(dirs):
        d = dirs[i]
        if d == "ny":
            out.append("new-york")
            i += 1
            continue
        if d.startswith("california-") and d != "california":
            out.extend(["california", d[len("california-") :]])
            i += 1
            continue
        if d == "texas-dallas":
            out.extend(["texas", "dallas"])
            i += 1
            continue
        if d == "ny-new-york":
            out.extend(["new-york", "new-york"])
            i += 1
            continue
        if d == "new-jersey-scotch-plains":
            out.extend(["new-jersey", "scotch-plains"])
            i += 1
            continue
        if d == "massachusetts-boston":
            out.extend(["massachusetts", "boston"])
            i += 1
            continue
        out.append(d)
        i += 1
    return out


def rekey_north_america_key(key: str, prefix: str) -> str | None:
    """Return new full key, or None if unchanged / not under prefix."""
    p = prefix.rstrip("/") + "/"
    if not key.startswith(p):
        return None
    rel = key[len(p) :]
    if not rel or rel.endswith("/"):
        return None
    parts = rel.split("/")
    filename = parts[-1]
    dirs = parts[:-1]
    new_dirs = rekey_dir_segments(dirs)
    new_rel = "/".join(new_dirs + [filename])
    new_key = p + new_rel
    return new_key if new_key != key else None


def head_exists(s3, bucket: str, key: str) -> bool:
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


def main() -> None:
    load_env()
    parser = argparse.ArgumentParser(description="R2 COPY to rekey north-america/ objects.")
    parser.add_argument(
        "--prefix",
        default="north-america/",
        help="Key prefix to scan (default: north-america/)",
    )
    parser.add_argument(
        "--bucket",
        default=os.environ.get("R2_BUCKET_NAME", "").strip(),
        help="Or set R2_BUCKET_NAME",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip COPY when destination key already exists",
    )
    parser.add_argument(
        "--delete-sources",
        action="store_true",
        help="Delete old key after successful copy (irreversible)",
    )
    args = parser.parse_args()

    bucket = args.bucket
    if not bucket:
        print("Set --bucket or R2_BUCKET_NAME", file=sys.stderr)
        sys.exit(1)

    prefix = args.prefix.strip()
    if not prefix.endswith("/"):
        prefix += "/"

    client = r2_client()

    to_copy: list[tuple[str, str]] = []
    token = None
    while True:
        kwargs = {"Bucket": bucket, "Prefix": prefix, "MaxKeys": 1000}
        if token:
            kwargs["ContinuationToken"] = token
        resp = client.list_objects_v2(**kwargs)
        for obj in resp.get("Contents", []):
            key = obj["Key"]
            new_key = rekey_north_america_key(key, prefix)
            if new_key:
                to_copy.append((key, new_key))
        if not resp.get("IsTruncated"):
            break
        token = resp.get("NextContinuationToken")

    if not to_copy:
        print(f"No keys need rekeying under {prefix!r} (or bucket empty).")
        return

    copied = 0
    skipped = 0
    deleted = 0
    errors = 0

    for old_key, new_key in sorted(to_copy, key=lambda x: x[0]):
        if args.dry_run:
            print(f"[dry-run] COPY {old_key!r} -> {new_key!r}")
            copied += 1
            continue

        try:
            if args.skip_existing and head_exists(client, bucket, new_key):
                print(f"[skip exists] {new_key}")
                skipped += 1
                continue
            client.copy_object(
                Bucket=bucket,
                Key=new_key,
                CopySource={"Bucket": bucket, "Key": old_key},
            )
            print(f"[ok] {old_key} -> {new_key}")
            copied += 1
            if args.delete_sources:
                client.delete_object(Bucket=bucket, Key=old_key)
                print(f"    [del] {old_key}")
                deleted += 1
        except ClientError as e:
            print(f"[err] {old_key}: {e}", file=sys.stderr)
            errors += 1

    print(
        f"\nDone. copy={copied} skip={skipped} delete={deleted} errors={errors} dry_run={args.dry_run}",
        file=sys.stderr if errors else sys.stdout,
    )
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
