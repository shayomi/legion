#!/usr/bin/env tsx
/**
 * Legion Memory Agent v2.0 (TypeScript) — MEMORY
 * ──────────────────────────────────────────────────────────────────────────
 * Bridges: Obsidian ↔ Legion local ↔ Notion ↔ daily logs ↔ vector store
 *
 * Usage:
 *   npm run memory sync           # Full sync
 *   npm run memory log <message>  # Append to daily log
 *   npm run memory recall <query> # Search memory
 *   npm run memory daily          # Generate daily report
 *   npm run memory note <title>   # Create note
 *   npm run memory status         # Health check
 */

import fs from 'fs';
import path from 'path';

import {
  type VectorStore,
  type VectorEntry,
  type ScoredEntry,
  type DailyReport,
  type MemoryConfig,
} from '../types/index';
import {
  c, ok, warn, head, log,
  readJSON, writeJSON, writeFile, appendToFile, readFile, exists,
  TODAY, NOW, LEGION_ROOT,
} from '../lib/utils';

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG: MemoryConfig = {
  obsidian_vault:         process.env['OBSIDIAN_VAULT'] ?? '',  // set in .env — empty disables Obsidian sync
  obsidian_legion_folder: 'Legion',
  legion_root:            LEGION_ROOT,
  memory_root:            path.join(LEGION_ROOT, 'memory'),
  notion_token:           process.env['NOTION_TOKEN'] ?? null,
  notion_database_id:     process.env['NOTION_DB_ID'] ?? null,
  vector_store:           path.join(LEGION_ROOT, 'memory', 'vector-store', 'index.json'),
};

// ── Obsidian bridge ───────────────────────────────────────────────────────────

const OBS = {
  legionPath(): string {
    return path.join(CONFIG.obsidian_vault, CONFIG.obsidian_legion_folder);
  },

  available(): boolean {
    return exists(CONFIG.obsidian_vault);
  },

  ensure(): void {
    const dirs = [
      this.legionPath(),
      path.join(this.legionPath(), 'Daily Notes'),
      path.join(this.legionPath(), 'Projects'),
      path.join(this.legionPath(), 'Agents'),
      path.join(this.legionPath(), 'Decisions'),
      path.join(this.legionPath(), 'Brainstorms'),
      path.join(this.legionPath(), 'Clients'),
      path.join(this.legionPath(), 'Specs'),
      path.join(this.legionPath(), 'Intel'),
      path.join(this.legionPath(), 'Skills'),
    ];
    dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
  },

  dailyNotePath(): string {
    return path.join(this.legionPath(), 'Daily Notes', `${TODAY}.md`);
  },

  appendToDaily(content: string): boolean {
    if (!this.available()) return false;
    this.ensure();
    const fp = this.dailyNotePath();
    if (!exists(fp)) {
      writeFile(fp, `# ${TODAY} — Legion Daily Log\n\n> _I am Legion. We are many._\n\n---\n\n`);
    }
    appendToFile(fp, content + '\n');
    return true;
  },

  createNote(folder: string, title: string, content: string): string | null {
    if (!this.available()) return null;
    this.ensure();
    const safe = title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
    const fp   = path.join(this.legionPath(), folder, `${safe}.md`);
    writeFile(fp, content);
    return fp;
  },

  syncFromLegion(sourceDir: string, targetFolder: string): number {
    if (!this.available() || !exists(sourceDir)) return 0;
    this.ensure();

    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md') || f.endsWith('.json'));
    let count = 0;

    for (const file of files) {
      const src     = path.join(sourceDir, file);
      const content = readFile(src);
      if (!content) continue;

      let obsContent = content;
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(content) as unknown;
          obsContent = `# ${file.replace('.json', '')}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
        } catch { /* leave as-is */ }
      }

      const dest = path.join(this.legionPath(), targetFolder, file.replace('.json', '.md'));
      writeFile(dest, obsContent);
      count++;
    }
    return count;
  },
};

// ── Vector store ──────────────────────────────────────────────────────────────

const VSTORE = {
  load(): VectorStore {
    return readJSON<VectorStore>(CONFIG.vector_store) ?? { version: '1.0', entries: [] };
  },

  save(store: VectorStore): void {
    writeJSON(CONFIG.vector_store, store);
  },

  add(id: string, type: string, title: string, content: string, tags: string[] = []): void {
    const store = this.load();
    store.entries = store.entries.filter((e: VectorEntry) => e.id !== id);

    const keywords = [
      ...title.toLowerCase().split(/\W+/),
      ...content.toLowerCase().split(/\W+/).filter(w => w.length > 4),
      ...tags.map(t => t.toLowerCase()),
    ].filter(Boolean);

    const entry: VectorEntry = {
      id, type, title,
      content_preview: content.slice(0, 200),
      keywords: [...new Set(keywords)],
      tags,
      indexed_at: NOW,
    };

    store.entries.push(entry);
    this.save(store);
  },

  search(query: string): ScoredEntry[] {
    const store = this.load();
    const terms = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);

    return store.entries
      .map((entry: VectorEntry): ScoredEntry => {
        const score = terms.reduce(
          (s, term) => s + entry.keywords.filter(k => k.includes(term)).length,
          0,
        );
        return { ...entry, score };
      })
      .filter((e: ScoredEntry) => e.score > 0)
      .sort((a: ScoredEntry, b: ScoredEntry) => b.score - a.score)
      .slice(0, 10);
  },
};

// ── Notion bridge ─────────────────────────────────────────────────────────────

const NOTION = {
  available(): boolean {
    return !!(CONFIG.notion_token && CONFIG.notion_database_id);
  },

  async createPage(title: string, content: string, tags: string[] = []): Promise<unknown> {
    if (!this.available()) return null;
    try {
      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CONFIG.notion_token!}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: { database_id: CONFIG.notion_database_id },
          properties: {
            Name: { title: [{ text: { content: title } }] },
            Tags: { multi_select: tags.map(t => ({ name: t })) },
            Date: { date: { start: TODAY } },
          },
          children: [{
            object: 'block', type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }] },
          }],
        }),
      });
      return await res.json();
    } catch (e) {
      warn(`Notion sync failed: ${(e as Error).message}`);
      return null;
    }
  },
};

// ── Daily log ─────────────────────────────────────────────────────────────────

function getDailyLogPath(): string {
  return path.join(CONFIG.memory_root, 'daily-logs', `${TODAY}.md`);
}

function ensureDailyLog(): string {
  const fp = getDailyLogPath();
  if (!exists(fp)) {
    writeFile(fp,
      `# Legion Daily Log — ${TODAY}\n\n` +
      `> _"We are many. We remember everything."_\n\n---\n\n## Session Events\n\n`,
    );
  }
  return fp;
}

