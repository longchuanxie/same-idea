#!/usr/bin/env python3
"""Generate business occurrence regression scenarios from frozen calendar assets."""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def iso(value: date | None) -> str | None:
    return value.isoformat() if value else None


class ScenarioBuilder:
    def __init__(self, rules: dict, golden: dict) -> None:
        self.rules = rules
        self.golden = golden
        self.by_lunar = {
            (
                row["lunarYear"],
                row["lunarMonth"],
                row["lunarDay"],
                row["isLeapMonth"],
            ): parse_date(row["gregorian"])
            for row in golden["days"]
        }
        self.month_days = {}
        for year in rules["years"]:
            for month in year["months"]:
                self.month_days[
                    (year["lunarYear"], month["month"], month["isLeap"])
                ] = month["days"]
        self.leap_month = {
            year["lunarYear"]: year["leapMonth"] for year in rules["years"]
        }
        self.scenarios: list[dict] = []

    def add(self, category: str, title: str, from_date: str, event: dict) -> None:
        expected = self.expected(event, parse_date(from_date))
        self.scenarios.append(
            {
                "id": f"{category}_{len([s for s in self.scenarios if s['category'] == category]) + 1:03d}",
                "category": category,
                "title": title,
                "fromDate": from_date,
                "event": event,
                "expected": expected,
            }
        )

    def expected(self, event: dict, from_date: date) -> dict:
        future = []
        for target_year in range(from_date.year, 2101):
            status, occurrence = self.occurrence_for_year(event, target_year)
            if status == "VALID" and occurrence and occurrence >= from_date:
                future.append(occurrence)
                if len(future) == 5:
                    break
        return {
            "status": "VALID" if future else "OUT_OF_RANGE",
            "nextOccurrence": iso(future[0]) if future else None,
            "futureOccurrences": [iso(item) for item in future],
        }

    def occurrence_for_year(self, event: dict, target_year: int) -> tuple[str, date | None]:
        payload = event["datePayload"]
        rule = event["repeatRule"]
        if event["calendarType"] == "GREGORIAN":
            month = payload["month"]
            day = payload["day"]
            try:
                return "VALID", date(target_year, month, day)
            except ValueError:
                if month == 2 and day == 29:
                    policy = rule["leapDayPolicy"]
                    if policy == "FEB_28":
                        return "VALID", date(target_year, 2, 28)
                    if policy == "MAR_01":
                        return "VALID", date(target_year, 3, 1)
                    return "SKIPPED", None
                return "INVALID", None

        lunar_month = payload["lunarMonth"]
        lunar_day = payload["lunarDay"]
        is_leap = payload["isLeapMonth"]
        effective_leap = is_leap
        if is_leap and self.leap_month.get(target_year) != lunar_month:
            policy = rule["leapMonthPolicy"]
            if policy == "NORMAL_MONTH_FALLBACK":
                effective_leap = False
            elif policy == "ONLY_LEAP_MONTH":
                return "SKIPPED", None
            else:
                return "NEED_CONFIRM", None

        days = self.month_days.get((target_year, lunar_month, effective_leap))
        if days is None:
            return "OUT_OF_RANGE", None
        day = lunar_day
        if lunar_day > days:
            policy = rule["missingLunarDayPolicy"]
            if policy == "LAST_DAY_OF_MONTH":
                day = days
            elif policy == "SKIP":
                return "SKIPPED", None
            else:
                return "NEED_CONFIRM", None
        occurrence = self.by_lunar.get((target_year, lunar_month, day, effective_leap))
        return ("VALID", occurrence) if occurrence else ("OUT_OF_RANGE", None)


def gregorian_event(month: int, day: int, leap_policy: str = "FEB_28") -> dict:
    return {
        "calendarType": "GREGORIAN",
        "datePayload": {
            "year": 2024,
            "month": month,
            "day": day,
            "timezone": "Asia/Shanghai",
        },
        "repeatRule": {
            "type": "YEARLY",
            "leapDayPolicy": leap_policy,
            "missingLunarDayPolicy": "LAST_DAY_OF_MONTH",
            "leapMonthPolicy": "NORMAL_MONTH_FALLBACK",
        },
    }


def lunar_event(
    month: int,
    day: int,
    is_leap: bool = False,
    leap_policy: str = "NORMAL_MONTH_FALLBACK",
    missing_policy: str = "LAST_DAY_OF_MONTH",
) -> dict:
    return {
        "calendarType": "CHINESE_LUNAR",
        "datePayload": {
            "lunarYear": 2024,
            "lunarMonth": month,
            "lunarDay": day,
            "isLeapMonth": is_leap,
            "timezoneBasis": "Asia/Shanghai",
        },
        "repeatRule": {
            "type": "YEARLY",
            "leapDayPolicy": "FEB_28",
            "missingLunarDayPolicy": missing_policy,
            "leapMonthPolicy": leap_policy,
        },
    }


