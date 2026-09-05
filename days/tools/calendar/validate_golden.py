#!/usr/bin/env python3
"""Validate daily golden mappings and round-trip coverage."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import date, timedelta
from pathlib import Path


EXPECTED_DAYS = (date(2100, 12, 31) - date(1901, 1, 1)).days + 1


def canonical_hash(days: list[dict]) -> str:
    encoded = json.dumps(
        days, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def validate(payload: dict) -> list[str]:
    errors: list[str] = []
    if payload.get("version") != "calendar-golden-1.0.0":
        errors.append("version must be calendar-golden-1.0.0")
    if payload.get("range") != {"start": "1901-01-01", "end": "2100-12-31"}:
        errors.append("range must be 1901-01-01..2100-12-31")

    days = payload.get("days")
    if not isinstance(days, list) or len(days) != EXPECTED_DAYS:
        errors.append(f"days must contain exactly {EXPECTED_DAYS} entries")
        return errors

    expected_hash = payload.get("checksum", {}).get("dataSha256")
    actual_hash = canonical_hash(days)
    if expected_hash != actual_hash:
        errors.append(f"checksum mismatch: expected {expected_hash}, got {actual_hash}")

    expected_date = date(1901, 1, 1)
    seen_lunar_keys: set[tuple[int, int, int, bool]] = set()
    for row in days:
        gregorian = date.fromisoformat(row["gregorian"])
        if gregorian != expected_date:
            errors.append(
                f"expected gregorian {expected_date.isoformat()}, got {gregorian}"
            )
            break
        expected_date += timedelta(days=1)

        lunar_day = row.get("lunarDay")
        month_days = row.get("lunarMonthDays")
        if month_days not in (29, 30):
            errors.append(f"{gregorian}: invalid lunarMonthDays {month_days}")
        if not isinstance(lunar_day, int) or not 1 <= lunar_day <= month_days:
            errors.append(f"{gregorian}: invalid lunarDay {lunar_day}")

        key = (
            row["lunarYear"],
            row["lunarMonth"],
            row["lunarDay"],
            row["isLeapMonth"],
        )
        if key in seen_lunar_keys:
            errors.append(f"{gregorian}: duplicate lunar key {key}")
        seen_lunar_keys.add(key)

        if row["lunarDay"] == 1 and "初一" not in row["lunarDisplay"]:
            errors.append(f"{gregorian}: display missing 初一")
        if row["isLeapMonth"] and "闰" not in row["lunarDisplay"]:
            errors.append(f"{gregorian}: leap display missing 闰")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "path",
        type=Path,
        nargs="?",
        default=Path("shared/calendar/calendar-golden-1901-2100.json"),
    )
    args = parser.parse_args()

    payload = json.loads(args.path.read_text(encoding="utf-8"))
    errors = validate(payload)
    if errors:
        for error in errors[:50]:
            print(f"ERROR: {error}")
        return 1
    print(f"OK: {args.path}")
    print(f"days={len(payload['days'])}")
    print(f"dataSha256={payload['checksum']['dataSha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

