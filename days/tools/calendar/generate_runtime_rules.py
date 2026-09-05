#!/usr/bin/env python3
"""Generate calendar-runtime-rules-v1.json from offline public calendar tables.

The generated asset is runtime data, not runtime code. The app must ship the
JSON and must not call the upstream source while calculating anniversaries.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen


RULE_VERSION = "lunar-rules-1.0.0"
RANGE_START = "1901-01-01"
RANGE_END = "2100-12-31"
SOURCE_URL_TEMPLATE = (
    "https://www.weather.gov.hk/en/gts/time/calendar/text/files/T{year}e.txt"
)

DATE_ROW_RE = re.compile(
    r"^(?P<date>\d{4}/\d{1,2}/\d{1,2})\s+"
    r"(?P<lunar>.+?)\s{2,}"
    r"(?P<weekday>Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b",
    re.IGNORECASE,
)
LUNAR_MONTH_RE = re.compile(
    r"^(?P<month>\d+)(?:st|nd|rd|th)\s+Lunar\s+Month$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class MonthStart:
    lunar_year: int
    month: int
    is_leap: bool
    start: date


def fetch_year_table(year: int, retries: int = 4) -> str:
    request = Request(
        SOURCE_URL_TEMPLATE.format(year=year),
        headers={"User-Agent": "AnniversaryCalendarRulesGenerator/1.0"},
    )
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            with urlopen(request, timeout=30) as response:
                raw = response.read()
            for encoding in ("utf-8", "big5"):
                try:
                    return raw.decode(encoding)
                except UnicodeDecodeError:
                    continue
            return raw.decode("utf-8", errors="replace")
        except Exception as exc:  # pragma: no cover - network fault path
            last_error = exc
            time.sleep(0.8 * (attempt + 1))
    raise RuntimeError(f"Failed to fetch HKO lunar table for {year}: {last_error}")


def parse_month_starts(text_by_year: dict[int, str]) -> list[MonthStart]:
    starts: list[MonthStart] = []
    current_lunar_year: int | None = None
    seen_months_in_year: dict[int, int] = {}

    for gregorian_year in sorted(text_by_year):
        for line in text_by_year[gregorian_year].splitlines():
            row_match = DATE_ROW_RE.match(line.rstrip())
            if not row_match:
                continue

            lunar_text = " ".join(row_match.group("lunar").split())
            month_match = LUNAR_MONTH_RE.match(lunar_text)
            if not month_match:
                continue

            month = int(month_match.group("month"))
            year_s, month_s, day_s = row_match.group("date").split("/")
            start = date(int(year_s), int(month_s), int(day_s))

            if month == 1:
                current_lunar_year = start.year
                seen_months_in_year = {}
            elif current_lunar_year is None:
                # The first Gregorian year contains the tail of lunar 1900,
                # outside this project's supported runtime range.
                continue

            repeat_count = seen_months_in_year.get(month, 0)
            is_leap = repeat_count > 0
            seen_months_in_year[month] = repeat_count + 1
            starts.append(
                MonthStart(
                    lunar_year=current_lunar_year,
                    month=month,
                    is_leap=is_leap,
                    start=start,
                )
            )

    return starts


def build_year_rules(starts: list[MonthStart]) -> list[dict]:
    starts = sorted(starts, key=lambda item: item.start)
    by_lunar_year: dict[int, list[MonthStart]] = {}
    for item in starts:
        if 1901 <= item.lunar_year <= 2100:
            by_lunar_year.setdefault(item.lunar_year, []).append(item)

    start_index = {
        (item.lunar_year, item.month, item.is_leap): index
        for index, item in enumerate(starts)
    }
    years: list[dict] = []

    for lunar_year in range(1901, 2101):
        months = by_lunar_year.get(lunar_year)
        if not months:
            raise ValueError(f"Missing lunar year {lunar_year}")

        leap_months = sorted({item.month for item in months if item.is_leap})
        if len(leap_months) > 1:
            raise ValueError(f"Lunar year {lunar_year} has multiple leap months")

        month_rules: list[dict] = []
        for item in months:
            index = start_index[(item.lunar_year, item.month, item.is_leap)]
            next_start = starts[index + 1].start if index + 1 < len(starts) else None
            if next_start is None:
                if item.lunar_year == 2100 and item.month == 12 and not item.is_leap:
                    # 2100-12-31 is lunar 2100-12-01. HKO's public text table
                    # stops at the supported Gregorian range end, so the final
                    # month length is completed with the GB/T 33661-2017 rule
                    # baseline and marked explicitly as an out-of-range closure.
                    days = 29
                    completion = "out_of_range_boundary_closure_2101-01-29"
                else:
                    raise ValueError(
                        f"Cannot determine month length for {item.lunar_year}-"
                        f"{item.month} leap={item.is_leap}"
                    )
            else:
                days = (next_start - item.start).days
                completion = "hko_next_month_start"

            if days not in (29, 30):
                raise ValueError(
                    f"Invalid month length {days} for {item.lunar_year}-"
                    f"{item.month} leap={item.is_leap}"
                )

            rule = {
                "month": item.month,
                "isLeap": item.is_leap,
                "days": days,
                "startGregorian": item.start.isoformat(),
            }
            if completion != "hko_next_month_start":
                rule["completion"] = completion
            month_rules.append(rule)

        month_count = len(month_rules)
        if month_count not in (12, 13):
            raise ValueError(f"Lunar year {lunar_year} has {month_count} months")

        years.append(
            {
                "lunarYear": lunar_year,
                "lunarNewYear": month_rules[0]["startGregorian"],
                "leapMonth": leap_months[0] if leap_months else None,
                "months": month_rules,
            }
        )

    return years


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


def build_payload(years: list[dict]) -> dict:
    payload = {
        "$schema": "./calendar-runtime-rules-v1.schema.json",
        "version": RULE_VERSION,
        "range": {"start": RANGE_START, "end": RANGE_END},
        "source": {
            "ruleStandard": {
                "standardNo": "GB/T 33661-2017",
                "name": "农历的编算和颁行",
                "status": "现行",
                "publishedAt": "2017-05-12",
                "implementedAt": "2017-09-01",
                "authority": "中国科学院",
            },
            "conversionTable": {
                "name": "Hong Kong Observatory Gregorian-Lunar Calendar Conversion Table",
                "urlTemplate": SOURCE_URL_TEMPLATE,
                "years": "1901-2100",
                "usage": "offline_generation_and_cross_check_only",
            },
            "decisionRecord": "docs/calendar_data_source_decision_v1.md",
        },
        "boundary": {
            "runtimeRangeIsGregorian": True,
            "lastSupportedGregorianDate": RANGE_END,
            "note": (
                "Lunar month 2100-12 starts on 2100-12-31; dates after "
                "2100-12-31 are outside V1.0 runtime range."
            ),
        },
        "years": years,
    }
    payload["checksum"] = {
        "algorithm": "SHA-256",
        "dataSha256": canonical_data_hash(payload),
    }
    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("shared/calendar/calendar-runtime-rules-v1.json"),
    )
    args = parser.parse_args()

    text_by_year = {year: fetch_year_table(year) for year in range(1901, 2101)}
    starts = parse_month_starts(text_by_year)
    years = build_year_rules(starts)
    payload = build_payload(years)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {args.output} with {len(years)} lunar years")
    print(f"dataSha256={payload['checksum']['dataSha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

