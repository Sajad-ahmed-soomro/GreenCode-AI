/**
 * Normalizers: convert each agent's output format to UnifiedIssue[]
 * Uses shared/types.js UnifiedIssue shape.
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SEVERITY_MAP = { critical: 'high', high: 'high', medium: 'medium', low: 'low' };
function toSeverity(s) {
  if (!s) return 'medium';
  const v = (SEVERITY_MAP[s] || s).toLowerCase();
  return v === 'high' || v === 'medium' ? v : 'low';
}

function energySeverityFromScore(score, fallback = 'low') {
  if (typeof score !== 'number' || Number.isNaN(score)) return fallback;
  if (score >= 0.56) return 'high';
  if (score >= 0.48) return 'medium';
  return 'low';
}

function confidenceFromLevel(level, fallback = 0.75) {
  const v = String(level || '').toLowerCase();
  if (v === 'high') return 0.9;
  if (v === 'medium') return 0.8;
  if (v === 'low') return 0.65;
  return fallback;
}

function toCategory(agent, raw) {
  if (agent === 'energy') return 'energy';
  if (agent === 'optimization' || agent === 'data-structures') return 'performance';
  if (agent === 'compliance') return raw?.category === 'security' ? 'security' : 'style';
  if (agent === 'maintainability') return 'maintainability';
  return 'other';
}

/**
 * @param {string} scanOutputDir - e.g. output/<scanId>
 * @param {string} [projectId]
 * @returns {import('../shared/types.js').UnifiedIssue[]}
 */
