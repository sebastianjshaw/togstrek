#!/usr/bin/env python3
"""
Server-side COPY within R2: rewrite object keys to Unicode NFC per path segment.

Use when media was uploaded from macOS (APFS often uses NFD for accents) so keys
in the bucket do not match `https://media.togstrek.com/...` paths generated from
NFC (MDX, browser). This repo’s TypeScript migration uses `String.normalize("NFC")`.

For each object under --prefix, if the NFC-normalized key differs from the
current key, copy to the new key. Optional: delete the old key after copy.

New uploads: `scripts/r2_upload.py` already NFC-normalizes path segments.

Setup: same env as r2_upload.py (R2_ACCOUNT_ID, R2_BUCKET_NAME, keys).

Usage:
  python3 scripts/r2_copy_keys_to_nfc.py --prefix europe/ --dry-run
  python3 scripts/r2_copy_keys_to_nfc.py --prefix "" --dry-run
  python3 scripts/r2_copy_keys_to_nfc.py --prefix south-america/
  python3 scripts/r2_copy_keys_to_nfc.py --prefix "" --delete-sources
"""

from __future__ import annotations

import argparse
import os
import sys
import unicodedata
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


def nfc_object_key(key: str) -> str:
    if not key:
        return key
    return "/".join(unicodedata.normalize("NFC", part) for part in key.split("/"))


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
    parser = argparse.ArgumentParser(
        description="R2 COPY: rekey objects to Unicode NFC (path segments).",
    )
    parser.add_argument(
        "--prefix",
        default="",
        help="Only list keys with this prefix (e.g. europe/ or south-america/). "
        "Empty string = entire bucket (use with care).",
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
        help="If destination key already exists, skip COPY (avoids overwrite)",
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

    list_prefix = args.prefix.strip()
    client = r2_client()

    to_copy: list[tuple[str, str]] = []
    token = None
    while True:
        kwargs: dict = {"Bucket": bucket, "MaxKeys": 1000}
        if list_prefix:
            kwargs["Prefix"] = list_prefix
        if token:
            kwargs["ContinuationToken"] = token
        resp = client.list_objects_v2(**kwargs)
        for obj in resp.get("Contents", []):
            key = obj["Key"]
            if key.endswith("/"):
                continue
            nkey = nfc_object_key(key)
            if nkey != key:
                to_copy.append((key, nkey))
        if not resp.get("IsTruncated"):
            break
        token = resp.get("NextContinuationToken")

    if not to_copy:
        print(
            f"No keys need NFC rekeying"
            f"{f' under {list_prefix!r}' if list_prefix else ''} (or bucket empty).",
        )
        return

    copied = 0
    skipped = 0
    deleted = 0
    errors = 0
    conflict = 0

    for old_key, new_key in sorted(to_copy, key=lambda x: x[0]):
        if args.dry_run:
            print(f"[dry-run] COPY {old_key!r} -> {new_key!r}")
            copied += 1
            continue

        try:
            if args.skip_existing and head_exists(client, bucket, new_key):
                print(f"[skip exists] {new_key!r} (source {old_key!r})")
                skipped += 1
                continue
            if not args.skip_existing and head_exists(client, bucket, new_key):
                print(
                    f"[conflict] destination already exists, skipping: {new_key!r} <- {old_key!r}",
                    file=sys.stderr,
                )
                conflict += 1
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
        f"\nDone. copy={copied} skip={skipped} conflict={conflict} delete={deleted} "
        f"errors={errors} dry_run={args.dry_run}",
        file=sys.stderr if errors else sys.stdout,
    )
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
