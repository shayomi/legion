# Skill: Agent Reach (Internet Capability Router)
**Category:** research
**Agents:** oracle, nexus, signal, forge
**Confidence:** 0.95
**Source:** project-learnt (full codebase read, 2026-08-01)
**Learned:** 2026-08-01

## What this skill covers
Giving any Legion agent read/search access to ~15 internet platforms through
one tool. Agent Reach is **NOT a scraper or wrapper** — it is an
*installer + doctor + config layer*. It picks the currently-working upstream
backend for each platform, installs it, health-checks it, then gets out of the
way so agents call the upstream CLI/API **directly**. "After install, the agent
talks to twitter-cli / yt-dlp / gh / mcporter itself — no proxy layer."

- Repo: https://github.com/Panniantong/Agent-Reach (MIT, Python 3.10+)
- Local clone: a local clone of Agent-Reach
- Canonical usage doc shipped inside it: `agent_reach/skill/SKILL_en.md` +
  `agent_reach/skill/references/*.md` (Chinese prose, universal commands)
- Reusable engineering blueprint extracted separately: [[glue-layer-tool-pattern]]

## Architecture (how it actually works)
- **Channel registry** — one file per platform in `agent_reach/channels/`, all
  inherit `Channel` (`base.py`). Contract: `name`, `description`,
  `backends` (ORDERED candidate list, `[0]` = preferred), `tier` (0=zero-config,
  1=needs free key/login, 2=complex setup), `can_handle(url)`, and
  `check(config) -> (status, message)` which sets `self.active_backend`.
  Registered in `channels/__init__.py::ALL_CHANNELS`.
- **`probe.py` — the health primitive.** `probe_command()` actually *executes*
  `cmd --version` and classifies: `ok` / `missing` (not on PATH) / `broken`
  (exists but can't exec — the classic stale pipx/uv venv shim after a Python
  upgrade; exit 126/127 or FileNotFoundError on the shim) / `timeout` / `error`.
  Key insight: **`shutil.which()` is NOT proof of health** — a dead shim passes
  `which()`. Channels must really run a lightweight command.
- **`doctor.py` — read-only observer.** Collects every channel's `check()`,
  never lets one bad channel crash the report, scrubs URL credentials from every
  message, and emits `--json` (machine-readable, has `active_backend` per
  platform) or a tiered Rich text report. `Config` is opened `read_only=True`
  so doctor can never mutate anything.
- **Multi-backend routing (two-phase pick).** For platforms with several
  backends (Twitter, Reddit, XHS…), `check()` collects findings from ALL
  candidates, then picks the first `ok`; only if none is `ok` does it fall to
  the first `warn`. This stops an installed-but-unauthed backend from masking a
  fully-working one behind it. User can force order with config key
  `<channel>_backend` / env `<CHANNEL>_BACKEND` (`ordered_backends()`).
- **OpenCLI backend** (`backends/opencli.py`) — drives the user's real Chrome
  via a browser extension + local daemon, reusing existing logins. Desktop-only.
  Probed **without side effects**: `opencli doctor` auto-starts the daemon so
  it's banned; only `--version` + reading the loopback `/status` API at
  `127.0.0.1:19825` is used. Disk-present extension files are NOT treated as
  proof it's loaded/enabled — only a live daemon connection is.
- **`install --env=auto`** scores SSH / Docker / headless / cloud-VM /
  systemd-virt signals to decide local-vs-server, skips desktop-only OpenCLI
  channels on servers, installs gh CLI + Node + mcporter + undici + yt-dlp JS
  runtime config, then installs its own SKILL.md.
- **`--safe` / `--dry-run`** — safe mode reports what's missing without changing
  the system; dry-run shows the plan. Both open Config `read_only`.
- **MCP** (`integrations/mcp_server.py`) exposes only a `get_status` tool
  (doctor report) — reinforcing "installer/doctor, not a fetch proxy".
- **Upstream sync** (`scripts/sync-upstream.sh`) diffs channel files against
  upstream `runesleo/x-reader` (rewriting import paths), showing drift to merge
  manually — the mechanism behind "platform breaks, we fix, you pull".

## Security discipline (the standout lesson — CIPHER, note this)
- **Doctor triggers ZERO upstream side effects.** It deliberately refuses to run
  `twitter status` / `gh auth status` / `rdt status` because those upstream
  commands auto-read browser cookies, refresh cookies, or write telemetry
  device-ids. Doctor only *inspects saved credential files* (e.g. reads
  `hosts.yml`, `credential.json`) to report "configured vs not" — it never
  proves liveness by executing an authed call. Reports `warn` not `ok` for
  can't-verify-without-side-effects backends.