function appendLog(message: string, agent = 'system', type = 'note'): string {
  const fp  = ensureDailyLog();
  const ts  = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const entry = `**${ts}** [${agent.toUpperCase()}] ${message}\n`;

  appendToFile(fp, entry);
  OBS.appendToDaily(`**${ts}** [${agent.toUpperCase()}] ${message}`);
  VSTORE.add(`log-${Date.now()}`, 'daily-log', message, message, [agent, type, TODAY]);

  return entry;
}

// ── Commands ──────────────────────────────────────────────────────────────────

type CommandFn = (args: string[]) => void | Promise<void>;

const COMMANDS: Record<string, CommandFn> = {

  async sync(): Promise<void> {
    head('LEGION MEMORY SYNC');

    if (!OBS.available()) {
      warn(`Obsidian vault not found: ${CONFIG.obsidian_vault}`);
      warn('Set OBSIDIAN_VAULT=/path/to/your/vault');
    } else {
      OBS.ensure();
      ok(`Obsidian vault: ${CONFIG.obsidian_vault}`);

      const specCount   = OBS.syncFromLegion(path.join(CONFIG.legion_root, 'specs', 'prd'),          'Specs');
      const bsCount     = OBS.syncFromLegion(path.join(CONFIG.legion_root, 'brainstorm', 'sessions'), 'Brainstorms');
      const logCount    = OBS.syncFromLegion(path.join(CONFIG.memory_root, 'daily-logs'),             'Daily Notes');
      const agentCount  = OBS.syncFromLegion(path.join(CONFIG.memory_root, 'agent-reports'),          'Agents');

      ok(`Synced: ${specCount} specs, ${bsCount} brainstorms, ${logCount} logs, ${agentCount} reports`);
      appendLog('Full memory sync completed', 'memory', 'sync');
    }

    if (NOTION.available()) {
      ok('Notion connected — syncing...');
      await NOTION.createPage(`Legion Daily Sync — ${TODAY}`, `Sync at ${NOW}`, ['sync', 'legion']);
      ok('Notion entry created');
    } else {
      log('Notion not configured (optional)', c.dim);
    }
  },

  log(args: string[]): void {
    const message = args.join(' ');
    if (!message) { warn('Usage: npm run memory log <message>'); return; }
    appendLog(message, 'legion', 'manual');
    ok(`Logged: ${message}`);
  },

  recall(args: string[]): void {
    const query = args.join(' ');
    if (!query) { warn('Usage: npm run memory recall <query>'); return; }
    head(`RECALL: "${query}"`);

    const results = VSTORE.search(query);
    if (results.length === 0) {
      log('No memories found.', c.dim);
    } else {
      results.forEach((r, i) => {
        console.log(`${c.bold}${i + 1}. [${r.type}] ${r.title}${c.reset}`);
        console.log(`   ${c.dim}${r.content_preview}${c.reset}`);
        console.log(`   Tags: ${r.tags.join(', ')} | Score: ${r.score}`);
        console.log();
      });
    }
  },

  daily(): void {
    head('GENERATING DAILY REPORT');
    const fp      = getDailyLogPath();
    const content = readFile(fp) ?? 'No activity logged today.';

    const report: DailyReport = {
      date: TODAY,
      generated_at: NOW,
      agent: 'knowledge',
      summary: 'Daily report compiled by MEMORY',
      log_preview: content.slice(0, 500),
    };

    const reportPath = path.join(CONFIG.memory_root, 'agent-reports', `${TODAY}-daily.json`);
    writeJSON(reportPath, report);
    ok(`Report: ${reportPath}`);

    if (OBS.available()) {
      OBS.createNote('Daily Notes', `${TODAY} — Daily Report`, `# Daily Report — ${TODAY}\n\n${content}`);
      ok('Synced to Obsidian');
    }

    VSTORE.add(`daily-${TODAY}`, 'daily-report', `Daily Report ${TODAY}`, content, ['daily', TODAY]);
    ok('Indexed in vector store');
  },

  note(args: string[]): void {
    const title = args.join(' ');
    if (!title) { warn('Usage: npm run memory note <title>'); return; }
    head(`CREATING NOTE: ${title}`);

    const template = `# ${title}
_Created: ${TODAY} by Legion_

## Context


## Key Points


## Decisions


## Links
-

## Tags
#legion #note
`;

    const slug      = title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const localPath = path.join(CONFIG.memory_root, 'second-brain', `${TODAY}-${slug}.md`);
    writeFile(localPath, template);
    ok(`Note saved: ${localPath}`);

    if (OBS.available()) {
      const obsPath = OBS.createNote('', title, template);
      ok(`Obsidian: ${obsPath}`);
    } else {
      warn('Obsidian not available — saved locally only');
    }

    VSTORE.add(`note-${Date.now()}`, 'note', title, template, ['note', TODAY]);
    ok('Indexed in vector store');
  },

  status(): void {
    head('MEMORY AGENT STATUS');
    const store = VSTORE.load();

    console.log(`${c.bold}Local Memory${c.reset}`);
    console.log(`  Vector store entries: ${store.entries.length}`);
    console.log(`  Daily log today: ${exists(getDailyLogPath()) ? '✓' : '✗ Not started'}`);
    console.log();

    console.log(`${c.bold}Obsidian${c.reset}`);
    if (OBS.available()) {
      console.log(`  ${c.green}✓ Connected${c.reset}: ${CONFIG.obsidian_vault}`);
      console.log(`  Legion folder: ${exists(OBS.legionPath()) ? '✓' : '✗ Not initialised (run sync)'}`);
    } else {
      console.log(`  ${c.yellow}✗ Not found${c.reset}: ${CONFIG.obsidian_vault}`);
      console.log(`  Set OBSIDIAN_VAULT=/path/to/your/vault`);
    }
    console.log();

    console.log(`${c.bold}Notion${c.reset}`);
    console.log(`  ${NOTION.available() ? `${c.green}✓ Connected` : `${c.yellow}✗ Not configured (optional)`}${c.reset}`);
    console.log();

    console.log(`${c.bold}Paths${c.reset}`);
    console.log(`  Legion root:  ${CONFIG.legion_root}`);
    console.log(`  Memory root:  ${CONFIG.memory_root}`);
  },
};

// ── CLI entry ─────────────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

if (!cmd || !(cmd in COMMANDS)) {
  console.log(`\n${c.bold}${c.purple}Legion Memory Agent — MEMORY v2.0${c.reset}\n`);
  console.log('Commands:');
  console.log('  sync            Full sync (Legion ↔ Obsidian ↔ Notion)');
  console.log('  log <message>   Append to daily log');
  console.log('  recall <query>  Search memory');
  console.log('  daily           Generate daily report');
  console.log('  note <title>    Create note');
  console.log('  status          Health check');
  console.log();
  console.log('Environment:');
  console.log('  OBSIDIAN_VAULT   Path to Obsidian vault');
  console.log('  NOTION_TOKEN     Notion API token (optional)');
  console.log('  NOTION_DB_ID     Notion database ID (optional)');
  process.exit(0);
}

Promise.resolve(COMMANDS[cmd]!(args)).catch(e => {
  console.error(`${c.red}Error: ${(e as Error).message}${c.reset}`);
  process.exit(1);
});
