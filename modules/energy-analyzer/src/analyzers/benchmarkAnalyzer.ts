// src/analyzers/javaBenchmarkImporter.ts
import fs from "fs";
import path from "path";

/**
 * Import benchmark results from external Java benchmark tools (JMH, custom runners)
 * Expected format:
 * {
 *   "className": "SpecialMoves",
 *   "methodName": "isCheckmate",
 *   "medianMs": 12.5,
 *   "meanMs": 13.2,
 *   "p95Ms": 15.8,
 *   "minMs": 11.2,
 *   "maxMs": 18.3,
 *   "runs": 100
 * }
 */

export type JavaBenchmarkResult = {
  className: string;
  methodName: string;
  medianMs: number;
  meanMs: number;
  p95Ms?: number;
  minMs?: number;
  maxMs?: number;
  stdDev?: number;
  runs: number;
  benchmarkTool?: string; // e.g., "JMH", "custom"
};

/**
 * Load benchmark results from a JSON file or directory
 */
export function loadJavaBenchmarkResults(benchmarkPath: string): JavaBenchmarkResult[] {
  const results: JavaBenchmarkResult[] = [];

  if (!fs.existsSync(benchmarkPath)) {
    throw new Error(`Benchmark path not found: ${benchmarkPath}`);
  }

  const stat = fs.statSync(benchmarkPath);

  if (stat.isFile()) {
    // Single file
    const data = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
    if (Array.isArray(data)) {
      results.push(...data);
    } else if (data.results && Array.isArray(data.results)) {
      results.push(...data.results);
    } else {
      results.push(data);
    }
  } else if (stat.isDirectory()) {
    // Directory of JSON files
    const files = fs.readdirSync(benchmarkPath)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(benchmarkPath, f));

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (Array.isArray(data)) {
          results.push(...data);
        } else if (data.results && Array.isArray(data.results)) {
          results.push(...data.results);
        } else {
          results.push(data);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to parse benchmark file ${file}:`, error);
      }
    }
  }

  return results;
}

/**
 * Normalize benchmark time to energy score (0-1)
 */
export function computeBenchmarkEnergyScore(
  medianMs: number,
  maxExpectedMs: number = 100
): number {
  // Logarithmic scaling for better distribution
  // 1ms = ~0.1, 10ms = ~0.3, 100ms = 1.0
  const score = Math.log10(medianMs + 1) / Math.log10(maxExpectedMs + 1);
  return Math.max(0, Math.min(1, score));
}

/**
 * Enhanced report combining static analysis with runtime benchmarks
 */
export type EnhancedMethodReport = {
  className: string;
  methodName: string;
  
  // Static Analysis
  loopCount: number;
  loops: string[];
  nestingDepth: number;
  cyclomatic: number;
  conditionalsCount: number;
  methodCalls: number;
  objectCreations: number;
  ioCalls: number;
  dbCalls: number;
  recursion: boolean;
  
  // Static Scores
  staticCpuScore: number;
  staticMemScore: number;
  staticIoScore: number;
  staticEnergyScore: number;
  
  // Original scores (for compatibility)
  cpuScore: number;
  memScore: number;
  ioScore: number;
  energyScore: number;
  
  // Runtime Benchmarks (optional)
  medianMs?: number;
  meanMs?: number;
  p95Ms?: number;
  minMs?: number;
  maxMs?: number;
  stdDev?: number;
  benchmarkRuns?: number;
  benchmarkTool?: string;
  runtimeEnergyScore?: number;
  
  // Combined Score
  combinedEnergyScore: number;
  confidenceLevel: "high" | "medium" | "low"; // high = has benchmarks, low = static only
};

/**
 * Merge static analysis reports with Java benchmark results
 */
export function mergeStaticWithBenchmarks(
  staticReports: any[],
  benchmarkResults: JavaBenchmarkResult[]
): EnhancedMethodReport[] {
  const enhancedReports: EnhancedMethodReport[] = [];

  // Create benchmark lookup map
  const benchmarkMap = new Map<string, JavaBenchmarkResult>();
  for (const benchmark of benchmarkResults) {
    const key = `${benchmark.className}.${benchmark.methodName}`.toLowerCase();
    benchmarkMap.set(key, benchmark);
  }

  console.log(` Static reports: ${staticReports.length}`);
  console.log(` Benchmark results: ${benchmarkResults.length}`);

  for (const staticReport of staticReports) {
    const key = `${staticReport.className}.${staticReport.methodName}`.toLowerCase();
    const benchmark = benchmarkMap.get(key);

    const enhanced: EnhancedMethodReport = {
        className: staticReport.className,
        methodName: staticReport.methodName,

        // Static analysis data
        loopCount: staticReport.loopCount,
        loops: staticReport.loops,
        nestingDepth: staticReport.nestingDepth,
        cyclomatic: staticReport.cyclomatic,
        conditionalsCount: staticReport.conditionalsCount,
        methodCalls: staticReport.methodCalls,
        objectCreations: staticReport.objectCreations,
        ioCalls: staticReport.ioCalls,
        dbCalls: staticReport.dbCalls,
        recursion: staticReport.recursion,

        // Static scores
        staticCpuScore: staticReport.cpuScore,
        staticMemScore: staticReport.memScore,
        staticIoScore: staticReport.ioScore,
        staticEnergyScore: staticReport.energyScore,

        // Default combined score to static only
        combinedEnergyScore: staticReport.energyScore,
        confidenceLevel: "low",
        cpuScore: 0,
        memScore: 0,
        ioScore: 0,
        energyScore: 0
    };

    // Merge benchmark data if available
    if (benchmark) {
      enhanced.medianMs = benchmark.medianMs;
      enhanced.meanMs = benchmark.meanMs;
      enhanced.p95Ms = benchmark.p95Ms;
      enhanced.minMs = benchmark.minMs;
      enhanced.maxMs = benchmark.maxMs;
      enhanced.stdDev = benchmark.stdDev;
      enhanced.benchmarkRuns = benchmark.runs;
      enhanced.benchmarkTool = benchmark.benchmarkTool;
      
      // Compute runtime energy score
      enhanced.runtimeEnergyScore = computeBenchmarkEnergyScore(benchmark.medianMs);
      
      // Combined score: 60% static + 40% runtime
      enhanced.combinedEnergyScore = 
        0.6 * staticReport.energyScore + 
        0.4 * enhanced.runtimeEnergyScore;
      
      enhanced.confidenceLevel = "high";
      
      console.log(`✅ Merged: ${enhanced.className}.${enhanced.methodName} - Runtime: ${benchmark.medianMs.toFixed(2)}ms`);
    } else {
      console.log(`⚠️  No benchmark for: ${enhanced.className}.${enhanced.methodName} (using static only)`);
    }

    enhancedReports.push(enhanced);
  }

  return enhancedReports;
}

/**
 * Save enhanced report to file
 */
export function saveEnhancedReport(
  reports: EnhancedMethodReport[],
  outputPath: string,
  metadata?: any
) {
  const output = {
    generatedAt: new Date().toISOString(),
    totalMethods: reports.length,
    methodsWithBenchmarks: reports.filter(r => r.confidenceLevel === "high").length,
    methodsStaticOnly: reports.filter(r => r.confidenceLevel === "low").length,
    ...metadata,
    reports
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Enhanced report saved to: ${outputPath}`);
  console.log(`   Total methods: ${output.totalMethods}`);
  console.log(`   With benchmarks: ${output.methodsWithBenchmarks}`);
  console.log(`   Static only: ${output.methodsStaticOnly}`);
}