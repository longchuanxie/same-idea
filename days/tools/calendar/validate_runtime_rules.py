#!/usr/bin/env python3
"""Validate calendar-runtime-rules-v1.json without third-party dependencies."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import date
from pathlib import Path


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def canonical_data_hash(payload: dict) -> str:
    relevant = {
        "version": payload["version"],
        "range": payload["range"],
        "years": payload["years"],
    }
    encoded = json.dumps(
        relevant, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def validate(payload: dict) -> list[str]:
    errors: list[str] = []

    if payload.get("version") != "lunar-rules-1.0.0":
        errors.append("version must be lunar-rules-1.0.0")
    if payload.get("range") != {"start": "1901-01-01", "end": "2100-12-31"}:
        errors.append("range must be 1901-01-01..2100-12-31")

    expected_hash = payload.get("checksum", {}).get("dataSha256")
    actual_hash = canonical_data_hash(payload)
    if expected_hash != actual_hash:
        errors.append(f"checksum mismatch: expected {expected_hash}, got {actual_hash}")

    years = payload.get("years")
    if not isinstance(years, list) or len(years) != 200:
        errors.append("years must contain exactly 200 entries")
        return errors

    expected_year = 1901
    previous_start: date | None = None
    for year_rule in years:
        lunar_year = year_rule.get("lunarYear")
        if lunar_year != expected_year:
            errors.append(f"expected lunarYear {expected_year}, got {lunar_year}")
        expected_year += 1

        months = year_rule.get("months")
        if not isinstance(months, list) or len(months) not in (12, 13):
            errors.append(f"lunarYear {lunar_year} must have 12 or 13 months")
            continue

        leap_month = year_rule.get("leapMonth")
        actual_leaps = [m["month"] for m in months if m.get("isLeap") is True]
        if leap_month is None:
            if actual_leaps:
                errors.append(f"lunarYear {lunar_year} has unexpected leap month")
        elif actual_leaps != [leap_month]:
            errors.append(
                f"lunarYear {lunar_year} leapMonth {leap_month} != {actual_leaps}"
            )

        normal_months = [m["month"] for m in months if m.get("isLeap") is False]
        if normal_months != list(range(1, 13)):
            errors.append(f"lunarYear {lunar_year} normal months are not 1..12")

        for month in months:
            days = month.get("days")
            if days not in (29, 30):
                errors.append(f"lunarYear {lunar_year} has invalid days {days}")
            start = parse_date(month["startGregorian"])
            if previous_start and start <= previous_start:
                errors.append(f"month starts not increasing at {start.isoformat()}")
            previous_start = start

        if months[0]["startGregorian"] != year_rule.get("lunarNewYear"):
            errors.append(f"lunarYear {lunar_year} lunarNewYear mismatch")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "path",
        type=Path,
        nargs="?",
        default=Path("shared/calendar/calendar-runtime-rules-v1.json"),
    )
    args = parser.parse_args()

    payload = json.loads(args.path.read_text(encoding="utf-8"))
    errors = validate(payload)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(f"OK: {args.path}")
    print(f"years={len(payload['years'])}")
    print(f"dataSha256={payload['checksum']['dataSha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

