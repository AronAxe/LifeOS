# Fabric Workflow

Use this compatibility workflow when the request explicitly calls for a Fabric pattern or when a named pattern is the most suitable transformation after evidence has been acquired.

## Boundary

Fabric is a separate optional skill and CLI. Do not assume a global pattern directory, a fixed installation path, or that the executable is present. Load the installed Fabric skill and follow its current documented commands. If it is unavailable, perform the requested transformation directly and disclose that Fabric was not executed.

## Sequence

1. Resolve the actual input: text, local file, URL content, or transcript.
2. Acquire and verify the content with the appropriate Research workflow first. Fabric transforms content; it does not prove the source was retrieved correctly.
3. Inspect the installed Fabric skill for available patterns and exact invocation syntax.
4. Select the narrowest pattern that matches the user's intent. Explain any consequential choice when several patterns materially differ.
5. For local execution, obtain approval if the command has cost, network egress, mutation, or credential implications not already authorized.
6. Run the documented command through `terminal`; do not invent a pattern name.
7. Verify process exit status and inspect the produced text or artifact.
8. Preserve source receipts and distinguish source evidence from model-generated transformation.

## Typical intents

- summarize or extract wisdom;
- analyze claims or arguments;
- generate questions;
- create a threat model;
- transform a transcript or article into another format.

## Completion

Report the resolved input, pattern used, exact evidence source, output artifact or text, execution status, and any fallback. A plausible-looking generated response is not evidence that Fabric ran.
