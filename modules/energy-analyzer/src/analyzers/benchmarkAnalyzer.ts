// src/analyzers/benchmarkAnalyzer.ts
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
 * Uses logarithmic scaling for better distribution
 */
export function computeBenchmarkEnergyScore(
  medianMs: number,
  maxExpectedMs: number = 100
): number {
  // Logarithmic scaling: 1ms ≈ 0.1, 10ms ≈ 0.3, 100ms = 1.0
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
  
  // Static Scores (preserved from original analysis)
  staticCpuScore: number;
  staticMemScore: number;
  staticIoScore: number;
  staticEnergyScore: number;
  
  // Backward compatibility scores
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
  confidenceLevel: "high" | "medium" | "low";
};

/**
 * Merge static analysis reports with Java benchmark results
 */
export function mergeStaticWithBenchmarks(
  staticReports: any[],
  benchmarkResults: JavaBenchmarkResult[]
): EnhancedMethodReport[] {
  const enhancedReports: EnhancedMethodReport[] = [];

  // Create benchmark lookup map (case-insensitive)
  const benchmarkMap = new Map<string, JavaBenchmarkResult>();
  for (const benchmark of benchmarkResults) {
    const key = `${benchmark.className}.${benchmark.methodName}`.toLowerCase();
    benchmarkMap.set(key, benchmark);
  }

  console.log(`📊 Merging Analysis:`);
  console.log(`   Static reports: ${staticReports.length}`);
  console.log(`   Benchmark results: ${benchmarkResults.length}`);
  console.log();

  let mergedCount = 0;
  let staticOnlyCount = 0;

  for (const staticReport of staticReports) {
    const key = `${staticReport.className}.${staticReport.methodName}`.toLowerCase();
    const benchmark = benchmarkMap.get(key);

    const enhanced: EnhancedMethodReport = {
      className: staticReport.className,
      methodName: staticReport.methodName,

      // Static analysis data
      loopCount: staticReport.loopCount || 0,
      loops: staticReport.loops || [],
      nestingDepth: staticReport.nestingDepth || 1,
      cyclomatic: staticReport.cyclomatic || 1,
      conditionalsCount: staticReport.conditionalsCount || 0,
      methodCalls: staticReport.methodCalls || 0,
      objectCreations: staticReport.objectCreations || 0,
      ioCalls: staticReport.ioCalls || 0,
      dbCalls: staticReport.dbCalls || 0,
      recursion: staticReport.recursion || false,

      // Preserve static scores
      staticCpuScore: staticReport.cpuScore || 0,
      staticMemScore: staticReport.memScore || 0,
      staticIoScore: staticReport.ioScore || 0,
      staticEnergyScore: staticReport.energyScore || 0,

      // Default combined score to static only
      combinedEnergyScore: staticReport.energyScore || 0,
      confidenceLevel: "low",
      
      // Backward compatibility
      cpuScore: staticReport.cpuScore || 0,
      memScore: staticReport.memScore || 0,
      ioScore: staticReport.ioScore || 0,
      energyScore: staticReport.energyScore || 0
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
      enhanced.benchmarkTool = benchmark.benchmarkTool || "Unknown";
      
      // Compute runtime energy score from benchmark timing
      enhanced.runtimeEnergyScore = computeBenchmarkEnergyScore(benchmark.medianMs);
      
      // Combined score: weighted average of static (60%) and runtime (40%)
      enhanced.combinedEnergyScore = 
        0.6 * enhanced.staticEnergyScore + 
        0.4 * enhanced.runtimeEnergyScore;
      
      // Update backward compatibility scores with combined values
      enhanced.energyScore = enhanced.combinedEnergyScore;
      
      enhanced.confidenceLevel = "high";
      mergedCount++;
      
      console.log(`   ✅ ${enhanced.className}.${enhanced.methodName}`);
      console.log(`      Runtime: ${benchmark.medianMs.toFixed(2)}ms | Static: ${enhanced.staticEnergyScore.toFixed(3)} | Combined: ${enhanced.combinedEnergyScore.toFixed(3)}`);
    } else {
      staticOnlyCount++;
      console.log(`   ⚠️  ${enhanced.className}.${enhanced.methodName} (static only)`);
    }

    enhancedReports.push(enhanced);
  }

  console.log();
  console.log(`📊 Merge Summary:`);
  console.log(`   Merged with benchmarks: ${mergedCount}`);
  console.log(`   Static only: ${staticOnlyCount}`);

  return enhancedReports;
}

/**
 * Save enhanced report to file with comprehensive metadata
 */
