#!/usr/bin/env python3
"""Run local calendar quality gates.

This script intentionally covers checks that are available in the current
repository without Android SDK or Gradle. Full Android widget/reminder device
validation still needs an Android SDK and device matrix.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[2]


def run(command: list[str], cwd: Path = ROOT) -> None:
    print("RUN", " ".join(command))
    subprocess.run(command, cwd=cwd, check=True)


def validate_schema(schema_path: str, data_path: str) -> None:
    schema_file = ROOT / schema_path
    data_file = ROOT / data_path
    schema = json.loads(schema_file.read_text(encoding="utf-8"))
    data = json.loads(data_file.read_text(encoding="utf-8"))
    errors = sorted(
        Draft202012Validator(schema).iter_errors(data),
        key=lambda error: list(error.path),
    )
    if errors:
        for error in errors[:20]:
            path = "/".join(map(str, error.path))
            print(f"SCHEMA ERROR {data_path} {path}: {error.message}")
        raise SystemExit(1)
    print(f"SCHEMA OK {data_path}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--skip-dart",
        action="store_true",
        help="Skip Dart calendar_core checks.",
    )
    args = parser.parse_args()

    run([sys.executable, "tools/calendar/validate_runtime_rules.py"])
    run([sys.executable, "tools/calendar/validate_golden.py"])

    validate_schema(
        "shared/calendar/calendar-runtime-rules-v1.schema.json",
        "shared/calendar/calendar-runtime-rules-v1.json",
    )
    validate_schema(
        "shared/calendar/calendar-golden-1901-2100.schema.json",
        "shared/calendar/calendar-golden-1901-2100.json",
    )
    validate_schema(
        "shared/calendar/calendar-regression-scenarios-v1.schema.json",
        "shared/calendar/calendar-regression-scenarios-v1.json",
    )

    if not args.skip_dart:
        dart_package = ROOT / "calendar_core"
        dart = "dart.bat" if sys.platform.startswith("win") else "dart"
        run([dart, "pub", "get"], cwd=dart_package)
        run([dart, "analyze"], cwd=dart_package)
        run([dart, "test"], cwd=dart_package)

    print("CALENDAR CHECKS OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
