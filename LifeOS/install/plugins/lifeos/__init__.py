"""LifeOS runtime plugin registration for Hermes."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from . import schemas, tools


def _session_started(session_id: str | None = None, platform: str | None = None, model: str | None = None, **_kwargs: Any) -> None:
    """Record minimal operational evidence only; never retain conversational text."""
    try:
        tools.state().record_event(
            "hermes-session",
            {"session_id": session_id or "", "platform": platform or "", "model": model or ""},
        )
    except Exception:
        pass


def _session_ended(session_id: str | None = None, **_kwargs: Any) -> None:
    """Close the evidence interval without retaining transcript content."""
    try:
        tools.state().record_event("hermes-session-end", {"session_id": session_id or ""})
    except Exception:
        pass


def _tool_completed(tool_name: str, **_kwargs: Any) -> None:
    """Record use of LifeOS tools without capturing arguments or tool output."""
    if not str(tool_name).startswith("lifeos_"):
        return
    try:
        tools.state().record_event("lifeos-action", {"tool": str(tool_name)})
    except Exception:
        pass


def _slash_status(_raw_args: str) -> str:
    return tools.lifeos_status({})


def _configure_cli(subparser: Any) -> None:
    subcommands = subparser.add_subparsers(dest="lifeos_command")
    subcommands.add_parser("status", help="Show LifeOS runtime status")


def _handle_cli(args: Any) -> None:
    if getattr(args, "lifeos_command", None) == "status":
        print(tools.lifeos_status({}))
    else:
        print("Usage: hermes lifeos status")


def register(ctx: Any) -> None:
    ctx.register_tool(name="lifeos_isa", toolset="lifeos", schema=schemas.LIFEOS_ISA, handler=tools.lifeos_isa)
    ctx.register_tool(name="lifeos_events", toolset="lifeos", schema=schemas.LIFEOS_EVENTS, handler=tools.lifeos_events)
    ctx.register_tool(
        name="lifeos_public_profile",
        toolset="lifeos",
        schema=schemas.LIFEOS_PUBLIC_PROFILE,
        handler=tools.lifeos_public_profile,
    )
    ctx.register_tool(name="lifeos_status", toolset="lifeos", schema=schemas.LIFEOS_STATUS, handler=tools.lifeos_status)
    ctx.register_hook("on_session_start", _session_started)
    ctx.register_hook("on_session_end", _session_ended)
    ctx.register_hook("post_tool_call", _tool_completed)
    ctx.register_command("lifeos", _slash_status, description="Show LifeOS runtime status")
    ctx.register_cli_command("lifeos", "Manage the LifeOS Hermes runtime", _configure_cli, _handle_cli)
