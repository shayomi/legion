#!/usr/bin/env tsx
/**
 * Legion Project Scanner v2.0 (TypeScript)
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop into any existing project root and run:
 *   npx tsx /path/to/legion/src/scripts/scan.ts
 *   — or from legion root —
 *   npm run scan
 *
 * Analyses the codebase, generates agent briefs, writes .legion/ to the project.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import {
  type Stack,
  type ProjectStructure,
  type SecurityFinding,
  type GitInfo,
  type ScanContext,
  type AgentBriefings,
  type Severity,
} from '../types/index';
import { c, ok, warn, err, log, head, writeJSON, writeFile, readJSON, exists, LEGION_ROOT } from '../lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROOT      = process.cwd();
const LEGION_DIR = path.join(ROOT, '.legion');
const SCAN_TIME  = new Date().toISOString();

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', '.nuxt', 'dist', 'build', 'coverage',
  '__pycache__', '.venv', 'venv', '.cache', '.turbo', 'out', '.vercel',
]);

const CODE_EXTS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rb', '.php', '.java', '.cs']);

interface SecurityPattern {
  pattern: RegExp;
  severity: Severity;
  msg: string;
}

const SECURITY_PATTERNS: SecurityPattern[] = [
  { pattern: /PRIVATE_KEY|private_key/,    severity: 'critical', msg: 'Private key reference found' },
  { pattern: /password\s*=\s*['"][^'"]+/i, severity: 'high',     msg: 'Hardcoded password detected' },
  { pattern: /api_key\s*=\s*['"][^'"]+/i,  severity: 'high',     msg: 'Hardcoded API key' },
  { pattern: /secret\s*=\s*['"][^'"]+/i,   severity: 'high',     msg: 'Hardcoded secret' },
  { pattern: /eval\s*\(/,                   severity: 'medium',   msg: 'eval() usage — potential injection' },
  { pattern: /innerHTML\s*=/,              severity: 'medium',   msg: 'innerHTML assignment — XSS risk' },
  { pattern: /exec\s*\(/,                  severity: 'medium',   msg: 'exec() usage — command injection risk' },
  { pattern: /http:\/\//,                  severity: 'low',      msg: 'Plain HTTP (not HTTPS)' },
];

// ── Walk directory tree ───────────────────────────────────────────────────────

function walk(dir: string, maxDepth = 6, depth = 0): string[] {
  if (depth > maxDepth) return [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...walk(full, maxDepth, depth + 1));
    } else {
      files.push(full);
    }
  }
  return files;
}

// ── Stack detection ───────────────────────────────────────────────────────────

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function detectStack(files: string[], pkg: PackageJson | null): Stack {
  const languages = new Set<string>();
  const frameworks = new Set<string>();
  const databases  = new Set<string>();
  const cloud      = new Set<string>();
  const testing    = new Set<string>();
  const extCount: Record<string, number> = {};

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    extCount[ext] = (extCount[ext] ?? 0) + 1;

    if (['.ts', '.tsx'].includes(ext)) languages.add('TypeScript');
    if (['.js', '.jsx'].includes(ext)) languages.add('JavaScript');
    if (ext === '.py')  languages.add('Python');
    if (ext === '.go')  languages.add('Go');
    if (ext === '.rs')  languages.add('Rust');
    if (ext === '.java') languages.add('Java');
    if (ext === '.rb')  languages.add('Ruby');
    if (['.ex', '.exs'].includes(ext)) languages.add('Elixir');
  }

  // Package manager detection
  let package_manager: string | null = null;
  if (exists(path.join(ROOT, 'pnpm-lock.yaml')))    package_manager = 'pnpm';
  else if (exists(path.join(ROOT, 'yarn.lock')))    package_manager = 'yarn';
  else if (exists(path.join(ROOT, 'package-lock.json'))) package_manager = 'npm';
  else if (exists(path.join(ROOT, 'Pipfile')))      package_manager = 'pipenv';
  else if (exists(path.join(ROOT, 'poetry.lock')))  package_manager = 'poetry';
  else if (exists(path.join(ROOT, 'go.mod')))       package_manager = 'go modules';
  else if (exists(path.join(ROOT, 'Cargo.toml')))   package_manager = 'cargo';

  // Monorepo signals
  const monorepo =
    exists(path.join(ROOT, 'pnpm-workspace.yaml')) ||
    exists(path.join(ROOT, 'lerna.json')) ||
    exists(path.join(ROOT, 'nx.json')) ||
    exists(path.join(ROOT, 'turbo.json'));

  // Infrastructure flags
  const has_docker = files.some(f =>
    f.endsWith('Dockerfile') ||
    f.endsWith('docker-compose.yml') ||
    f.endsWith('docker-compose.yaml'),
  );

  const has_kubernetes = files.some(f => {
    if (!f.includes('k8s') && !f.endsWith('.yaml')) return false;
    try { return fs.readFileSync(f, 'utf8').includes('kind: Deployment'); } catch { return false; }
  });

  const has_terraform = files.some(f => f.endsWith('.tf'));

  const has_ci = files.some(f =>
    f.includes('.github/workflows') ||
    f.includes('.gitlab-ci') ||
    f.includes('Jenkinsfile') ||
    f.includes('bitbucket-pipelines') ||
    f.includes('circle.yml') ||
    f.includes('.circleci'),
  );

  // Framework / dependency detection
  if (pkg) {
    const deps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };

    const fw: Array<[string, string]> = [
      ['next', 'Next.js'], ['react', 'React'], ['vue', 'Vue'],
      ['svelte', 'Svelte'], ['nuxt', 'Nuxt'], ['express', 'Express'],
      ['fastify', 'Fastify'], ['hono', 'Hono'],
    ];
    if (deps['nestjs'] ?? deps['@nestjs/core']) frameworks.add('NestJS');
    if (deps['trpc']   ?? deps['@trpc/server']) frameworks.add('tRPC');
    fw.forEach(([dep, name]) => { if (deps[dep]) frameworks.add(name); });

    const db: Array<[string, string]> = [
      ['prisma', 'Prisma ORM'], ['@prisma/client', 'Prisma ORM'],
      ['drizzle-orm', 'Drizzle ORM'], ['mongoose', 'MongoDB'],
      ['pg', 'PostgreSQL'], ['postgres', 'PostgreSQL'],
      ['mysql2', 'MySQL'], ['redis', 'Redis'],
    ];
    db.forEach(([dep, name]) => { if (deps[dep]) databases.add(name); });

    const test: Array<[string, string]> = [
      ['jest', 'Jest'], ['vitest', 'Vitest'],
      ['playwright', 'Playwright'], ['cypress', 'Cypress'],
    ];
    test.forEach(([dep, name]) => { if (deps[dep]) testing.add(name); });

    if (deps['@aws-sdk/client-s3'] ?? deps['aws-sdk']) cloud.add('AWS');
    if (deps['@google-cloud/storage']) cloud.add('GCP');
    if (deps['@azure/storage-blob'])   cloud.add('Azure');
  }

  return {
    languages:  [...languages],
    frameworks: [...frameworks],
    databases:  [...databases],
    cloud:      [...cloud],
    devops:     { docker: has_docker, kubernetes: has_kubernetes, terraform: has_terraform, ci_cd: has_ci },
    testing:    [...testing],
    package_manager,
    monorepo,
    file_count_by_ext: extCount,
  };
}

// ── Security scan ─────────────────────────────────────────────────────────────

function securityScan(files: string[]): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  for (const file of files) {
    if (!CODE_EXTS.has(path.extname(file))) continue;
    let content: string;
    try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }

    for (const { pattern, severity, msg } of SECURITY_PATTERNS) {
      if (pattern.test(content)) {
        findings.push({ file: path.relative(ROOT, file), severity, finding: msg });
      }
    }
  }
  return findings;
}

// ── Structure analysis ────────────────────────────────────────────────────────

function analyseStructure(files: string[]): ProjectStructure {
  const topLevel = new Set<string>();

  for (const f of files) {
    const rel   = path.relative(ROOT, f);
    const parts = rel.split(path.sep);
    if (parts[0]) topLevel.add(parts[0]);
  }

  const lower = files.map(f => f.toLowerCase());

  return {
    top_level_dirs:    [...topLevel].filter(d => !d.startsWith('.')),
    total_files:       files.length,
    has_readme:        lower.some(f => f.includes('readme')),
    has_changelog:     lower.some(f => f.includes('changelog')),
    has_contributing:  lower.some(f => f.includes('contributing')),
    has_license:       lower.some(f => f.includes('license')),
    has_env_example:   files.some(f => f.includes('.env.example') || f.includes('.env.sample')),
    has_env_committed: files.some(f => f.endsWith('.env') && !f.includes('example') && !f.includes('sample')),
  };
}

// ── Generate agent briefs ─────────────────────────────────────────────────────

function generateBriefings(ctx: ScanContext): AgentBriefings {
  const { project_name, stack, structure, security } = ctx;
  const date = SCAN_TIME.split('T')[0];
  const crit = security.filter(r => r.severity === 'critical').length;
  const high = security.filter(r => r.severity === 'high').length;
  const med  = security.filter(r => r.severity === 'medium').length;

  return {
    cto: `# CTO Brief — ${project_name}
_Scanned: ${date}_

## Executive Summary
**Project:** ${project_name}
**Stack:** ${stack.languages.join(', ')} | ${stack.frameworks.join(', ') || 'No frameworks detected'}
**Scale:** ${structure.total_files} files | Monorepo: ${stack.monorepo ? 'Yes' : 'No'}

## Architecture Signals
- Frameworks: ${stack.frameworks.join(', ') || 'None detected'}
- Databases: ${stack.databases.join(', ') || 'None detected'}
- Cloud: ${stack.cloud.join(', ') || 'Not detected'}
- CI/CD: ${stack.devops.ci_cd ? '✓ Present' : '🔴 MISSING — priority'}
- Docker: ${stack.devops.docker ? '✓' : '✗'} | K8s: ${stack.devops.kubernetes ? '✓' : '✗'} | Terraform: ${stack.devops.terraform ? '✓' : '✗'}

## Security Posture
${crit} critical | ${high} high | ${med} medium
${security.length === 0 ? '✓ Clean scan.' : 'See CIPHER brief for full detail.'}

## Documentation
README: ${structure.has_readme ? '✓' : '✗'} | .env.example: ${structure.has_env_example ? '✓' : '✗'} | .env committed: ${structure.has_env_committed ? '⚠ YES — RISK' : '✓ No'}

## Actions
1. ${!stack.devops.ci_cd ? '🔴 Set up CI/CD immediately' : '✓ CI/CD present — review quality'}
2. ${crit + high > 0 ? `🔴 Address ${crit + high} critical/high security findings` : '✓ No critical findings'}
3. Commission full security audit (CIPHER) before next release
`,

    cyber: `# CIPHER Security Brief — ${project_name}
_Scanned: ${date}_

## Findings (${security.length} total)
${security.length === 0
  ? 'No automated findings. Manual audit still recommended.'
  : security.map(r => `### [${r.severity.toUpperCase()}] ${r.finding}\nFile: \`${r.file}\``).join('\n\n')}

## .env Risk
${structure.has_env_committed
  ? '🔴 CRITICAL: .env committed to repo. Rotate all secrets immediately.'
  : '✓ No .env detected in repository.'}

## Next Steps
1. Run SAST (Semgrep / Snyk / CodeQL)
2. Audit dependencies for CVEs
3. Review secrets management
4. Check CORS, CSP, security headers
`,

    frontend: `# PRISM Frontend Brief — ${project_name}
_Scanned: ${date}_

## Stack
Frameworks: ${stack.frameworks.filter(f => ['React','Vue','Svelte','Next.js','Nuxt'].includes(f)).join(', ') || 'None detected'}
Languages: ${stack.languages.join(', ')}
Testing: ${stack.testing.join(', ') || '🔴 None — must address'}

## Priorities
1. ${stack.testing.length === 0 ? '🔴 No testing — set up Vitest + Playwright' : '✓ Testing: ' + stack.testing.join(', ')}
2. Audit component architecture and design system
3. Accessibility audit (WCAG 2.1 AA minimum)
4. Core Web Vitals baseline
`,

    backend: `# FORGE Backend Brief — ${project_name}
_Scanned: ${date}_

## Stack
Languages: ${stack.languages.join(', ')}
Frameworks: ${stack.frameworks.filter(f => ['Express','Fastify','NestJS','Hono','tRPC'].includes(f)).join(', ') || 'Not detected'}
Databases: ${stack.databases.join(', ') || '⚠ None detected'}
Testing: ${stack.testing.join(', ') || '🔴 None — urgent'}

## Priorities
1. Map all API endpoints and document contracts
2. Input validation and sanitisation on all routes
3. Database query patterns — N+1, missing indexes
4. Error handling and logging strategy
5. Auth middleware and token lifecycle
`,

    devops: `# CONDUIT DevOps Brief — ${project_name}
_Scanned: ${date}_

| Component | Status |
|---|---|
| Docker | ${stack.devops.docker ? '✓' : '✗ Missing'} |
| Kubernetes | ${stack.devops.kubernetes ? '✓' : '✗'} |
| Terraform | ${stack.devops.terraform ? '✓' : '✗'} |
| CI/CD | ${stack.devops.ci_cd ? '✓' : '🔴 MISSING'} |

## Priorities
1. ${!stack.devops.ci_cd ? '🔴 Establish CI/CD pipeline' : 'Audit pipeline coverage'}
2. ${!stack.devops.docker ? 'Containerise application' : 'Review Docker build size'}
3. Environment parity (dev/staging/prod)
4. Monitoring and alerting baseline
`,

    'data-engineer': `# NEXUS Data Engineering Brief — ${project_name}
_Scanned: ${date}_

Detected databases: ${stack.databases.join(', ') || 'None'}

## Priorities
1. Map all data flows (inbound, internal, outbound)
2. ETL/ELT requirements
3. Schema versioning and migration strategy
4. Analytics and reporting requirements
`,

    qa: `# AEGIS QA Brief — ${project_name}
_Scanned: ${date}_

Testing: ${stack.testing.join(', ') || '🔴 NONE — critical gap'}
CI/CD: ${stack.devops.ci_cd ? 'Present (verify test gates)' : '✗ No CI'}

## Priorities
1. ${stack.testing.length === 0 ? '🔴 No testing — establish strategy immediately' : 'Audit coverage — set targets'}
2. Define quality gates for CI
3. Performance/load testing baseline
4. Release criteria (definition of done)
`,

    knowledge: `# MEMORY Knowledge Brief — ${project_name}
_Scanned: ${date}_

| Doc | Status |
|---|---|
| README | ${structure.has_readme ? '✓' : '✗'} |
| CHANGELOG | ${structure.has_changelog ? '✓' : '✗'} |
| CONTRIBUTING | ${structure.has_contributing ? '✓' : '✗'} |
| LICENSE | ${structure.has_license ? '✓' : '✗'} |
| .env.example | ${structure.has_env_example ? '✓' : '✗'} |

## Actions
1. Create project note in Obsidian vault
2. Capture first ADRs
3. Build onboarding documentation
4. Link all agent briefs from master project note
`,
  };
}

// ── Auto skill registration ──────────────────────────────────────────────────

interface SkillEntry {
  category: string;
  agents: string[];
  confidence: number;
  source: string;
}

interface SkillRegistry {
  version: string;
  last_updated: string;
  skills: Record<string, SkillEntry>;
  learning_log: Array<{ date: string; skill: string; source: string }>;
}

const SKILL_MAP: Record<string, { category: string; agents: string[] }> = {
  // Languages
  'TypeScript':   { category: 'language',  agents: ['frontend', 'backend'] },
  'JavaScript':   { category: 'language',  agents: ['frontend', 'backend'] },
  'Python':       { category: 'language',  agents: ['backend', 'data-engineer'] },
  'Go':           { category: 'language',  agents: ['backend'] },
  'Rust':         { category: 'language',  agents: ['backend'] },
  'Java':         { category: 'language',  agents: ['backend'] },
  'Ruby':         { category: 'language',  agents: ['backend'] },
  'Elixir':       { category: 'language',  agents: ['backend'] },
  // Frameworks
  'React':        { category: 'frontend',  agents: ['frontend'] },
  'Next.js':      { category: 'frontend',  agents: ['frontend', 'backend'] },
  'Vue':          { category: 'frontend',  agents: ['frontend'] },
  'Svelte':       { category: 'frontend',  agents: ['frontend'] },
  'Nuxt':         { category: 'frontend',  agents: ['frontend', 'backend'] },
  'Express':      { category: 'backend',   agents: ['backend'] },
  'Fastify':      { category: 'backend',   agents: ['backend'] },
  'NestJS':       { category: 'backend',   agents: ['backend'] },
  'Hono':         { category: 'backend',   agents: ['backend'] },
  'tRPC':         { category: 'backend',   agents: ['backend', 'frontend'] },
  // Databases
  'PostgreSQL':   { category: 'database',  agents: ['backend', 'data-engineer'] },
  'MongoDB':      { category: 'database',  agents: ['backend', 'data-engineer'] },
  'MySQL':        { category: 'database',  agents: ['backend', 'data-engineer'] },
  'Redis':        { category: 'database',  agents: ['backend'] },
  'Prisma ORM':   { category: 'orm',       agents: ['backend'] },
  'Drizzle ORM':  { category: 'orm',       agents: ['backend'] },
  // Cloud
  'AWS':          { category: 'cloud',     agents: ['cloud', 'devops'] },
  'GCP':          { category: 'cloud',     agents: ['cloud', 'devops'] },
  'Azure':        { category: 'cloud',     agents: ['cloud', 'devops'] },
  // Testing
  'Jest':         { category: 'testing',   agents: ['qa', 'tester'] },
  'Vitest':       { category: 'testing',   agents: ['qa', 'tester'] },
  'Playwright':   { category: 'testing',   agents: ['qa', 'tester'] },
  'Cypress':      { category: 'testing',   agents: ['qa', 'tester'] },
  // Infrastructure
  'Docker':       { category: 'devops',    agents: ['devops', 'cloud'] },
  'Kubernetes':   { category: 'devops',    agents: ['devops', 'cloud'] },
  'Terraform':    { category: 'devops',    agents: ['devops', 'cloud'] },
};

function registerSkillsFromStack(stack: Stack): number {
  const registryPath = path.join(LEGION_ROOT, 'core', 'skills', 'registry.json');
  const registry = readJSON<SkillRegistry>(registryPath) ?? {
    version: '1.0.0',
    last_updated: SCAN_TIME.split('T')[0]!,
    skills: {},
    learning_log: [],
  };

  const allDetected = [
    ...stack.languages,
    ...stack.frameworks,
    ...stack.databases,
    ...stack.cloud,
    ...stack.testing,
    ...(stack.devops.docker ? ['Docker'] : []),
    ...(stack.devops.kubernetes ? ['Kubernetes'] : []),
    ...(stack.devops.terraform ? ['Terraform'] : []),
  ];

  let newCount = 0;
  const today = SCAN_TIME.split('T')[0]!;

  for (const tech of allDetected) {
    const key = tech.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (registry.skills[key]) continue; // already registered

    const mapping = SKILL_MAP[tech];
    if (!mapping) continue;

    registry.skills[key] = {
      category: mapping.category,
      agents: mapping.agents,
      confidence: 0.8,
      source: 'project-learnt',
    };

    registry.learning_log.push({
      date: today,
      skill: key,
      source: `Detected by scanner in project`,
    });

    // Create skill doc
    const skillDoc = `# Skill: ${tech}
**Category:** ${mapping.category}
**Agents:** ${mapping.agents.join(', ')}
**Confidence:** 0.8
**Source:** project-learnt
**Learned:** ${today}

## What this skill covers
${tech} as detected in a scanned project.

## When to apply it
When working on projects that use ${tech}.
`;
    writeFile(path.join(LEGION_ROOT, 'core', 'skills', `${key}.md`), skillDoc);
    newCount++;
  }

  if (newCount > 0) {
    registry.last_updated = today;
    writeJSON(registryPath, registry);
  }

  return newCount;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\n${c.bold}${c.purple}`);
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   L E G I O N   P R O J E C T        ║');
  console.log('║   S C A N N E R   v 2 . 0             ║');
  console.log('║   We are many. We see everything.     ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(c.reset);

  head('IDENTIFYING PROJECT');
  let pkg: PackageJson | null = null;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as PackageJson;
  } catch { /* no package.json */ }

  const project_name = pkg?.name ?? path.basename(ROOT);
  ok(`Project: ${project_name}`);
  ok(`Root: ${ROOT}`);

  head('SCANNING FILES');
  log('Walking directory tree...');
  const files = walk(ROOT);
  ok(`Found ${files.length} files`);

  head('DETECTING STACK');
  const stack = detectStack(files, pkg);
  ok(`Languages: ${stack.languages.join(', ') || 'Unknown'}`);
  ok(`Frameworks: ${stack.frameworks.join(', ') || 'None'}`);
  ok(`Databases: ${stack.databases.join(', ') || 'None'}`);
  ok(`Package manager: ${stack.package_manager ?? 'Unknown'}`);
  if (stack.monorepo) warn('Monorepo detected');

  head('ANALYSING STRUCTURE');
  const structure = analyseStructure(files);
  ok(`Top-level: ${structure.top_level_dirs.join(', ')}`);
  if (!structure.has_readme)      warn('No README');
  if (!structure.has_env_example) warn('No .env.example');
  if (structure.has_env_committed) err('.env committed — SECURITY RISK');

  head('RUNNING SECURITY SCAN');
  const security = securityScan(files);
  if (security.length === 0) {
    ok('No automated security findings');
  } else {
    for (const r of security) {
      if (r.severity === 'critical') err(`[CRITICAL] ${r.finding} — ${r.file}`);
      else if (r.severity === 'high') warn(`[HIGH] ${r.finding} — ${r.file}`);
      else log(`[${r.severity.toUpperCase()}] ${r.finding} — ${r.file}`, c.dim);
    }
  }

  head('REGISTERING SKILLS');
  const newSkills = registerSkillsFromStack(stack);
  if (newSkills > 0) {
    ok(`${newSkills} new skill(s) registered in Legion`);
  } else {
    log('No new skills to register', c.dim);
  }

  head('READING GIT');
  let git: GitInfo = {};
  try {
    git.branch      = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT }).toString().trim();
    git.last_commit = execSync('git log -1 --pretty="%h %s"',    { cwd: ROOT }).toString().trim();
    const shortlog  = execSync('git shortlog -sn --no-merges',   { cwd: ROOT }).toString().trim();
    git.contributors = shortlog.split('\n').length;
    ok(`Branch: ${git.branch}`);
    ok(`Last commit: ${git.last_commit}`);
  } catch {
    git = { note: 'Not a git repository or git unavailable' };
    warn('Git info not available');
  }

  const context: ScanContext = { project_name, stack, structure, security, git, scan_time: SCAN_TIME };

  head('WRITING LEGION INTEL TO PROJECT');
  fs.mkdirSync(path.join(LEGION_DIR, 'briefs'), { recursive: true });
  fs.mkdirSync(path.join(LEGION_DIR, 'logs'),   { recursive: true });

  writeJSON(path.join(LEGION_DIR, 'scan.json'), context);
  ok('Wrote scan.json');

  const briefings = generateBriefings(context);
  for (const [agent, content] of Object.entries(briefings)) {
    writeFile(path.join(LEGION_DIR, 'briefs', `${agent}.md`), content ?? '');
    ok(`Brief: ${agent}`);
  }

  const masterBrief = `# Legion Master Brief — ${project_name}
_Scanned: ${SCAN_TIME}_

## Stack
- Languages: ${stack.languages.join(', ') || 'Unknown'}
- Frameworks: ${stack.frameworks.join(', ') || 'None'}
- Databases: ${stack.databases.join(', ') || 'None'}
- Testing: ${stack.testing.join(', ') || 'None'}
- Package Manager: ${stack.package_manager ?? 'Unknown'}

## Infrastructure
Docker: ${stack.devops.docker ? '✓' : '✗'} | K8s: ${stack.devops.kubernetes ? '✓' : '✗'} | Terraform: ${stack.devops.terraform ? '✓' : '✗'} | CI/CD: ${stack.devops.ci_cd ? '✓' : '✗ MISSING'}

## Security
${security.length === 0 ? '✓ No automated findings' : security.map(r => `- [${r.severity.toUpperCase()}] ${r.finding}: \`${r.file}\``).join('\n')}

