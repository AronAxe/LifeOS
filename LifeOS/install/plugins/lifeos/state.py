"""Profile-local state and deterministic transforms for the LifeOS Hermes plugin.

This module deliberately owns only LifeOS operational state: ISA/Loop records,
append-only event evidence, rollups, and sanitized public-profile previews.
TELOS, source documents, and external memory remain in their configured systems.
"""
from __future__ import annotations

import json
import re
import sqlite3
import threading
import uuid
from collections import Counter
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator, Mapping, Sequence


_CREATION_APPS = {
    "code", "cursor", "visual studio", "vscode", "terminal", "windows terminal",
    "powershell", "cmd", "obsidian", "notion", "figma", "photoshop", "davinci",
    "ableton", "hermes", "git", "excel",
}
_CONSUMPTION_APPS = {
    "chrome", "edge", "firefox", "brave", "arc", "opera", "youtube", "reddit",
    "instagram", "tiktok", "netflix", "news", "mail", "outlook", "thunderbird",
    "slack", "discord", "telegram", "whatsapp", "signal", "teams",
}
_SENSITIVE = re.compile(
    r"(?:\bsk-[A-Za-z0-9_-]{16,}\b|\bghp_[A-Za-z0-9]{16,}\b|"
    r"\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|bearer)\s*[:=]\s*\S+|"
    r"https?://localhost:\d+|\b(?:[A-Za-z]:[/\\]|/(?:Users|home)/)[^\s'\"`]+)",
    re.IGNORECASE,
)


