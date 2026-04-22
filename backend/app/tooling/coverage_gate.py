"""Fail repo test runs when backend statement or branch coverage drops too low."""

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, cast


@dataclass(frozen=True, slots=True)
class CoverageTotals:
    """Normalized backend coverage totals read from coverage JSON output."""

    statement_percent: float
    branch_percent: float


def read_coverage_totals(report_path: Path) -> CoverageTotals:
    """Read backend statement and branch percentages from one coverage JSON file.

    Args:
        report_path: Path to `coverage.py` JSON output.

    Raises:
        RuntimeError: If the report payload is missing required totals.
    """
    payload = cast(dict[str, Any], json.loads(report_path.read_text(encoding="utf-8")))
    totals = payload.get("totals")
    if not isinstance(totals, dict):
        raise RuntimeError("Coverage report is missing totals.")

    statement_percent = totals.get("percent_statements_covered")
    branch_percent = totals.get("percent_branches_covered")
    if not isinstance(statement_percent, (int, float)):
        raise RuntimeError("Coverage report is missing statement coverage percent.")
    if not isinstance(branch_percent, (int, float)):
        raise RuntimeError("Coverage report is missing branch coverage percent.")

    return CoverageTotals(
        statement_percent=float(statement_percent),
        branch_percent=float(branch_percent),
    )


def validate_thresholds(*, totals: CoverageTotals, minimum_percent: float) -> None:
    """Raise when backend coverage falls below the required thresholds."""
    failures: list[str] = []
    if totals.statement_percent < minimum_percent:
        failures.append(
            f"statement coverage {totals.statement_percent:.2f}% is below {minimum_percent:.2f}%"
        )
    if totals.branch_percent < minimum_percent:
        failures.append(
            f"branch coverage {totals.branch_percent:.2f}% is below {minimum_percent:.2f}%"
        )
    if failures:
        raise RuntimeError("Backend coverage gate failed: " + "; ".join(failures))


def main(argv: list[str] | None = None) -> int:
    """Run backend coverage threshold validation from CLI args."""
    resolved_argv = sys.argv[1:] if argv is None else argv
    if len(resolved_argv) != 2:
        print(
            "Usage: python -m app.tooling.coverage_gate <coverage-json-path> <minimum-percent>",
            file=sys.stderr,
        )
        return 2

    report_path = Path(resolved_argv[0])
    minimum_percent = float(resolved_argv[1])

    try:
        totals = read_coverage_totals(report_path)
        validate_thresholds(totals=totals, minimum_percent=minimum_percent)
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1

    print(
        "Backend coverage gate passed: "
        f"statements={totals.statement_percent:.2f}% "
        f"branches={totals.branch_percent:.2f}%"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