export function saveEnhancedReport(
  reports: EnhancedMethodReport[],
  outputPath: string,
  metadata?: any
) {
  const highConfidence = reports.filter(r => r.confidenceLevel === "high");
  const lowConfidence = reports.filter(r => r.confidenceLevel === "low");
  
  // Calculate statistics
  const stats = {
    energy: {
      avgStatic: reports.reduce((sum, r) => sum + r.staticEnergyScore, 0) / reports.length,
      avgRuntime: highConfidence.length > 0 
        ? highConfidence.reduce((sum, r) => sum + (r.runtimeEnergyScore || 0), 0) / highConfidence.length 
        : 0,
      avgCombined: reports.reduce((sum, r) => sum + r.combinedEnergyScore, 0) / reports.length,
    },
    timing: highConfidence.length > 0 ? {
      avgMedian: highConfidence.reduce((sum, r) => sum + (r.medianMs || 0), 0) / highConfidence.length,
      maxMedian: Math.max(...highConfidence.map(r => r.medianMs || 0)),
      minMedian: Math.min(...highConfidence.map(r => r.medianMs || 0)),
    } : null,
    distribution: {
      high: reports.filter(r => r.combinedEnergyScore > 0.5).length,
      medium: reports.filter(r => r.combinedEnergyScore >= 0.3 && r.combinedEnergyScore <= 0.5).length,
      low: reports.filter(r => r.combinedEnergyScore < 0.3).length,
    }
  };

  const output = {
    generatedAt: new Date().toISOString(),
    totalMethods: reports.length,
    methodsWithBenchmarks: highConfidence.length,
    methodsStaticOnly: lowConfidence.length,
    coveragePercentage: ((highConfidence.length / reports.length) * 100).toFixed(1) + "%",
    statistics: stats,
    ...metadata,
    reports: reports.sort((a, b) => b.combinedEnergyScore - a.combinedEnergyScore)
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log();
  console.log(`💾 Enhanced Report Saved`);
  console.log(`   Location: ${outputPath}`);
  console.log(`   Total methods: ${output.totalMethods}`);
  console.log(`   With benchmarks: ${output.methodsWithBenchmarks} (${output.coveragePercentage})`);
  console.log(`   Static only: ${output.methodsStaticOnly}`);
  console.log();
  console.log(`📊 Energy Statistics:`);
  console.log(`   Avg Static Energy: ${stats.energy.avgStatic.toFixed(3)}`);
  if (stats.energy.avgRuntime > 0) {
    console.log(`   Avg Runtime Energy: ${stats.energy.avgRuntime.toFixed(3)}`);
  }
  console.log(`   Avg Combined Energy: ${stats.energy.avgCombined.toFixed(3)}`);
  
  if (stats.timing) {
    console.log();
    console.log(`⏱️  Runtime Statistics:`);
    console.log(`   Avg Execution Time: ${stats.timing.avgMedian.toFixed(2)}ms`);
    console.log(`   Range: ${stats.timing.minMedian.toFixed(2)}ms - ${stats.timing.maxMedian.toFixed(2)}ms`);
  }
}

// Add this function before the saveEnhancedReport function in the benchmarkAnalyzer section

/**
 * Calculate correlation between static energy scores and benchmark times
 */
export function calculateCorrelation(
  staticReports: any[],
  benchmarkResults: JavaBenchmarkResult[]
): {
  correlationCoefficient: number;
  pairedCount: number;
  insights: string[];
  confidence: "high" | "medium" | "low";
} {
  // Create lookup map for benchmark results
  const benchmarkMap = new Map<string, number>();
  for (const b of benchmarkResults) {
    const key = `${b.className}.${b.methodName}`.toLowerCase();
    benchmarkMap.set(key, b.medianMs);
  }

  // Find methods that have both static analysis and benchmark data
  const pairs: { static: number; runtime: number }[] = [];
  
  for (const report of staticReports) {
    const key = `${report.className}.${report.methodName}`.toLowerCase();
    const benchmarkTime = benchmarkMap.get(key);
    
    if (benchmarkTime !== undefined && report.energyScore > 0) {
      pairs.push({
        static: report.energyScore,
        runtime: benchmarkTime
      });
    }
  }

  if (pairs.length < 2) {
    return {
      correlationCoefficient: 0,
      pairedCount: pairs.length,
      insights: ["Insufficient data points for correlation analysis"],
      confidence: "low"
    };
  }

  // Calculate Pearson correlation coefficient
  const n = pairs.length;
  
  // Calculate means
  const meanStatic = pairs.reduce((sum, p) => sum + p.static, 0) / n;
  const meanRuntime = pairs.reduce((sum, p) => sum + p.runtime, 0) / n;
  
  // Calculate correlation components
  let numerator = 0;
  let denomStatic = 0;
  let denomRuntime = 0;
  
  for (const p of pairs) {
    const staticDiff = p.static - meanStatic;
    const runtimeDiff = p.runtime - meanRuntime;
    
    numerator += staticDiff * runtimeDiff;
    denomStatic += staticDiff * staticDiff;
    denomRuntime += runtimeDiff * runtimeDiff;
  }
  
  const denominator = Math.sqrt(denomStatic * denomRuntime);
  const correlation = denominator === 0 ? 0 : numerator / denominator;
  
  // Clamp between -1 and 1
  const correlationCoefficient = Math.max(-1, Math.min(1, correlation));
  
  // Generate insights
  const insights: string[] = [];
  
  if (Math.abs(correlationCoefficient) > 0.7) {
    insights.push("Strong correlation between static analysis and runtime performance");
  } else if (Math.abs(correlationCoefficient) > 0.3) {
    insights.push("Moderate correlation between static analysis and runtime performance");
  } else {
    insights.push("Weak correlation between static analysis and runtime performance");
  }
  
  if (correlationCoefficient > 0) {
    insights.push("Higher static energy scores generally indicate longer execution times");
  } else if (correlationCoefficient < 0) {
    insights.push("Inverse relationship: higher static scores may indicate shorter execution times");
  }
  
  // Determine confidence level
  let confidence: "high" | "medium" | "low" = "low";
  if (pairs.length >= 10) {
    confidence = "high";
  } else if (pairs.length >= 5) {
    confidence = "medium";
  }
  
  insights.push(`Based on ${pairs.length} methods with benchmark data`);
  
  return {
    correlationCoefficient,
    pairedCount: pairs.length,
    insights,
    confidence
  };
}