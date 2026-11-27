// ── Legion Shared Types ───────────────────────────────────────────────────────

export type AgentId =
  | 'cto'
  | 'frontend'
  | 'backend'
  | 'cloud'
  | 'devops'
  | 'cyber'
  | 'qa'
  | 'tester'
  | 'reviewer'
  | 'data-engineer'
  | 'product-manager'
  | 'solutions-architect'
  | 'legal-compliance'
  | 'project-manager'
  | 'intel'
  | 'analyst'
  | 'knowledge';

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'open' | 'in-progress' | 'blocked' | 'in-review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

// ── Scanner types ─────────────────────────────────────────────────────────────

export interface DevOpsFlags {
  docker: boolean;
  kubernetes: boolean;
  terraform: boolean;
  ci_cd: boolean;
}

export interface Stack {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  devops: DevOpsFlags;
  testing: string[];
  package_manager: string | null;
  monorepo: boolean;
  file_count_by_ext: Record<string, number>;
}

export interface ProjectStructure {
  top_level_dirs: string[];
  total_files: number;
  has_readme: boolean;
  has_changelog: boolean;
  has_contributing: boolean;
  has_license: boolean;
  has_env_example: boolean;
  has_env_committed: boolean;
}

export interface SecurityFinding {
  file: string;
  severity: Severity;
  finding: string;
}

export interface GitInfo {
  branch?: string;
  last_commit?: string;
  contributors?: number;
  note?: string;
}

export interface ScanContext {
  project_name: string;
  stack: Stack;
  structure: ProjectStructure;
  security: SecurityFinding[];
  git: GitInfo;
  scan_time: string;
}

export type AgentBriefings = Partial<Record<AgentId | string, string>>;

// ── Brainstorm types ──────────────────────────────────────────────────────────

export interface BuildTask {
  id: string;
  title: string;
  agent: AgentId;
  priority: TaskPriority;
  status: TaskStatus;
  depends_on: string[];
  notes?: string;
}

export interface BuildBacklog {
  feature: string;
  session_id: string;
  created: string;
  status: 'backlog' | 'active' | 'completed';
  tasks: BuildTask[];
}

// ── Memory types ──────────────────────────────────────────────────────────────

export interface VectorEntry {
  id: string;
  type: string;
  title: string;
  content_preview: string;
  keywords: string[];
  tags: string[];
  indexed_at: string;
}

export interface VectorStore {
  version: string;
  entries: VectorEntry[];
}

export interface ScoredEntry extends VectorEntry {
  score: number;
}

export interface DailyReport {
  date: string;
  generated_at: string;
  agent: AgentId;
  summary: string;
  log_preview: string;
}

export interface MemoryConfig {
  obsidian_vault: string;
  obsidian_legion_folder: string;
  legion_root: string;
  memory_root: string;
  notion_token: string | null;
  notion_database_id: string | null;
  vector_store: string;
}

// ── Test Result types ────────────────────────────────────────────────────────

export type TestVerdict = 'pass' | 'fail' | 'skip' | 'error';
export type TestLayer = 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  layer: TestLayer;
  spec_ref: string;           // which spec requirement this tests (e.g. "PRD-P0-001", "TC-001")
  file: string;               // test file path
  function: string;           // test function or describe block name
  verdict: TestVerdict;
  duration_ms: number;
  error?: string;             // error message if fail/error
  stack_trace?: string;       // stack trace if fail/error
  assertions: number;         // total assertions in this test
  assertions_passed: number;
}

export interface TestSuite {
  id: string;
  name: string;
  layer: TestLayer;
  source_file: string;        // the source file being tested
  test_file: string;          // the test file
  agent: 'qa' | 'tester';
  cases: TestCase[];
  started_at: string;
  finished_at: string;
  duration_ms: number;
}

export interface TestCollection {
  version: string;
  feature: string;
  session_id: string;         // links back to brainstorm session
  spec_refs: {
    prd: string;              // path to PRD
    tech_spec: string;        // path to tech spec
    design_spec: string;      // path to design spec
    test_plan: string;        // path to test plan
  };
  generated_at: string;
  environment: {
    node_version: string;
    os: string;
    test_runner: string;      // vitest, jest, playwright, etc.
  };
  suites: TestSuite[];
  summary: {
    total_suites: number;
    total_cases: number;
    passed: number;
    failed: number;
    skipped: number;
    errored: number;
    coverage_percent: number | null;
    duration_ms: number;
    verdict: 'GREEN' | 'RED' | 'PARTIAL';
  };
}

// ── LIAP Protocol types ───────────────────────────────────────────────────────

export type LIAPEventType =
  | 'TASK_ASSIGN'
  | 'TASK_COMPLETE'
  | 'BRAINSTORM_CALL'
  | 'SPEC_REQUEST'
  | 'REVIEW_REQUEST'
  | 'BLOCK'
  | 'LEARN'
  | 'MEMORY_SYNC'
  | 'DAILY_REPORT';

export type LIAPPriority = 'low' | 'normal' | 'high' | 'critical';

export interface LIAPEvent {
  id: string;
  type: LIAPEventType;
  from: AgentId | 'scanner' | 'system';
  to: AgentId | 'broadcast' | 'legion';
  priority: LIAPPriority;
  timestamp: string;
  session?: string;
  project?: string;
  payload: Record<string, unknown>;
  requires_ack: boolean;
  ttl_hours: number;
}