def build_scenarios(builder: ScenarioBuilder) -> None:
    normal_gregorian = [
        (1, 1), (1, 31), (2, 14), (3, 8), (4, 5),
        (5, 20), (6, 1), (7, 7), (8, 15), (9, 10),
        (10, 1), (10, 31), (11, 11), (12, 24), (12, 31),
    ]
    for month, day in normal_gregorian:
        builder.add("GREGORIAN_YEARLY", f"公历 {month}-{day}", "2026-06-19", gregorian_event(month, day))

    for policy in ["FEB_28", "MAR_01", "SKIP"]:
        for from_date in ["2025-01-01", "2027-12-31", "2028-01-01", "2099-01-01"]:
            builder.add("GREGORIAN_LEAP_DAY", f"2 月 29 日 {policy}", from_date, gregorian_event(2, 29, policy))

    lunar_dates = [
        (1, 1), (1, 15), (2, 2), (3, 3), (4, 8),
        (5, 5), (6, 6), (7, 7), (8, 3), (8, 15),
        (9, 9), (10, 1), (10, 15), (11, 11), (12, 8),
        (12, 23), (12, 24), (12, 29), (6, 18), (9, 21),
    ]
    for month, day in lunar_dates:
        builder.add("LUNAR_YEARLY", f"农历 {month}-{day}", "2026-06-19", lunar_event(month, day))

    leap_cases = [(2020, 4), (2023, 2), (2025, 6), (2028, 5), (2031, 3)]
    for year, month in leap_cases:
        for policy in ["NORMAL_MONTH_FALLBACK", "ONLY_LEAP_MONTH"]:
            builder.add("LUNAR_LEAP_MONTH", f"{year} 闰{month}月 {policy}", f"{year}-01-01", lunar_event(month, 1, True, policy))
            builder.add("LUNAR_LEAP_MONTH", f"{year} 闰{month}月十五 {policy}", f"{year}-01-01", lunar_event(month, 15, True, policy))

    for month in [1, 2, 4, 5, 7, 8, 9, 10, 11, 12]:
        builder.add("LUNAR_MISSING_DAY", f"农历 {month} 月三十 fallback", "2026-01-01", lunar_event(month, 30))
    for month in [2, 5, 8, 11, 12]:
        builder.add("LUNAR_MISSING_DAY", f"农历 {month} 月三十 skip", "2026-01-01", lunar_event(month, 30, missing_policy="SKIP"))

    for from_date in ["2026-01-01", "2027-01-01", "2028-01-01", "2029-01-01", "2030-01-01", "2031-01-01", "2032-01-01", "2033-01-01", "2034-01-01", "2035-01-01"]:
        builder.add("LUNAR_EVE", "除夕 fallback", from_date, lunar_event(12, 30))

    for from_date in ["2026-01-01", "2026-02-18", "2027-01-01", "2028-01-01", "2029-01-01", "2030-01-01", "2031-01-01", "2032-01-01", "2033-01-01", "2034-01-01"]:
        builder.add("SPRING_BOUNDARY", "春节边界", from_date, lunar_event(1, 1))

    for month, day in [(8, 3), (1, 15), (5, 5), (7, 7), (8, 15), (9, 9), (12, 8), (12, 30), (4, 8), (10, 15)]:
        builder.add("FUTURE_PREVIEW", f"未来 5 年 {month}-{day}", "2026-06-19", lunar_event(month, day))

    for month, day in [(1, 1), (2, 14), (5, 20), (8, 15), (12, 31)]:
        builder.add("CONSISTENCY", f"一致性公历 {month}-{day}", "2026-06-19", gregorian_event(month, day))
    for month, day in [(1, 1), (5, 5), (8, 3), (8, 15), (12, 30)]:
        builder.add("CONSISTENCY", f"一致性农历 {month}-{day}", "2026-06-19", lunar_event(month, day))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rules", type=Path, default=Path("shared/calendar/calendar-runtime-rules-v1.json"))
    parser.add_argument("--golden", type=Path, default=Path("shared/calendar/calendar-golden-1901-2100.json"))
    parser.add_argument("--output", type=Path, default=Path("shared/calendar/calendar-regression-scenarios-v1.json"))
    args = parser.parse_args()

    rules = load_json(args.rules)
    golden = load_json(args.golden)
    builder = ScenarioBuilder(rules, golden)
    build_scenarios(builder)

    payload = {
        "$schema": "./calendar-regression-scenarios-v1.schema.json",
        "version": "calendar-regression-scenarios-1.0.0",
        "ruleVersion": rules["version"],
        "ruleChecksum": rules["checksum"]["dataSha256"],
        "goldenChecksum": golden["checksum"]["dataSha256"],
        "scenarios": builder.scenarios,
    }
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.output} with {len(builder.scenarios)} scenarios")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

