# Skill: Glue-Layer Tool Pattern (Installer + Doctor + Router)
**Category:** architecture
**Agents:** titan, forge, blueprint, cipher, conduit
**Confidence:** 0.9
**Source:** project-learnt (distilled from Agent-Reach, 2026-08-01)
**Learned:** 2026-08-01

## What this skill covers
A reusable blueprint for building a tool that **installs + configures + health-
checks** a set of third-party backends, then gets out of the way so the caller
uses those backends directly. Extracted from Agent Reach ([[agent-reach]]); apply
it whenever we wrap "N flaky external services behind one clean entrypoint"
without reimplementing them. FORGE uses this as the default skeleton.

## Core principles
1. **Glue, not reinvention.** Route and call upstream via its public API/CLI;
   never fork or hack its internals. One thin driver file per backend.
2. **Detect, don't assume.** The "right" backend changes as services add
   anti-bot measures. Encode an *ordered candidate list* per capability and pick
   the live one at runtime, not a hard-coded choice.
3. **Health ≠ existence.** `which(cmd)` / "file exists" proves nothing. Really
   execute a cheap, idempotent probe (`--version`/`--status`) and classify
   `ok / missing / broken / timeout / error`. Catch the "installed but stale
   interpreter" case explicitly (exit 126/127, FileNotFoundError on the shim).
4. **Doctor is a read-only observer.** The diagnostics command must trigger ZERO
   side effects in upstream tools — no auth calls that read/refresh cookies, no
   telemetry writes. Inspect saved credential files to report configured-vs-not;
   report `warn` (not `ok`) when liveness can't be proven without a side effect.
5. **Explicit credentials only.** Never silently harvest a browser/keychain.
   Require the user to hand over creds explicitly; store them 0600, atomic write,
   reject symlinked paths, mask on display, scrub secrets from every output.
6. **Environment-aware install.** Auto-detect local vs server (SSH/Docker/
   headless/cloud-VM/systemd-virt) and skip backends that can't work there.
   Offer `--dry-run` (show plan) and `--safe` (report gaps, change nothing).
7. **Fail safe on teardown.** Uninstall never deletes anything whose provenance
   it can't prove; it lists exact paths for the user to remove.
8. **Stay in sync with upstream.** Ship a script that diffs your driver files
   against the upstream source so breakage is visible and mergeable.

## Skeleton to copy
```
tool/
  cli.py            # argparse: setup / install / configure / doctor / uninstall / watch
  config.py         # ~/.tool/config.yaml, atomic 0600 write, env-var fallback, masking
  doctor.py         # read-only: collect check() from every driver, JSON + text report
  probe.py          # probe_command(): execute + classify ok/missing/broken/timeout/error
  drivers/base.py   # contract: name, backends[ordered], tier, can_handle, check()->active_backend
  drivers/<x>.py    # one file per backend; two-phase pick (first ok, else first warn)
  integrations/mcp_server.py   # expose get_status only
  scripts/sync-upstream.sh     # diff drivers vs upstream, show drift
```
`check()` two-phase pattern: gather findings from all candidates → return first
`ok` (set active_backend) → else first `warn` (active_backend=None) → else error.

## When to apply it
- Building any "one command to make N external tools usable" utility.
- Wrapping login-gated / anti-bot / rate-limited third-party services.
- Any Legion tool where install friction and "which backend is even working
  right now?" is the actual hard problem — not the fetch logic.
- CIPHER: use principles 4–7 as the review checklist for credential-handling
  tools.

## Resources
- Reference implementation: a local clone of Agent-Reach
  (`probe.py`, `channels/base.py`, `channels/twitter.py`, `backends/opencli.py`,
  `doctor.py`, `config.py` are the exemplar files).
- Companion tool skill: [[agent-reach]]