class LifeOSState:
    """A small SQLite-backed state store safe to create inside a plugin data dir."""

    def __init__(self, root: Path) -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.db_path = self.root / "lifeos.sqlite3"
        self._lock = threading.RLock()
        self._initialize()

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        with self._lock:
            connection = sqlite3.connect(self.db_path)
            connection.row_factory = sqlite3.Row
            try:
                yield connection
                connection.commit()
            finally:
                connection.close()

    def _initialize(self) -> None:
        with self._connection() as db:
            db.executescript(
                """
                CREATE TABLE IF NOT EXISTS isa (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    goal TEXT NOT NULL,
                    phase TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    criteria_json TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS event (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    occurred_at TEXT NOT NULL,
                    type TEXT NOT NULL,
                    detail_json TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS event_occurred_at ON event(occurred_at);
                """
            )

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    @staticmethod
    def _criterion(index: int, text: str) -> dict[str, Any]:
        return {"id": f"ISC-{index}", "text": str(text), "complete": False, "evidence": None}

    @staticmethod
    def _progress(criteria: Sequence[Mapping[str, Any]]) -> dict[str, int]:
        return {"complete": sum(1 for criterion in criteria if criterion.get("complete")), "total": len(criteria)}

    @classmethod
    def _serialize_isa(cls, row: sqlite3.Row) -> dict[str, Any]:
        criteria = json.loads(row["criteria_json"])
        return {
            "id": row["id"],
            "title": row["title"],
            "goal": row["goal"],
            "phase": row["phase"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "criteria": criteria,
            "progress": cls._progress(criteria),
        }

    def create_isa(self, title: str, goal: str, criteria: Sequence[str]) -> dict[str, Any]:
        title = title.strip()
        goal = goal.strip()
        cleaned = [item.strip() for item in criteria if str(item).strip()]
        if not title or not goal or not cleaned:
            raise ValueError("title, goal, and at least one criterion are required")
        now = self._now()
        isa_id = str(uuid.uuid4())
        criteria_value = [self._criterion(index, text) for index, text in enumerate(cleaned, start=1)]
        with self._connection() as db:
            db.execute(
                "INSERT INTO isa (id, title, goal, phase, created_at, updated_at, criteria_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (isa_id, title, goal, "observe", now, now, json.dumps(criteria_value, sort_keys=True)),
            )
        return self.get_isa(isa_id)

    def get_isa(self, isa_id: str) -> dict[str, Any]:
        with self._connection() as db:
            row = db.execute("SELECT * FROM isa WHERE id = ?", (isa_id,)).fetchone()
        if row is None:
            raise KeyError(f"ISA not found: {isa_id}")
        return self._serialize_isa(row)

    def list_isas(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._connection() as db:
            rows = db.execute("SELECT * FROM isa ORDER BY updated_at DESC LIMIT ?", (max(1, min(limit, 500)),)).fetchall()
        return [self._serialize_isa(row) for row in rows]

    def update_isa(
        self,
        isa_id: str,
        *,
        phase: str | None = None,
        complete_criteria: Sequence[str] = (),
        evidence: Mapping[str, str] | None = None,
    ) -> dict[str, Any]:
        current = self.get_isa(isa_id)
        valid_phases = {"observe", "think", "plan", "build", "execute", "verify", "learn", "complete"}
        next_phase = (phase or current["phase"]).strip().lower()
        if next_phase not in valid_phases:
            raise ValueError(f"unsupported ISA phase: {next_phase}")
        completed = set(complete_criteria)
        evidence = evidence or {}
        criteria = []
        known = set()
        for criterion in current["criteria"]:
            updated = dict(criterion)
            known.add(updated["id"])
            if updated["id"] in completed:
                updated["complete"] = True
            if updated["id"] in evidence:
                updated["evidence"] = str(evidence[updated["id"]])
            criteria.append(updated)
        unknown = (completed | set(evidence)) - known
        if unknown:
            raise ValueError(f"unknown criterion ids: {', '.join(sorted(unknown))}")
        now = self._now()
        with self._connection() as db:
            db.execute(
                "UPDATE isa SET phase = ?, updated_at = ?, criteria_json = ? WHERE id = ?",
                (next_phase, now, json.dumps(criteria, sort_keys=True), isa_id),
            )
        return self.get_isa(isa_id)

    def record_event(self, event_type: str, detail: Mapping[str, Any], occurred_at: str | None = None) -> dict[str, Any]:
        event_type = event_type.strip().lower()
        allowed = {
            "app-focus",
            "git-commit",
            "hermes-session",
            "hermes-session-end",
            "lifeos-action",
        }
        if event_type not in allowed:
            raise ValueError(f"unsupported event type: {event_type}")
        when = occurred_at or self._now()
        # Keep timestamp handling deterministic and reject malformed values early.
        datetime.fromisoformat(when.replace("Z", "+00:00"))
        with self._connection() as db:
            cursor = db.execute(
                "INSERT INTO event (occurred_at, type, detail_json) VALUES (?, ?, ?)",
                (when, event_type, json.dumps(dict(detail), sort_keys=True)),
            )
            event_id = cursor.lastrowid
        return {"id": event_id, "occurred_at": when, "type": event_type, "detail": dict(detail)}

    @staticmethod
    def _classify_app(app: str) -> str:
        normalized = app.strip().lower()
        if any(token == normalized or token in normalized for token in _CREATION_APPS):
            return "creation"
        if any(token == normalized or token in normalized for token in _CONSUMPTION_APPS):
            return "consumption"
        return "neutral"

    def rollup_day(self, date: str) -> dict[str, Any]:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
            raise ValueError("date must use YYYY-MM-DD")
        with self._connection() as db:
            rows = db.execute(
                "SELECT occurred_at, type, detail_json FROM event WHERE occurred_at >= ? AND occurred_at < ? ORDER BY id",
                (f"{date}T00:00:00", f"{date}T24:00:00"),
            ).fetchall()
        app_seconds: Counter[str] = Counter()
        seen_commits: set[str] = set()
        commits = 0
        sessions = 0
        for row in rows:
            detail = json.loads(row["detail_json"])
            if row["type"] == "app-focus":
                app = str(detail.get("app") or "").strip()
                if app:
                    app_seconds[app] += float(detail.get("interval_seconds") or 120)
            elif row["type"] == "git-commit":
                token = str(detail.get("sha") or f"{detail.get('repo')}:{row['occurred_at']}")
                if token not in seen_commits:
                    seen_commits.add(token)
                    commits += 1
            elif row["type"] == "hermes-session":
                sessions += 1
        blocks = [
            {"app": app, "kind": self._classify_app(app), "minutes": round(seconds / 60, 1)}
            for app, seconds in app_seconds.items()
        ]
        blocks.sort(key=lambda item: (-item["minutes"], item["app"].lower()))
        minutes = lambda kind: round(sum(item["minutes"] for item in blocks if item["kind"] == kind), 1)
        return {
            "date": date,
            "events": len(rows),
            "blocks": blocks,
            "creation_minutes": minutes("creation"),
            "consumption_minutes": minutes("consumption"),
            "neutral_minutes": minutes("neutral"),
            "commits": commits,
            "sessions": sessions,
        }

    @staticmethod
    def sanitize_public_profile(data: Mapping[str, Any]) -> dict[str, Any]:
        redactions = 0

        def sanitize(value: Any) -> Any:
            nonlocal redactions
            if isinstance(value, str):
                clean, count = _SENSITIVE.subn("[REDACTED]", value)
                redactions += count
                return clean
            if isinstance(value, Mapping):
                return {str(key): sanitize(child) for key, child in value.items()}
            if isinstance(value, list):
                return [sanitize(child) for child in value]
            return value

        return {"profile": sanitize(dict(data)), "redaction_count": redactions}
