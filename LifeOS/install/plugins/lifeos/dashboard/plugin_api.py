"""Dashboard API for the LifeOS Hermes plugin."""
from __future__ import annotations

import importlib.util
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter


def _load_state_module():
    path = Path(__file__).resolve().parents[1] / "state.py"
    spec = importlib.util.spec_from_file_location("lifeos_dashboard_state", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_state_module = _load_state_module()
router = APIRouter()


def _runtime():
    try:
        from hermes_constants import get_hermes_home

        root = get_hermes_home()
    except ImportError:
        import os

        root = Path(os.environ.get("HERMES_HOME") or Path.home() / ".hermes")
    return _state_module.LifeOSState(Path(root) / "lifeos")


@router.get("/overview")
async def overview():
    runtime = _runtime()
    today = datetime.now(timezone.utc).date().isoformat()
    return {"isas": runtime.list_isas(), "rollup": runtime.rollup_day(today), "date": today}