export function normalizeFromScanOutput(scanOutputDir, projectId = '') {
  const issues = [];
  const sessionId = path.basename(scanOutputDir);

  // Data structure results
  const dsDir = path.join(scanOutputDir, 'data-structure-results');
  if (fs.existsSync(dsDir)) {
    const files = fs.readdirSync(dsDir).filter(f => f.endsWith('.report.json'));
    for (const f of files) {
      const filePath = f.replace('.report.json', '.java');
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dsDir, f), 'utf8'));
        const suggestions = data.suggestions || [];
        for (let i = 0; i < suggestions.length; i++) {
          const s = suggestions[i];
          issues.push({
            id: `ds_${sessionId}_${filePath}_${i}_${randomUUID().slice(0, 8)}`,
            filePath,
            line: s.lineNumber ?? s.line ?? 0,
            agent: 'data-structures',
            category: 'performance',
            severity: toSeverity(s.severity),
            confidence: 0.85,
            description: s.pattern || s.issueType || 'Data structure suggestion',
            explanation: s.why || '',
            recommendation: s.recommendedDataStructure || s.recommendation || '',
            fix: { type: 'refactor', autoApply: false, code: s.recommendedDataStructure },
            context: { projectId, frequency: 1 }
          });
        }
      } catch (e) {
        console.warn('normalize data-structure:', e.message);
      }
    }
  }

  // Compliance
  const compDir = path.join(scanOutputDir, 'compliance');
  if (fs.existsSync(compDir)) {
    const files = fs.readdirSync(compDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const filePath = (f.replace('.compliance.report.json', '').replace('.report.json', '').replace('.json', '')) + '.java';
      try {
        const data = JSON.parse(fs.readFileSync(path.join(compDir, f), 'utf8'));
        const list = data.issues || [];
        for (let i = 0; i < list.length; i++) {
          const s = list[i];
          issues.push({
            id: `comp_${sessionId}_${filePath}_${i}_${randomUUID().slice(0, 8)}`,
            filePath,
            line: s.lineNumber ?? s.line ?? 0,
            agent: 'compliance',
            category: toCategory('compliance', s),
            severity: toSeverity(s.severity),
            confidence: 0.9,
            description: s.message || s.description || s.type || 'Compliance issue',
            explanation: s.suggestion || '',
            recommendation: s.suggestion || s.recommendation || '',
            fix: { type: 'code', autoApply: true, code: s.suggestion },
            context: { projectId }
          });
        }
      } catch (e) {
        console.warn('normalize compliance:', e.message);
      }
    }
  }

  // Maintainability
  const maintDir = path.join(scanOutputDir, 'maintainability');
  if (fs.existsSync(maintDir)) {
    const files = fs.readdirSync(maintDir).filter(f => f.endsWith('.json') && !f.includes('global'));
    for (const f of files) {
      const filePath = (f.replace('_report.json', '').replace('.report.json', '').replace('.json', '')) + '.java';
      try {
        const data = JSON.parse(fs.readFileSync(path.join(maintDir, f), 'utf8'));
        const results = data.results || [];
        for (const r of results) {
          const sugg = (r.suggestions || [])[0];
          if (sugg) {
            issues.push({
              id: `maint_${sessionId}_${filePath}_${r.methodName}_${randomUUID().slice(0, 8)}`,
              filePath,
              line: 0,
              agent: 'maintainability',
              category: 'maintainability',
              severity: (r.maintainabilityLevel === 'poor' || r.maintainabilityLevel === 'fair') ? 'medium' : 'low',
              confidence: 0.8,
              description: sugg,
              explanation: `Method ${r.className}.${r.methodName} score: ${r.methodScore}`,
              recommendation: sugg,
              fix: { type: 'suggestion', autoApply: false },
              context: { projectId }
            });
          }
        }
      } catch (e) {
        console.warn('normalize maintainability:', e.message);
      }
    }
  }

  // Optimization
  const optDir = path.join(scanOutputDir, 'optimization-report');
  if (fs.existsSync(optDir)) {
    const files = fs.readdirSync(optDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const filePath = f.replace('.optimization.report.json', '').replace('.json', '') + '.java';
      try {
        const data = JSON.parse(fs.readFileSync(path.join(optDir, f), 'utf8'));
        const results = data.results || [];
        for (const r of results) {
          const findings = r.findings || r.issues || [];
          for (let i = 0; i < findings.length; i++) {
            const s = findings[i];
            issues.push({
              id: `opt_${sessionId}_${filePath}_${i}_${randomUUID().slice(0, 8)}`,
              filePath,
              line: s.line ?? s.lineNumber ?? 0,
              agent: 'optimization',
              category: 'performance',
              severity: toSeverity(s.severity),
              confidence: s.confidence ?? 0.8,
              description: s.message || s.description || s.ruleId || 'Optimization opportunity',
              explanation: s.suggestion || s.explanation || '',
              recommendation: s.suggestion || s.recommendation || '',
              fix: { type: 'refactor', autoApply: false, code: s.suggestion },
              context: { projectId }
            });
          }
        }
      } catch (e) {
        console.warn('normalize optimization:', e.message);
      }
    }
  }

  // Energy
  const energyDir = path.join(scanOutputDir, 'energy');
  if (fs.existsSync(energyDir)) {
    const combinedPath = path.join(energyDir, 'combined-analysis-report.json');
    const reportPath = fs.existsSync(combinedPath)
      ? combinedPath
      : path.join(energyDir, 'static-analysis-report.json');
    if (fs.existsSync(reportPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const reports = data.reports || [];
        for (const r of reports) {
          const filePath = (r.className || r.fileName || 'Unknown') + '.java';
          const energyLevel = (r.energyLevel || r.estimatedConsumption || '').toLowerCase();
          const score = Number(r.energyScore ?? r.combinedEnergyScore ?? r.staticEnergyScore);
          const severityFromLabel = energyLevel.includes('high') ? 'high' : energyLevel.includes('medium') ? 'medium' : 'low';
          const severity = energySeverityFromScore(score, severityFromLabel);

          const description =
            (Array.isArray(r.suggestions) && r.suggestions[0]) ||
            (r.methodName ? `High energy footprint detected in ${r.methodName}()` : 'Energy improvement opportunity');
          const recommendation =
            (Array.isArray(r.suggestions) && r.suggestions[0]) ||
            'Reduce nested loops and repeated heavy operations in hot paths.';
          const explanation = [
            r.reason,
            typeof score === 'number' && !Number.isNaN(score) ? `energyScore=${score.toFixed(3)}` : '',
            typeof r.medianMs === 'number' ? `median=${r.medianMs}ms` : '',
            typeof r.loopCount === 'number' ? `loops=${r.loopCount}` : '',
            typeof r.nestingDepth === 'number' ? `nesting=${r.nestingDepth}` : ''
          ].filter(Boolean).join(' | ');

          const structuralFrequency =
            1 +
            Math.max(0, Number(r.loopCount || 0)) +
            Math.max(0, Number(r.nestingDepth || 0)) +
            Math.max(0, Number(r.conditionalsCount || 0)) +
            Math.max(0, Number(r.methodCallsInsideLoop || 0));
          const benchmarkFrequency = Math.max(1, Number(r.benchmarkRuns || 1));
          const frequency = Math.max(structuralFrequency, benchmarkFrequency);

          issues.push({
            id: `energy_${sessionId}_${filePath}_${r.methodName || 'm'}_${randomUUID().slice(0, 8)}`,
            filePath,
            line: r.line ?? r.lineNumber ?? 0,
            agent: 'energy',
            category: 'energy',
            severity,
            confidence: confidenceFromLevel(r.confidenceLevel, 0.75),
            description,
            explanation,
            recommendation,
            fix: { type: 'suggestion', autoApply: false },
            context: {
              projectId,
              frequency,
              energyScore: typeof score === 'number' && !Number.isNaN(score) ? score : undefined,
              executionTimeMs: Number(r.medianMs ?? r.meanMs ?? 0) || undefined,
              loopCount: Number(r.loopCount || 0),
              nestingDepth: Number(r.nestingDepth || 0),
              cyclomatic: Number(r.cyclomatic || 0),
              benchmarkRuns: Number(r.benchmarkRuns || 0) || undefined
            }
          });
        }
      } catch (e) {
        console.warn('normalize energy:', e.message);
      }
    }
  }

  return issues;
}