## Git
${git.branch ? `Branch: ${git.branch} | Last commit: ${git.last_commit}` : 'Not a git repo'}

## Agent Briefs
${Object.keys(briefings).map(a => `- [${a}](.legion/briefs/${a}.md)`).join('\n')}

---
_Generated by Legion Scanner v2.0 (TypeScript). All agents briefed._
`;

  writeFile(path.join(LEGION_DIR, 'BRIEF.md'), masterBrief);
  ok('Wrote BRIEF.md');

  writeJSON(path.join(LEGION_DIR, 'logs', `scan-${SCAN_TIME.split('T')[0]}.json`), {
    type: 'PROJECT_SCAN', agent: 'scanner', project: project_name,
    timestamp: SCAN_TIME,
    findings: { security_count: security.length, file_count: structure.total_files, stack },
  });

  head('SCAN COMPLETE');
  console.log(`${c.bold}${c.green}`);
  console.log(`  Project:  ${project_name}`);
  console.log(`  Files:    ${structure.total_files}`);
  console.log(`  Risks:    ${security.filter(r => r.severity === 'critical').length} critical, ${security.filter(r => r.severity === 'high').length} high`);
  console.log(`  Briefs:   ${Object.keys(briefings).length} agents briefed`);
  console.log(`  Output:   .legion/`);
  console.log(c.reset);
  console.log(`${c.dim}  All agents aware. Legion is ready.${c.reset}\n`);
}

main().catch(e => { err((e as Error).message); process.exit(1); });
