/**
 * Refactoring Engine Adapter
 * - Input: UnifiedIssue[] from orchestrator
 * - Converts to refactoring-engine Issue format (issues.json)
 * - Optionally calls Python classifier or Go engine; for now we generate prioritized list and simple patches in JS
 * - Output: prioritized fixes with diff/suggestion (compatible with engine output)
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_DIR = path.resolve(__dirname, '../../modules/refactoring-engine/engine');

/**
 * Convert UnifiedIssue to refactoring-engine Issue shape
 * @param {import('../../shared/types.js').UnifiedIssue} u
 * @returns {{ id: string, filePath: string, line: number, type: string, severity: string, description: string, analyzer: string, suggestions: string[], fixConfidence: number, canAutoFix: boolean }}
 */
function toEngineIssue(u) {
  return {
    id: u.id,
    filePath: u.filePath,
    line: u.line ?? 0,
    type: `${u.agent}_${u.category}`,
    severity: u.severity,
    description: u.description,
    analyzer: u.agent,
    suggestions: [u.recommendation].filter(Boolean),
    fixConfidence: u.confidence,
    canAutoFix: u.fix?.autoApply ?? false
  };
}

/**
 * Prioritize: high severity first, then by confidence, then by agent (energy/optimization before style)
 */
const AGENT_PRIORITY = { energy: 0, optimization: 1, 'data-structures': 2, maintainability: 3, compliance: 4 };
const SEV_PRIORITY = { high: 0, medium: 1, low: 2 };

function prioritize(issues) {
  return [...issues].sort((a, b) => {
    const sev = (SEV_PRIORITY[a.severity] ?? 2) - (SEV_PRIORITY[b.severity] ?? 2);
    if (sev !== 0) return sev;
    const ap = AGENT_PRIORITY[a.agent] ?? 9;
    const bp = AGENT_PRIORITY[b.agent] ?? 9;
    if (ap !== bp) return ap - bp;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });
}

/**
 * Build a simple patch entry from UnifiedIssue (no Go/Python required for basic flow)
 * @param {import('../../shared/types.js').UnifiedIssue} u
 * @returns {{ issueId: string, filePath: string, line: number, severity: string, description: string, recommendation: string, diff?: string, code?: string, autoApply: boolean, confidence: number }}
 */
function toPatch(u) {
  const diff = u.fix?.diff || (u.fix?.code ? `+ ${u.fix.code}` : null);
  return {
    issueId: u.id,
    filePath: u.filePath,
    line: u.line,
    severity: u.severity,
    description: u.description,
    recommendation: u.recommendation,
    explanation: u.explanation,
    diff: diff || undefined,
    code: u.fix?.code,
    autoApply: u.fix?.autoApply ?? false,
    confidence: u.confidence,
    agent: u.agent,
    category: u.category
  };
}

/**
 * @param {import('../../shared/types.js').UnifiedIssue[]} unifiedIssues
 * @param {{ useGoEngine?: boolean, issuesJsonPath?: string }} [options]
 * @returns {Promise<{ prioritized: import('../../shared/types.js').UnifiedIssue[], patches: Array<ReturnType<typeof toPatch>>, enginePatches?: any[] }>}
 */
export async function runRefactoringAdapter(unifiedIssues, options = {}) {
  const prioritized = prioritize(unifiedIssues);
  const patches = prioritized.map(toPatch);

  if (options.useGoEngine && unifiedIssues.length > 0) {
    const engineIssues = unifiedIssues.map(toEngineIssue);
    const issuesPath = options.issuesJsonPath || path.join(ENGINE_DIR, 'issues_input.json');
    await fs.mkdir(path.dirname(issuesPath), { recursive: true });
    await fs.writeFile(issuesPath, JSON.stringify(engineIssues, null, 2), 'utf8');
    const bin = path.join(ENGINE_DIR, 'bin', 'engine');
    const cmdPath = path.join(ENGINE_DIR, 'cmd', 'engine');
    if (await fileExists(cmdPath + '.go') || await fileExists(bin)) {
      try {
        const enginePatches = await runGoEngine(ENGINE_DIR, issuesPath);
        if (enginePatches && enginePatches.length) return { prioritized, patches, enginePatches };
      } catch (e) {
        console.warn('Refactoring Go engine not runnable:', e.message);
      }
    }
  }

  return { prioritized, patches };
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function runGoEngine(cwd, issuesPath) {
  return new Promise((resolve, reject) => {
    const bin = path.join(cwd, 'bin', 'engine');
    const args = [];
    const child = spawn(bin, args, {
      cwd,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let out = '';
    let err = '';
    child.stdout?.on('data', (d) => { out += d; });
    child.stderr?.on('data', (d) => { err += d; });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(err || `exit ${code}`));
        return;
      }
      const advancedPath = path.join(cwd, 'advanced_patches.json');
      fs.readFile(advancedPath, 'utf8').then(JSON.parse).then(resolve).catch(() => resolve([]));
    });
    child.on('error', reject);
  });
}

export { toEngineIssue, toPatch, prioritize };
