"""Regression tests for the port-authored Python tools.

Both tools are exercised against temporary fixtures only: `HERMES_HOME` and
`TELOS_DIR` are redirected into a scratch directory before either module is
imported, so no test reads or writes a real Hermes home or a real TELOS source.

Run:  python -m unittest discover -s tests -p "test_*.py"
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SKILLS = REPO / "LifeOS" / "install" / "skills"

# HERMES_HOME must point somewhere disposable before rollup.py is imported: the
# module resolves its data directories at import time.
_SCRATCH = tempfile.mkdtemp(prefix="lifeos-pytools-")
os.environ["HERMES_HOME"] = _SCRATCH


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


check = _load("lifeos_freshness_check", SKILLS / "Freshness" / "Tools" / "check.py")
rollup = _load("lifeos_conduit_rollup", SKILLS / "Conduit" / "Tools" / "rollup.py")


def _write_aged(path: Path, days_old: float) -> None:
    path.write_text("# fixture\n", encoding="utf-8")
    when = (datetime.now(timezone.utc) - timedelta(days=days_old)).timestamp()
    os.utime(path, (when, when))


class FreshnessConfiguration(unittest.TestCase):
    """TELOS_DIR is required and must exist — there is no maintainer fallback."""

    def test_unset_telos_dir_is_a_configuration_error(self):
        with self.assertRaises(check.ConfigurationError) as ctx:
            check.resolve_telos_dir({})
        self.assertIn("TELOS_DIR", str(ctx.exception))

    def test_blank_telos_dir_is_a_configuration_error(self):
        with self.assertRaises(check.ConfigurationError):
            check.resolve_telos_dir({"TELOS_DIR": "   "})

    def test_missing_directory_is_a_configuration_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            missing = str(Path(tmp) / "no-such-telos")
            with self.assertRaises(check.ConfigurationError) as ctx:
                check.resolve_telos_dir({"TELOS_DIR": missing})
            self.assertIn(missing, str(ctx.exception))

    def test_a_file_is_not_an_acceptable_telos_dir(self):
        with tempfile.TemporaryDirectory() as tmp:
            f = Path(tmp) / "telos.md"
            f.write_text("x", encoding="utf-8")
            with self.assertRaises(check.ConfigurationError):
                check.resolve_telos_dir({"TELOS_DIR": str(f)})

    def test_existing_directory_resolves(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(check.resolve_telos_dir({"TELOS_DIR": tmp}), Path(tmp))

    def test_module_carries_no_hardcoded_default_path(self):
        source = (SKILLS / "Freshness" / "Tools" / "check.py").read_text(encoding="utf-8")
        self.assertNotIn("Drop" + "box", source)
        # No drive-letter or POSIX-home absolute path baked into the tool.
        # The lookbehind keeps prose like "for example:\n" from matching.
        self.assertNotRegex(source, r"(?<![A-Za-z])[A-Za-z]:[/\\][A-Za-z0-9]")
        self.assertNotRegex(source, r"/(Users|home)/[A-Za-z0-9_.-]+")


class FreshnessGrading(unittest.TestCase):
    """Grading behaviour against a temporary TELOS fixture directory."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.telos = Path(self._tmp.name)
        self.addCleanup(self._tmp.cleanup)

    def test_grades_reflect_age_against_the_per_file_threshold(self):
        _write_aged(self.telos / "goals.md", 1)     # 30d threshold  → A
        _write_aged(self.telos / "status.md", 13)   # 14d threshold  → D
        _write_aged(self.telos / "mission.md", 400)  # 90d threshold → F
        (self.telos / "ignored.txt").write_text("not markdown", encoding="utf-8")

        report = check.check_freshness(self.telos)
        grades = {f["slug"]: f["grade"] for f in report["files"]}

        self.assertEqual(grades, {"goals": "A", "status": "D", "mission": "F"})
        self.assertEqual(report["total"], 3)
        self.assertEqual(report["stale_count"], 1)
        self.assertEqual(report["most_stale"], "mission")

    def test_empty_directory_reports_f_without_crashing(self):
        report = check.check_freshness(self.telos)
        self.assertEqual(report["total"], 0)
        self.assertEqual(report["overall_grade"], "F")
        self.assertIsNone(report["most_stale"])

    def test_soul_path_is_included_when_present_and_skipped_when_not(self):
        with tempfile.TemporaryDirectory() as hermes_home:
            soul = Path(hermes_home) / "SOUL.md"
            self.assertEqual(check.check_freshness(self.telos, soul_path=soul)["total"], 0)
            _write_aged(soul, 10)
            report = check.check_freshness(self.telos, soul_path=soul)
            self.assertEqual([f["slug"] for f in report["files"]], ["soul"])

    def test_report_is_json_serialisable(self):
        _write_aged(self.telos / "goals.md", 2)
        json.dumps(check.check_freshness(self.telos))


