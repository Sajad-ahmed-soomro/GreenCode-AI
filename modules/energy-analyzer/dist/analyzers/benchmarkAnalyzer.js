"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJavaBenchmarkResults = loadJavaBenchmarkResults;
exports.computeBenchmarkEnergyScore = computeBenchmarkEnergyScore;
exports.mergeStaticWithBenchmarks = mergeStaticWithBenchmarks;
exports.saveEnhancedReport = saveEnhancedReport;
// src/analyzers/benchmarkAnalyzer.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Load benchmark results from a JSON file or directory
 */
function loadJavaBenchmarkResults(benchmarkPath) {
    const results = [];
    if (!fs_1.default.existsSync(benchmarkPath)) {
        throw new Error(`Benchmark path not found: ${benchmarkPath}`);
    }
    const stat = fs_1.default.statSync(benchmarkPath);
    if (stat.isFile()) {
        // Single file
        const data = JSON.parse(fs_1.default.readFileSync(benchmarkPath, 'utf8'));
        if (Array.isArray(data)) {
            results.push(...data);
        }
        else if (data.results && Array.isArray(data.results)) {
            results.push(...data.results);
        }
        else {
            results.push(data);
        }
    }
    else if (stat.isDirectory()) {
        // Directory of JSON files
        const files = fs_1.default.readdirSync(benchmarkPath)
            .filter(f => f.endsWith('.json'))
            .map(f => path_1.default.join(benchmarkPath, f));
        for (const file of files) {
            try {
                const data = JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
                if (Array.isArray(data)) {
                    results.push(...data);
                }
                else if (data.results && Array.isArray(data.results)) {
                    results.push(...data.results);
                }
                else {
                    results.push(data);
                }
            }
            catch (error) {
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
function computeBenchmarkEnergyScore(medianMs, maxExpectedMs = 100) {
    // Logarithmic scaling: 1ms ≈ 0.1, 10ms ≈ 0.3, 100ms = 1.0
    const score = Math.log10(medianMs + 1) / Math.log10(maxExpectedMs + 1);
    return Math.max(0, Math.min(1, score));
}
/**
 * Merge static analysis reports with Java benchmark results
 */
function mergeStaticWithBenchmarks(staticReports, benchmarkResults) {
    const enhancedReports = [];
    // Create benchmark lookup map (case-insensitive)
    const benchmarkMap = new Map();
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
        const enhanced = {
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
        }
        else {
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
function saveEnhancedReport(reports, outputPath, metadata) {
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
    fs_1.default.writeFileSync(outputPath, JSON.stringify(output, null, 2));
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
