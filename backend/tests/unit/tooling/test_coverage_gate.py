"""Unit tests for backend coverage threshold tooling."""

import json
from pathlib import Path

import pytest

from app.tooling.coverage_gate import (
    CoverageTotals,
    main,
    read_coverage_totals,
    validate_thresholds,
)


def _write_report(
    report_path: Path,
    *,
    statement_percent: object = 83.5,
    branch_percent: object = 81.25,
) -> None:
    report_path.write_text(
        json.dumps(
            {
                "totals": {
                    "percent_statements_covered": statement_percent,
                    "percent_branches_covered": branch_percent,
                }
            }
        ),
        encoding="utf-8",
    )


def test_read_coverage_totals_returns_statement_and_branch_percentages(tmp_path: Path) -> None:
    """Read normalized statement and branch values from coverage JSON."""
    report_path = tmp_path / "coverage.json"
    _write_report(report_path, statement_percent=84, branch_percent=82.5)

    assert read_coverage_totals(report_path) == CoverageTotals(
        statement_percent=84.0,
        branch_percent=82.5,
    )


def test_read_coverage_totals_rejects_missing_branch_percent(tmp_path: Path) -> None:
    """Reject malformed coverage payloads that cannot enforce branch gates."""
    report_path = tmp_path / "coverage.json"
    _write_report(report_path, branch_percent="missing")

    with pytest.raises(
        RuntimeError,
        match=r"Coverage report is missing branch coverage percent\.",
    ):
        read_coverage_totals(report_path)


def test_read_coverage_totals_rejects_missing_totals_object(tmp_path: Path) -> None:
    """Reject malformed coverage payloads with no totals object."""
    report_path = tmp_path / "coverage.json"
    report_path.write_text(json.dumps({"meta": {}}), encoding="utf-8")

    with pytest.raises(
        RuntimeError,
        match=r"Coverage report is missing totals\.",
    ):
        read_coverage_totals(report_path)


def test_read_coverage_totals_rejects_missing_statement_percent(tmp_path: Path) -> None:
    """Reject malformed coverage payloads without statement coverage percent."""
    report_path = tmp_path / "coverage.json"
    _write_report(report_path, statement_percent="missing")

    with pytest.raises(
        RuntimeError,
        match=r"Coverage report is missing statement coverage percent\.",
    ):
        read_coverage_totals(report_path)


def test_validate_thresholds_raises_for_statement_or_branch_failures() -> None:
    """Report the exact threshold dimensions that failed."""
    with pytest.raises(
        RuntimeError,
        match=(
            r"statement coverage 79\.00% is below 80\.00%; "
            r"branch coverage 78\.00% is below 80\.00%"
        ),
    ):
        validate_thresholds(
            totals=CoverageTotals(statement_percent=79.0, branch_percent=78.0),
            minimum_percent=80,
        )


def test_main_returns_zero_when_statement_and_branch_thresholds_pass(tmp_path: Path) -> None:
    """CLI exits cleanly when backend statement and branch coverage pass."""
    report_path = tmp_path / "coverage.json"
    _write_report(report_path, statement_percent=84.5, branch_percent=81.0)

    assert main([str(report_path), "80"]) == 0


def test_main_returns_two_when_cli_args_are_missing() -> None:
    """CLI returns usage error when required args are missing."""
    assert main([]) == 2


def test_main_returns_one_when_threshold_validation_fails(tmp_path: Path) -> None:
    """CLI exits nonzero when statement or branch coverage fails the gate."""
    report_path = tmp_path / "coverage.json"
    _write_report(report_path, statement_percent=84.5, branch_percent=79.0)

    assert main([str(report_path), "80"]) == 1
