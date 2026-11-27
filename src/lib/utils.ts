import fs from 'fs';
import path from 'path';

// ── ANSI colour helpers ───────────────────────────────────────────────────────

export const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  purple: '\x1b[35m',
  blue:   '\x1b[34m',
} as const;

export const log  = (msg: string, col: string = c.cyan): void => console.log(`${col}${msg}${c.reset}`);
export const ok   = (msg: string): void               => console.log(`${c.green}  ✓ ${msg}${c.reset}`);
export const warn = (msg: string): void               => console.log(`${c.yellow}  ⚠ ${msg}${c.reset}`);
export const err  = (msg: string): void               => console.log(`${c.red}  ✗ ${msg}${c.reset}`);
export const head = (msg: string): void               => console.log(`\n${c.bold}${c.purple}── ${msg} ──${c.reset}\n`);

// ── File helpers ──────────────────────────────────────────────────────────────

export function readJSON<T = unknown>(fp: string): T | null {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')) as T; }
  catch { return null; }
}

export function writeJSON(fp: string, data: unknown): void {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
}

export function writeFile(fp: string, content: string): void {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
}

export function appendToFile(fp: string, content: string): void {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.appendFileSync(fp, content);
}

export function readFile(fp: string): string | null {
  try { return fs.readFileSync(fp, 'utf8'); }
  catch { return null; }
}

export function exists(fp: string): boolean {
  return fs.existsSync(fp);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export const TODAY = new Date().toISOString().split('T')[0] as string;
export const NOW   = new Date().toISOString();

// ── Legion root ───────────────────────────────────────────────────────────────
// Resolved in order:
//   1. LEGION_ROOT env var  (set by bin/legion so it always points at the real legion folder)
//   2. Walk up from __dirname (src/lib → src → legion root)

export const LEGION_ROOT: string = (() => {
  if (process.env['LEGION_ROOT']) return process.env['LEGION_ROOT'];
  // __dirname is legion/src/lib at runtime — go up two levels
  return path.resolve(__dirname, '..', '..');
})();

// ── Local .env (gitignored) ───────────────────────────────────────────────────
// Minimal KEY=value loader so personal settings (OBSIDIAN_VAULT, NOTION_*)
// never need to be hardcoded. Existing env vars always win.

(() => {
  const envPath = path.join(LEGION_ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m || line.trimStart().startsWith('#')) continue;
    const key = m[1] as string;
    const value = (m[2] as string).replace(/^(['"])(.*)\1$/, '$2');
    if (value && process.env[key] === undefined) process.env[key] = value;
  }
})();
