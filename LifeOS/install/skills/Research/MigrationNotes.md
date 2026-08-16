# Research Migration Notes

This file records the Hermes adaptation boundary; it is not an executable workflow.

The upstream research system referenced Claude commands, local templates, filesystem MCP directories, and provider-specific scripts. The Hermes port uses the core web search/extraction tools, browser automation when needed, bounded delegation, and optional source-specific skills. No hidden command directory or automatic provider key is installed.

`SKILL.md` and the files under `Workflows/` define current behavior. Historical upstream paths are intentionally omitted from the deployed contract.
