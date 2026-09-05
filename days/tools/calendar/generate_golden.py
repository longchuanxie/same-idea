#!/usr/bin/env python3
"""Generate daily Gregorian-Lunar golden mappings for 1901-01-01..2100-12-31."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import date, timedelta
from pathlib import Path


RANGE_START = date(1901, 1, 1)
RANGE_END = date(2100, 12, 31)

MONTH_NAMES = {
    1: "正月",
    2: "二月",
    3: "三月",
    4: "四月",
    5: "五月",
    6: "六月",
    7: "七月",
    8: "八月",
    9: "九月",
    10: "十月",
    11: "冬月",
    12: "腊月",
}
DAY_NAMES = {
    1: "初一",
    2: "初二",
    3: "初三",
    4: "初四",
    5: "初五",
    6: "初六",
    7: "初七",
    8: "初八",
    9: "初九",
    10: "初十",
    11: "十一",
    12: "十二",
    13: "十三",
    14: "十四",
    15: "十五",
    16: "十六",
    17: "十七",
    18: "十八",
    19: "十九",
    20: "二十",
    21: "廿一",
    22: "廿二",
    23: "廿三",
    24: "廿四",
    25: "廿五",
    26: "廿六",
    27: "廿七",
    28: "廿八",
    29: "廿九",
    30: "三十",
}


def iter_dates(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def lunar_display(month: int, day: int, is_leap: bool) -> str:
    leap = "闰" if is_leap else ""
    return f"农历{leap}{MONTH_NAMES[month]}{DAY_NAMES[day]}"


def build_spans(runtime_rules: dict) -> list[dict]:
    spans = [
        {
            "lunarYear": 1900,
            "lunarMonth": 11,
            "isLeapMonth": False,
            "monthDays": 29,
            "start": date(1900, 12, 22),
            "source": "boundary_inferred_from_hko_1901_table",
        },
        {
            "lunarYear": 1900,
            "lunarMonth": 12,
            "isLeapMonth": False,
            "monthDays": 30,
            "start": date(1901, 1, 20),
            "source": "boundary_inferred_from_hko_1901_table",
        },
    ]

    for year_rule in runtime_rules["years"]:
        for month in year_rule["months"]:
            spans.append(
                {
                    "lunarYear": year_rule["lunarYear"],
                    "lunarMonth": month["month"],
                    "isLeapMonth": month["isLeap"],
                    "monthDays": month["days"],
                    "start": date.fromisoformat(month["startGregorian"]),
                    "source": "calendar-runtime-rules-v1.json",
                }
            )

    return sorted(spans, key=lambda item: item["start"])


def build_daily_golden(runtime_rules: dict) -> list[dict]:
    spans = build_spans(runtime_rules)
    days: list[dict] = []
    span_index = 0

    for current in iter_dates(RANGE_START, RANGE_END):
        while (
            span_index + 1 < len(spans)
            and spans[span_index + 1]["start"] <= current
        ):
            span_index += 1

        span = spans[span_index]
        lunar_day = (current - span["start"]).days + 1
        if lunar_day < 1 or lunar_day > span["monthDays"]:
            raise ValueError(f"Cannot map {current.isoformat()} to a lunar date")

        days.append(
            {
                "gregorian": current.isoformat(),
                "lunarYear": span["lunarYear"],
                "lunarMonth": span["lunarMonth"],
                "lunarDay": lunar_day,
                "isLeapMonth": span["isLeapMonth"],
                "lunarMonthDays": span["monthDays"],
                "lunarDisplay": lunar_display(
                    span["lunarMonth"], lunar_day, span["isLeapMonth"]
                ),
            }
        )

    return days


def canonical_hash(days: list[dict]) -> str:
    encoded = json.dumps(
        days, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--rules",
        type=Path,
        default=Path("shared/calendar/calendar-runtime-rules-v1.json"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("shared/calendar/calendar-golden-1901-2100.json"),
    )
    args = parser.parse_args()

    runtime_rules = json.loads(args.rules.read_text(encoding="utf-8"))
    days = build_daily_golden(runtime_rules)
    payload = {
        "$schema": "./calendar-golden-1901-2100.schema.json",
        "version": "calendar-golden-1.0.0",
        "range": {"start": RANGE_START.isoformat(), "end": RANGE_END.isoformat()},
        "ruleVersion": runtime_rules["version"],
        "ruleChecksum": runtime_rules["checksum"]["dataSha256"],
        "source": {
            "runtimeRules": str(args.rules).replace("\\", "/"),
            "boundaryNote": (
                "1901-01-01..1901-02-18 maps to the tail of lunar year 1900 "
                "because the supported range is Gregorian-date based."
            ),
        },
        "checksum": {
            "algorithm": "SHA-256",
            "dataSha256": canonical_hash(days),
        },
        "days": days,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {args.output} with {len(days)} days")
    print(f"dataSha256={payload['checksum']['dataSha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

