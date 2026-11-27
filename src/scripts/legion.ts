#!/usr/bin/env tsx

import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

import { type AgentId } from '../types/index';
import { c, readJSON, LEGION_ROOT } from '../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AgentRecord {
  title: string;
  codename: string;
  domain: string;
}

interface AgentRegistry {
  agents: Record<AgentId, AgentRecord>;
}

interface Manifest {
  version: string;
  model: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// LEGION_ROOT is always the real legion/ folder (set by bin/legion or resolved from __dirname)
const SCRIPTS_DIR = path.join(LEGION_ROOT, 'src', 'scripts');
const TSX         = path.join(LEGION_ROOT, 'node_modules', '.bin', 'tsx');

const BANNER = `
${c.bold}${c.purple}╔══════════════════════════════════════════════════╗
║  L  E  G  I  O  N                               ║
║  I am Legion. We are many.                       ║
║  Solution Intelligence Platform v2.0             ║
╚══════════════════════════════════════════════════╝${c.reset}
`;

// ── Run a sub-script ──────────────────────────────────────────────────────────

function run(scriptName: string, args: string[]): void {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);

  if (!fs.existsSync(scriptPath)) {
    console.error(`${c.red}Script not found: ${scriptPath}${c.reset}`);
    process.exit(1);
  }

  const result = spawnSync(TSX, [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, LEGION_ROOT },
  });

  process.exit(result.status ?? 0);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

switch (cmd) {

  case 'scan':
    run('scan.ts', args);
    break;

  case 'brainstorm':
    run('brainstorm.ts', args);
    break;

  case 'memory':
    run('memory-agent.ts', args);
    break;

  case 'agents': {
    console.log(BANNER);
    const registry = readJSON<AgentRegistry>(path.join(LEGION_ROOT, 'core/registry/agents.json'));
    if (!registry) { console.error(`${c.red}Cannot load agent registry${c.reset}`); process.exit(1); }
    console.log(`${c.bold}Legion Agents (${Object.keys(registry.agents).length} registered)${c.reset}\n`);
    for (const [, agent] of Object.entries(registry.agents)) {
      console.log(`  ${c.bold}${c.purple}${agent.codename}${c.reset} — ${agent.title}`);
      console.log(`  ${c.dim}${agent.domain}${c.reset}`);
      console.log();
    }
    break;
  }

  case 'status': {
    console.log(BANNER);
    const registry = readJSON<AgentRegistry>(path.join(LEGION_ROOT, 'core/registry/agents.json'));
    const manifest  = readJSON<Manifest>(path.join(LEGION_ROOT, '.legion/manifest.json'));
    console.log(`${c.bold}System Status${c.reset}\n`);
    console.log(`  ${c.green}●${c.reset} Legion online`);
    console.log(`  ${c.green}●${c.reset} ${registry ? Object.keys(registry.agents).length : '?'} agents`);
    console.log(`  Version: ${manifest?.version ?? 'unknown'}`);
    console.log(`  Root:    ${LEGION_ROOT}`);
    console.log();
    console.log(`${c.bold}Commands${c.reset}`);
    console.log(`  legion scan                     Scan current project`);
    console.log(`  legion brainstorm "<feature>"   Full spec pipeline`);
    console.log(`  legion memory sync              Sync to Obsidian`);
    console.log(`  legion memory log "<msg>"       Log to daily journal`);
    console.log(`  legion memory daily             Daily report`);
    console.log(`  legion agents                   List all agents`);
    console.log();
    break;
  }

  default:
    console.log(BANNER);
    console.log(`${c.bold}Commands${c.reset}\n`);
    console.log(`  ${c.cyan}legion scan${c.reset}                     Scan current project — brief all agents`);
    console.log(`  ${c.cyan}legion brainstorm "<feature>"${c.reset}   PRD + Tech Spec + Architecture + Test Plan`);
    console.log(`  ${c.cyan}legion memory sync${c.reset}              Sync to Obsidian + Notion`);
    console.log(`  ${c.cyan}legion memory log "<msg>"${c.reset}       Log to daily journal`);
    console.log(`  ${c.cyan}legion memory recall "<query>"${c.reset}  Search memory`);
    console.log(`  ${c.cyan}legion memory daily${c.reset}             Generate daily report`);
    console.log(`  ${c.cyan}legion memory note "<title>"${c.reset}    Create note`);
    console.log(`  ${c.cyan}legion memory status${c.reset}            Memory health check`);
    console.log(`  ${c.cyan}legion agents${c.reset}                   List all agents`);
    console.log(`  ${c.cyan}legion status${c.reset}                   System overview`);
    console.log();
    console.log(`${c.dim}  I am Legion. We are many.${c.reset}\n`);
    break;
}
