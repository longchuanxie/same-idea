#!/usr/bin/env python3
"""Validate an anniversary backup JSON file against v1 schema."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from jsonschema import Draft202012Validator


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "backup",
        type=Path,
        nargs="?",
        default=Path("shared/backup/examples/anniversary-backup-v1.example.json"),
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=Path("shared/backup/anniversary-backup-v1.schema.json"),
    )
    args = parser.parse_args()

    schema = json.loads(args.schema.read_text(encoding="utf-8"))
    backup = json.loads(args.backup.read_text(encoding="utf-8"))
    errors = sorted(
        Draft202012Validator(schema).iter_errors(backup),
        key=lambda error: list(error.path),
    )
    if errors:
        for error in errors[:50]:
            path = "/".join(map(str, error.path))
            print(f"ERROR {path}: {error.message}")
        return 1
    print(f"OK: {args.backup}")
    print(f"events={len(backup.get('events', []))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