class ConduitIdentifiers(unittest.TestCase):
    """Document IDs derive from a required principal identifier."""

    def test_missing_principal_id_is_a_configuration_error(self):
        with self.assertRaises(rollup.ConfigurationError) as ctx:
            rollup.resolve_principal_id({})
        self.assertIn("LIFEOS_PRINCIPAL_ID", str(ctx.exception))

    def test_invalid_principal_id_is_rejected(self):
        for bad in ["Has Spaces", "UPPER", "with:colon", "-leading", ""]:
            with self.subTest(bad=bad):
                with self.assertRaises(rollup.ConfigurationError):
                    rollup.resolve_principal_id({"LIFEOS_PRINCIPAL_ID": bad})

    def test_valid_principal_id_flows_into_the_document_id(self):
        pid = rollup.resolve_principal_id({"LIFEOS_PRINCIPAL_ID": "acme-1"})
        self.assertEqual(pid, "acme-1")
        self.assertEqual(
            rollup.daily_document_id(pid, "2026-08-10"),
            f"user:{pid}:conduit:daily:2026-08-10",
        )

    def test_module_carries_no_person_specific_identifier(self):
        source = (SKILLS / "Conduit" / "Tools" / "rollup.py").read_text(encoding="utf-8")
        self.assertNotRegex(source, r"user:(?!\{)[a-z]")


class ConduitRollupPurity(unittest.TestCase):
    """`build_daily_record` is the aggregation core and must be deterministic."""

    EVENTS = [
        {"ts": "2026-08-10T09:00:00Z", "type": "app-focus", "app": "Code", "detail": {"intervalSec": 120}},
        {"ts": "2026-08-10T09:02:00Z", "type": "app-focus", "app": "Code", "detail": {"intervalSec": 120}},
        {"ts": "2026-08-10T09:04:00Z", "type": "app-focus", "app": "Chrome", "detail": {"intervalSec": 60}},
        {"ts": "2026-08-10T10:00:00Z", "type": "git-commit", "repo": "demo", "detail": {"sha": "abc"}},
        {"ts": "2026-08-10T10:00:01Z", "type": "git-commit", "repo": "demo", "detail": {"sha": "abc"}},
        {"ts": "2026-08-10T11:00:00Z", "type": "hermes-session"},
    ]

    def test_identical_input_produces_identical_output(self):
        stamp = "2026-08-10T12:00:00+00:00"
        a = rollup.build_daily_record("2026-08-10", self.EVENTS, 120, generated_at=stamp)
        b = rollup.build_daily_record("2026-08-10", self.EVENTS, 120, generated_at=stamp)
        self.assertEqual(json.dumps(a, sort_keys=True), json.dumps(b, sort_keys=True))

    def test_only_the_timestamp_varies_between_runs(self):
        a = rollup.build_daily_record("2026-08-10", self.EVENTS, 120)
        b = rollup.build_daily_record("2026-08-10", self.EVENTS, 120)
        a.pop("generatedAt")
        b.pop("generatedAt")
        self.assertEqual(a, b)

    def test_aggregation_is_correct(self):
        r = rollup.build_daily_record("2026-08-10", self.EVENTS, 120, generated_at="t")
        self.assertEqual(r["creationMinutes"], 4.0)      # Code: 2 × 120s
        self.assertEqual(r["consumptionMinutes"], 1.0)   # Chrome: 1 × 60s
        self.assertEqual(r["commits"], 1)                # duplicate sha deduped
        self.assertEqual(r["sessions"], 1)

    def test_no_events_produces_a_zeroed_record(self):
        r = rollup.build_daily_record("2026-08-10", [], 120, generated_at="t")
        self.assertEqual(r["totalMinutes"], 0)
        self.assertEqual(r["blocks"], [])
        self.assertIn("no app-focus events", rollup.render_markdown(r))


if __name__ == "__main__":
    unittest.main()