- **Cookie auth is explicit-only.** Install never reads a browser. Twitter/XHS
  require a manual **Cookie-Editor** export (QR scan hangs). Credentials live in
  `~/.agent-reach/config.yaml`, written **atomically with 0600 perms**, symlinks
  rejected (`config.py::_atomic_write_yaml`, `utils/paths.py`). `to_dict()`
  masks anything matching key/token/cookie/auth/ct0/secret/session.
- **Credential scrubbing everywhere** — `scrub_url_credentials()` strips
  user:pass from URLs in every doctor/MCP/error output boundary.
- **Twitter child-env pattern** — saved creds are injected only into a single
  child process env (`TWITTER_AUTH_TOKEN`/`TWITTER_CT0`), never `os.environ`;
  existing shell vars stay authoritative.
- **Uninstall fails safe** — refuses to auto-delete legacy credential copies or
  mcporter entries whose provenance it can't prove; lists exact paths instead.

## Platform command cheatsheet (call upstream directly after doctor)
```bash
# --- Zero-config (tier 0) ---
mcporter call 'exa.web_search_exa(query: "q", numResults: 5)'   # web/code search
curl -s "https://r.jina.ai/URL"                                  # read any web page clean
gh search repos "q" --sort stars --limit 10                      # GitHub
yt-dlp --write-sub --skip-download -o "/tmp/%(id)s" "URL"        # YouTube subs (NEVER for Bilibili)
curl -s "https://www.v2ex.com/api/topics/hot.json" -H "User-Agent: agent-reach/1.0"
bili search "q" --type video -n 5                                # Bilibili (no login)

# --- Login-backed: run `agent-reach doctor --json`, use the active_backend ---
twitter feed -n 20                     # most stable; search may 404 (retry chain in social.md)
opencli twitter search "q" -f yaml     # desktop fallback (browser session, no env vars)
opencli reddit search "q" -f yaml      # desktop; rdt search "q" --limit 10 (server/legacy)
opencli xiaohongshu search "q" -f yaml # XHS: must search first, cannot read a bare note_id (xsec_token)
opencli facebook feed --limit 10 -f yaml
opencli instagram user nasa --limit 12 -f yaml
opencli bilibili subtitle BVxxx        # Bilibili subtitles

# --- Transcription (audio→text, Groq→OpenAI fallback) ---
agent-reach transcribe "URL_or_file" --provider auto
```

## The tool's own commands
```bash
python -m agent_reach.cli doctor --json          # what's live now (start here)
python -m agent_reach.cli install --env=auto     # configure this machine
python -m agent_reach.cli install --dry-run      # preview, no changes
python -m agent_reach.cli install --channels=all # add optional channels
agent-reach configure twitter-cookies '<Cookie-Editor header>'
agent-reach check-update    # one API call; nudge user with update one-liner if newer
agent-reach watch           # quiet health+update check for cron
agent-reach uninstall --dry-run
```

## When to apply it
- Any research / "look this up" / "what do people say about X" / deep-dive that
  needs live internet data (ORACLE, SIGNAL).
- Any task where the user shares a URL or names one of the 15 platforms.
- NEXUS: social/web ingestion into a pipeline.
- FORGE: as the reference implementation when building any new glue-layer tool —
  see [[glue-layer-tool-pattern]].
- Broad research: combine Exa (web) + Twitter/Reddit (discussion) + XHS/Bilibili
  (Chinese perspective) in parallel, then synthesize.
- NOT for: writing/analysis/translation (it only FETCHES), or write ops
  (post/like/comment). Read/search only.

## Standing rules when using it (from its SKILL.md)
1. Health-check first for login-backed platforms: `agent-reach doctor --json`,
   pick the command group matching each platform's `active_backend`.
2. Announce "using agent-reach, platform X via backend Y" before starting.
3. On failure follow the retry chains in `references/` — never guess commands.
4. Never write files into the agent workspace; use `/tmp/` and `~/.agent-reach/`.
5. XHS/Reddit/Twitter: throttle 2-3s between calls; datacenter IPs risk bans.

## Resources
- Install one-liner (paste to any agent): https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md
- Update one-liner: https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/update.md
- In-repo detail: `agent_reach/skill/references/{search,social,career,dev,web,video}.md`
