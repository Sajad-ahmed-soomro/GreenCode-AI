/**
 * Runs Data Structure, Compliance, Maintainability, and Optimization agents in parallel.
 * Static analyzer and Energy analyzer are run by the gateway (static first, energy after this).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runDataStructureAgent } from '../modules/Multi_Agent/data_structure/data_structure_runner.js';
import { runOptimizationAgent } from '../modules/Multi_Agent/optimization/run_optimization_agent.js';
import { runMaintainabilityAgent } from '../modules/Multi_Agent/maintainability_agent/dist/maintainabilityAgent.js';
import { runComplianceAgent } from '../modules/Multi_Agent/compliance/dist/run_compliance.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} projectPath - e.g. uploads/<id>_extracted
 * @param {string} scanOutputDir - e.g. output/<scanId>
 * @returns {Promise<{ dataStructure: number, optimization: number, maintainability: number, compliance: number }>}
 */
export async function runAgentsParallel(projectPath, scanOutputDir) {
  const samplesDir = path.join(projectPath, 'samples');
  const astDir = path.join(scanOutputDir, 'ast');

  if (!fs.existsSync(astDir)) {
    throw new Error(`AST directory not found: ${astDir}. Run static analyzer first.`);
  }

  const dsResultsDir = path.join(scanOutputDir, 'data-structure-results');
  const optReportDir = path.join(scanOutputDir, 'optimization-report');
  const maintOutDir = path.join(scanOutputDir, 'maintainability');
  const complianceOutDir = path.join(scanOutputDir, 'compliance');

  const samplesExist = fs.existsSync(samplesDir);
  const javaFiles = samplesExist ? fs.readdirSync(samplesDir).filter(f => f.endsWith('.java')) : [];

  const runDataStructure = () => {
    if (javaFiles.length === 0) return Promise.resolve({ totalAnalyzed: 0 });
    return Promise.resolve(runDataStructureAgent(samplesDir, astDir, dsResultsDir));
  };

  const runOptimization = () => {
    if (javaFiles.length === 0) return Promise.resolve(0);
    return Promise.resolve(runOptimizationAgent(samplesDir, astDir, optReportDir));
  };

  const runMaintainability = () => {
    return Promise.resolve(runMaintainabilityAgent(astDir, samplesDir, maintOutDir));
  };

  const runCompliance = () => {
    if (javaFiles.length === 0) return Promise.resolve(0);
    return Promise.resolve(runComplianceAgent(samplesDir, astDir, complianceOutDir));
  };

  const [dataStructure, optimization, maintainability, compliance] = await Promise.all([
    runDataStructure(),
    runOptimization(),
    runMaintainability(),
    runCompliance()
  ]);

  return {
    dataStructure: dataStructure.totalAnalyzed ?? 0,
    optimization: typeof optimization === 'number' ? optimization : 0,
    maintainability: typeof maintainability === 'number' ? maintainability : 0,
    compliance: typeof compliance === 'number' ? compliance : 0
  };
}
