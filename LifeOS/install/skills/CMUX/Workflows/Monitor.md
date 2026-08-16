# Monitor

Poll a workspace's surfaces, classify each agent's state (idle / working / done / awaiting-input), and report transitions. Optional notification is explicit rather than assumed.

## Why

An agent you can't see is an agent you can't improve. A team of eight running in panes you never look at is eight silent black boxes — you learn they stalled, looped, or finished only when you happen to glance over. `monitor` closes that gap: it watches every surface for you and speaks up on the transitions that matter, so your attention goes to the agent that needs it, not to babysitting the ones that don't.

## The poll-not-event reality

cmux has no push or event-subscribe command. There is no "notify me when done" callback to register. So `monitor` **polls** — every `--interval` seconds it walks each surface, calls `surface-health`, reads the screen tail, and diffs the state against last pass. "Notifications" are transitions the poll loop detects, not events the app emits. This is a deliberate design constraint from the CLI, not a limitation of the wrapper.

## Steps

1. **Start the loop over a workspace:**

   ```bash
   bun ~/.claude/skills/CMUX/Tools/cmux.ts monitor --workspace beta --interval 3
   ```

   Each pass, per surface it runs `surface-health` + `read-screen` (tail) and classifies:
   - **idle** — shell prompt, no active work
   - **working** — output still moving / process running
   - **done** — completion marker in the tail (green tests, "done", finished prompt)
   - **awaiting-input** — a prompt is waiting on you (y/n, password, confirm)

2. **React on transition.** Every pass emits JSON containing `states` and `notifications`. With no `CMUX_NOTIFY_ENDPOINT`, state monitoring continues and the notification result reports that the adapter is unavailable. For unattended delivery, configure an approved HTTP(S) endpoint explicitly. During an interactive Hermes run, the agent may instead call `text_to_speech` after reading a material transition.

3. **One pass, no loop.** For a scripted spot-check (e.g. inside another workflow), `--once` does a single classification pass and exits:

   ```bash
   bun ~/.claude/skills/CMUX/Tools/cmux.ts monitor --workspace beta --once
   ```

## Integration boundary

`monitor` does not feed a hidden dashboard, create background jobs, or persist transcript content. It prints classified JSON to stdout. A separate consumer may be built and reviewed later; the installed skill makes no such bridge active.

## Worked example — babysit a race, hands-free

```bash
# a 5-agent race is running in workspace:7 (see AgentRace.md)
bun ~/.claude/skills/CMUX/Tools/cmux.ts monitor --workspace workspace:7 --interval 2
# ... you go do something else ...
# stdout reports race-3 as done; an explicitly configured adapter may notify
```

Then pull the winner:

```bash
bun ~/.claude/skills/CMUX/Tools/cmux.ts read --surface surface:32 --lines 80
bun ~/.claude/skills/CMUX/Tools/cmux.ts flash --workspace workspace:7   # mark it visually
```

Teams to monitor come from BootTeam.md (tiered) and Fleet.md (grids); the race pattern that pairs with hands-free monitoring is in AgentRace.md.
