"""Behavior tests for the deployable LifeOS Hermes plugin.

The plugin keeps its runtime state profile-local. These tests use only a temporary
plugin data directory and import the module directly; no Hermes installation,
config, session store, or Hindsight provider is touched.
"""
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
PLUGIN = REPO / "LifeOS" / "install" / "plugins" / "lifeos"


def load_state_module():
    path = PLUGIN / "state.py"
    spec = importlib.util.spec_from_file_location("lifeos_plugin_state", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class LifeOSRuntimeStateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.state = load_state_module().LifeOSState(Path(self.temp.name))

    def test_isa_lifecycle_preserves_criteria_and_calculates_progress(self):
        created = self.state.create_isa(
            title="Deploy a verified public profile",
            goal="Publish only deterministic-sanitized content",
            criteria=["Preview contains no private path", "Deploy remains human-approved"],
        )
        self.assertEqual(created["phase"], "observe")
        self.assertEqual(created["progress"], {"complete": 0, "total": 2})

        updated = self.state.update_isa(
            created["id"],
            phase="verify",
            complete_criteria=["ISC-1"],
            evidence={"ISC-1": "portable scan passed"},
        )
        self.assertEqual(updated["phase"], "verify")
        self.assertEqual(updated["progress"], {"complete": 1, "total": 2})
        self.assertEqual(updated["criteria"][0]["evidence"], "portable scan passed")
        self.assertFalse(updated["criteria"][1]["complete"])

    def test_event_rollup_is_deterministic_and_deduplicates_git_commits(self):
        self.state.record_event("app-focus", {"app": "Code", "interval_seconds": 120}, "2026-08-10T09:00:00Z")
        self.state.record_event("app-focus", {"app": "Chrome", "interval_seconds": 60}, "2026-08-10T09:02:00Z")
        self.state.record_event("git-commit", {"repo": "demo", "sha": "abc"}, "2026-08-10T10:00:00Z")
        self.state.record_event("git-commit", {"repo": "demo", "sha": "abc"}, "2026-08-10T10:00:01Z")
        self.state.record_event("hermes-session", {}, "2026-08-10T11:00:00Z")
        self.state.record_event("hermes-session-end", {}, "2026-08-10T11:30:00Z")

        rollup = self.state.rollup_day("2026-08-10")
        self.assertEqual(rollup["creation_minutes"], 2.0)
        self.assertEqual(rollup["consumption_minutes"], 1.0)
        self.assertEqual(rollup["commits"], 1)
        self.assertEqual(rollup["sessions"], 1)
        self.assertEqual(rollup["events"], 6)

    def test_public_profile_redaction_never_returns_sensitive_markers(self):
        private_path = "C:/" + "Users/person/private/project"
        fake_secret = "sk-" + "abcdefghijklmnopqrstuvwxyz"
        raw = {
            "mission": "Build useful public tools",
            "notes": f"Internal endpoint http://localhost:31337 and key {fake_secret}",
            "path": private_path,
        }
        profile = self.state.sanitize_public_profile(raw)
        serialized = json.dumps(profile)
        self.assertIn("Build useful public tools", serialized)
        self.assertNotIn("localhost", serialized)
        self.assertNotIn("sk-", serialized)
        self.assertNotIn("C:/" + "Users", serialized)
        self.assertGreater(profile["redaction_count"], 0)


class LifeOSPluginRegistrationTests(unittest.TestCase):
    def test_plugin_registers_the_runtime_tools_and_lifecycle_hooks(self):
        spec = importlib.util.spec_from_file_location(
            "lifeos_plugin",
            PLUGIN / "__init__.py",
            submodule_search_locations=[str(PLUGIN)],
        )
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)

        class Context:
            def __init__(self):
                self.tools = []
                self.hooks = []
                self.commands = []
                self.cli_commands = []

            def register_tool(self, **kwargs):
                self.tools.append(kwargs["name"])

            def register_hook(self, name, _handler):
                self.hooks.append(name)

            def register_command(self, name, _handler, **_kwargs):
                self.commands.append(name)

            def register_cli_command(self, name, *_args):
                self.cli_commands.append(name)

        ctx = Context()
        module.register(ctx)
        self.assertEqual(ctx.tools, ["lifeos_isa", "lifeos_events", "lifeos_public_profile", "lifeos_status"])
        self.assertEqual(ctx.hooks, ["on_session_start", "on_session_end", "post_tool_call"])
        self.assertEqual(ctx.commands, ["lifeos"])
        self.assertEqual(ctx.cli_commands, ["lifeos"])


if __name__ == "__main__":
    unittest.main()
