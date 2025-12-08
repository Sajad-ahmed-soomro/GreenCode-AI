"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJavaBenchmarkResults = loadJavaBenchmarkResults;
exports.computeBenchmarkEnergyScore = computeBenchmarkEnergyScore;
exports.mergeStaticWithBenchmarks = mergeStaticWithBenchmarks;
exports.saveEnhancedReport = saveEnhancedReport;
// src/analyzers/javaBenchmarkImporter.ts
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
 */
function computeBenchmarkEnergyScore(medianMs, maxExpectedMs = 100) {
    // Logarithmic scaling for better distribution
    // 1ms = ~0.1, 10ms = ~0.3, 100ms = 1.0
    const score = Math.log10(medianMs + 1) / Math.log10(maxExpectedMs + 1);
    return Math.max(0, Math.min(1, score));
}
/**
 * Merge static analysis reports with Java benchmark results
 */
function mergeStaticWithBenchmarks(staticReports, benchmarkResults) {
    const enhancedReports = [];
    // Create benchmark lookup map
    const benchmarkMap = new Map();
    for (const benchmark of benchmarkResults) {
        const key = `${benchmark.className}.${benchmark.methodName}`.toLowerCase();
        benchmarkMap.set(key, benchmark);
    }
    console.log(`📊 Static reports: ${staticReports.length}`);
    console.log(`📊 Benchmark results: ${benchmarkResults.length}`);
    for (const staticReport of staticReports) {
        const key = `${staticReport.className}.${staticReport.methodName}`.toLowerCase();
        const benchmark = benchmarkMap.get(key);
        const enhanced = {
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
        }
        else {
            console.log(`⚠️  No benchmark for: ${enhanced.className}.${enhanced.methodName} (using static only)`);
        }
        enhancedReports.push(enhanced);
    }
    return enhancedReports;
}
/**
 * Save enhanced report to file
 */
function saveEnhancedReport(reports, outputPath, metadata) {
    const output = {
        generatedAt: new Date().toISOString(),
        totalMethods: reports.length,
        methodsWithBenchmarks: reports.filter(r => r.confidenceLevel === "high").length,
        methodsStaticOnly: reports.filter(r => r.confidenceLevel === "low").length,
        ...metadata,
        reports
    };
    fs_1.default.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Enhanced report saved to: ${outputPath}`);
    console.log(`   Total methods: ${output.totalMethods}`);
    console.log(`   With benchmarks: ${output.methodsWithBenchmarks}`);
    console.log(`   Static only: ${output.methodsStaticOnly}`);
}
