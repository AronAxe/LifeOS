"""Tool handlers for the LifeOS Hermes runtime plugin."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from hermes_constants import get_hermes_home
except ImportError:  # Enables direct unit import outside a Hermes process.
    import os

    def get_hermes_home() -> Path:  # type: ignore[misc]
        root = (os.environ.get("HERMES_HOME") or "").strip()
        return Path(root) if root else Path.home() / ".hermes"

from .state import LifeOSState


def state() -> LifeOSState:
    """Resolve profile-local runtime data without storing it inside source files."""
    return LifeOSState(get_hermes_home() / "lifeos")


def _result(value: Any) -> str:
    return json.dumps({"success": True, "data": value}, sort_keys=True)


def _error(message: str) -> str:
    return json.dumps({"success": False, "error": message})


def lifeos_isa(args: dict, **_kwargs: Any) -> str:
    try:
        action = str(args.get("action") or "").strip().lower()
        runtime = state()
        if action == "create":
            return _result(runtime.create_isa(args.get("title") or "", args.get("goal") or "", args.get("criteria") or []))
        if action == "get":
            return _result(runtime.get_isa(str(args.get("id") or "")))
        if action == "list":
            return _result(runtime.list_isas())
        if action == "update":
            return _result(
                runtime.update_isa(
                    str(args.get("id") or ""),
                    phase=args.get("phase"),
                    complete_criteria=args.get("complete_criteria") or [],
                    evidence=args.get("evidence") or {},
                )
            )
        return _error("action must be create, get, list, or update")
    except (KeyError, TypeError, ValueError) as exc:
        return _error(str(exc))
    except Exception as exc:
        return _error(f"lifeos_isa failed: {type(exc).__name__}: {exc}")


def lifeos_events(args: dict, **_kwargs: Any) -> str:
    try:
        action = str(args.get("action") or "").strip().lower()
        runtime = state()
        if action == "record":
            return _result(runtime.record_event(str(args.get("type") or ""), args.get("detail") or {}, args.get("occurred_at")))
        if action == "rollup":
            date = str(args.get("date") or datetime.now(timezone.utc).date().isoformat())
            return _result(runtime.rollup_day(date))
        return _error("action must be record or rollup")
    except (TypeError, ValueError) as exc:
        return _error(str(exc))
    except Exception as exc:
        return _error(f"lifeos_events failed: {type(exc).__name__}: {exc}")


def lifeos_public_profile(args: dict, **_kwargs: Any) -> str:
    try:
        profile = args.get("profile")
        if not isinstance(profile, dict):
            return _error("profile must be an object")
        return _result(state().sanitize_public_profile(profile))
    except Exception as exc:
        return _error(f"lifeos_public_profile failed: {type(exc).__name__}: {exc}")


def lifeos_status(_args: dict, **_kwargs: Any) -> str:
    try:
        runtime = state()
        today = datetime.now(timezone.utc).date().isoformat()
        return _result({"isas": runtime.list_isas(), "rollup": runtime.rollup_day(today), "data_root": str(runtime.root)})
    except Exception as exc:
        return _error(f"lifeos_status failed: {type(exc).__name__}: {exc}")
