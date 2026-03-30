/**
 * GreenCode AI Agent Orchestrator
 * - runAgentsParallel(projectPath, scanOutputDir): run all 4 agents in parallel
 * - normalizeToUnifiedIssues(scanOutputDir, projectId): read scan output and return UnifiedIssue[]
 */
import path from 'path';
import { runAgentsParallel } from './run-agents-parallel.js';
import { normalizeFromScanOutput } from './normalizers.js';

export { runAgentsParallel, normalizeFromScanOutput };

/**
 * Run agents in parallel then normalize to unified issues.
 * Does not run static analyzer or energy (caller does that).
 *
 * @param {string} projectPath - e.g. uploads/<id>_extracted
 * @param {string} scanOutputDir - e.g. output/<scanId>
 * @param {string} [projectId] - for context
 * @returns {{ counts: { dataStructure: number, optimization: number, maintainability: number, compliance: number }, issues: import('../shared/types.js').UnifiedIssue[] }}
 */
export async function runAndNormalize(projectPath, scanOutputDir, projectId = '') {
  const counts = await runAgentsParallel(projectPath, scanOutputDir);
  const issues = normalizeFromScanOutput(scanOutputDir, projectId || path.basename(scanOutputDir));
  return { counts, issues };
}
