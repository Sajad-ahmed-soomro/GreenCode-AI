#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const orchestrator_1 = require("../core/orchestrator");
const program = new commander_1.Command();
program.name("greencode-energy-analyze")
    .description("Generate energy/perf reports from Java ASTs + CFGs")
    .version("0.2.0");
program
    .option("-a, --ast <path>", "Path to single AST JSON file")
    .option("-A, --ast-dir <path>", "Path to directory containing AST JSON files")
    .requiredOption("-c, --cfg <path>", "Path to a CFG JSON file OR directory")
    .option("-b, --benchmark <path>", "Path to existing benchmark JSON file or directory")
    .option("-o, --out <path>", "Output directory for energy reports", "energy-reports")
    .option("--per-method", "Generate separate report for each method", false)
    .option("--per-class", "Generate separate report for each class", true)
    .option("--include-zero", "Include methods with zero energy score", false)
    .action(async (opts) => {
    console.log("🚀 GreenCode Energy Analyzer");
    console.log("=".repeat(70));
    // Handle AST inputs
    let astPaths = [];
    if (opts.ast) {
        astPaths = [path_1.default.resolve(opts.ast)];
        console.log(`📄 Single AST file: ${path_1.default.basename(astPaths[0])}`);
    }
    else if (opts.astDir) {
        const astDir = path_1.default.resolve(opts.astDir);
        if (!fs_1.default.existsSync(astDir)) {
            console.error(`❌ Error: AST directory not found: ${astDir}`);
            process.exit(1);
        }
        const astFiles = fs_1.default.readdirSync(astDir).filter(f => f.endsWith(".json"));
        if (astFiles.length === 0) {
            console.error(`❌ Error: No JSON files found in: ${astDir}`);
            process.exit(1);
        }
        astPaths = astFiles.map(f => path_1.default.join(astDir, f));
        console.log(`📁 Found ${astPaths.length} AST files`);
    }
    else {
        console.error("❌ Error: Either --ast or --ast-dir must be provided");
        process.exit(1);
    }
    // Handle CFG inputs
    const cfgArg = path_1.default.resolve(opts.cfg);
    let cfgPaths = [];
    if (!fs_1.default.existsSync(cfgArg)) {
        console.error("❌ CFG path not found:", cfgArg);
        process.exit(2);
    }
    const stat = fs_1.default.statSync(cfgArg);
    if (stat.isDirectory()) {
        cfgPaths = (0, orchestrator_1.collectCFGPathsFromDir)(cfgArg);
        console.log(`📁 Found ${cfgPaths.length} CFG files`);
    }
    else {
        cfgPaths = [cfgArg];
        console.log(`📄 Single CFG file`);
    }
    console.log("=".repeat(70));
    console.log();
    // STEP 1: Generate static analysis reports
    console.log("📊 STEP 1: Static Analysis");
    console.log("-".repeat(70));
    const allReports = [];
    let processedCount = 0;
    let errorCount = 0;
    for (const astPath of astPaths) {
        if (!fs_1.default.existsSync(astPath)) {
            console.warn("⚠️  AST file not found:", astPath);
            errorCount++;
            continue;
        }
        try {
            console.log(`   🔄 Processing: ${path_1.default.basename(astPath)}`);
            const reports = (0, orchestrator_1.generateReportsFromASTandCFGs)(astPath, cfgPaths);
            allReports.push(...reports);
            processedCount++;
        }
        catch (error) {
            console.error(`   ❌ Failed: ${path_1.default.basename(astPath)}`, error);
            errorCount++;
        }
    }
    console.log(`\n   ✅ Processed ${processedCount} AST files`);
    console.log(`   📊 Generated ${allReports.length} method reports`);
    // 🔥 VALIDATION: Check for duplicates
    const methodKeys = allReports.map(r => `${r.className}.${r.methodName}`);
    const uniqueKeys = new Set(methodKeys);
    const duplicateCount = methodKeys.length - uniqueKeys.size;
    if (duplicateCount > 0) {
        console.warn(`   ⚠️  WARNING: Detected ${duplicateCount} duplicate method reports!`);
        console.warn(`   ℹ️  This should not happen with the fixed orchestrator.`);
        // Show which methods are duplicated
        const keyCount = new Map();
        methodKeys.forEach(key => keyCount.set(key, (keyCount.get(key) || 0) + 1));
        const duplicates = Array.from(keyCount.entries()).filter(([_, count]) => count > 1);
        console.warn(`   📋 Duplicated methods:`);
        duplicates.slice(0, 5).forEach(([key, count]) => {
            console.warn(`      • ${key} (appears ${count} times)`);
        });
        if (duplicates.length > 5) {
            console.warn(`      ... and ${duplicates.length - 5} more`);
        }
    }
    if (allReports.length === 0) {
        console.error("❌ No methods found to analyze");
        process.exit(1);
    }
    // 🔥 FIX: Deduplicate reports by keeping the one with highest energy score
    const deduplicatedReports = [];
    const reportMap = new Map();
    for (const report of allReports) {
        const key = `${report.className}.${report.methodName}`;
        const existing = reportMap.get(key);
        if (!existing || report.energyScore > existing.energyScore) {
            reportMap.set(key, report);
        }
    }
    deduplicatedReports.push(...reportMap.values());
    if (duplicateCount > 0) {
        console.log(`   ✅ Deduplicated: ${deduplicatedReports.length} unique methods (removed ${duplicateCount} duplicates)`);
    }
    // Filter out zero energy methods if requested
    let finalReports = deduplicatedReports;
    if (!opts.includeZero) {
        const beforeCount = finalReports.length;
        finalReports = finalReports.filter(r => r.energyScore > 0);
        const removedCount = beforeCount - finalReports.length;
        if (removedCount > 0) {
            console.log(`   ℹ️  Filtered out ${removedCount} methods with zero energy (use --include-zero to keep them)`);
        }
    }
    // Create output directory
    const outputDir = path_1.default.resolve(opts.out);
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    // STEP 2: Handle benchmarks (if provided)
    let benchmarkResults = [];
    if (opts.benchmark) {
        console.log("\n📊 STEP 2: Load Benchmarks");
        console.log("-".repeat(70));
        try {
            // Dynamically import if benchmark module exists
            const { loadJavaBenchmarkResults, mergeStaticWithBenchmarks, saveEnhancedReport } = await Promise.resolve().then(() => __importStar(require("../analyzers/benchmarkAnalyzer")));
            const resolvedPath = path_1.default.resolve(opts.benchmark);
            console.log(`   📂 Loading from: ${resolvedPath}`);
            benchmarkResults = loadJavaBenchmarkResults(resolvedPath);
            console.log(`   ✅ Loaded ${benchmarkResults.length} benchmark results`);
            // Merge with static analysis
            if (benchmarkResults.length > 0) {
                console.log("\n   🔗 Merging static analysis with benchmark data...");
                const enhancedReports = mergeStaticWithBenchmarks(finalReports, benchmarkResults);
                const mergedCount = enhancedReports.filter(r => r.confidenceLevel === "high").length;
                console.log(`   ✅ Merged ${mergedCount}/${enhancedReports.length} methods with benchmarks`);
                // Save enhanced report
                const enhancedReportPath = path_1.default.join(outputDir, "enhanced-energy-report.json");
                saveEnhancedReport(enhancedReports, enhancedReportPath, {
                    astFiles: astPaths.length,
                    cfgFiles: cfgPaths.length,
                    benchmarkResults: benchmarkResults.length,
                    deduplicationApplied: duplicateCount > 0,
                    duplicatesRemoved: duplicateCount
                });
                // Use enhanced reports for further processing
                finalReports = enhancedReports;
            }
        }
        catch (error) {
            console.error(`   ❌ Failed to load benchmarks:`, error);
            console.log("   ℹ️  Continuing with static analysis only...");
        }
    }
    else {
        console.log("\n📊 STEP 2: Benchmarks");
        console.log("-".repeat(70));
        console.log("   ℹ️  No benchmarks provided - using static analysis only");
    }
    // STEP 3: Generate reports
    console.log("\n📈 STEP 3: Generate Reports");
    console.log("-".repeat(70));
    // Generate per-class reports
    if (opts.perClass) {
        console.log("\n   📝 Generating per-class reports...");
        const classesByName = new Map();
        for (const report of finalReports) {
            if (!classesByName.has(report.className)) {
                classesByName.set(report.className, []);
            }
            classesByName.get(report.className).push(report);
        }
        for (const [className, classReports] of classesByName.entries()) {
            const classReportPath = path_1.default.join(outputDir, `${className}-energy-report.json`);
            // Calculate class-level statistics
            const classStats = {
                totalEnergy: classReports.reduce((sum, r) => sum + (r.energyScore || 0), 0),
                avgEnergy: classReports.reduce((sum, r) => sum + (r.energyScore || 0), 0) / classReports.length,
                maxEnergy: Math.max(...classReports.map(r => r.energyScore || 0)),
                minEnergy: Math.min(...classReports.map(r => r.energyScore || 0)),
                methodsWithLoops: classReports.filter(r => r.loopCount > 0).length,
                methodsWithRecursion: classReports.filter(r => r.recursion).length,
                highEnergyMethods: classReports.filter(r => (r.energyScore || 0) > 0.5).length
            };
            const classOutput = {
                generatedAt: new Date().toISOString(),
                className: className,
                totalMethods: classReports.length,
                hasBenchmarks: classReports.some((r) => r.confidenceLevel === "high"),
                statistics: classStats,
                reports: classReports
            };
            fs_1.default.writeFileSync(classReportPath, JSON.stringify(classOutput, null, 2));
            console.log(`      ✓ ${className}: ${classReports.length} methods, avg energy: ${classStats.avgEnergy.toFixed(3)}`);
        }
        console.log(`   ✅ Generated ${classesByName.size} class reports`);
    }
    // Generate per-method reports
    if (opts.perMethod) {
        console.log("\n   📝 Generating per-method reports...");
        for (const report of finalReports) {
            const methodReportPath = path_1.default.join(outputDir, `${report.className}_${report.methodName}-energy.json`);
            fs_1.default.writeFileSync(methodReportPath, JSON.stringify(report, null, 2));
        }
        console.log(`   ✅ Generated ${finalReports.length} method reports`);
    }
    // Helper functions for type-safe access
    const getEnergyScore = (r) => r.combinedEnergyScore ?? r.energyScore;
    // Generate summary report
    const summaryReportPath = path_1.default.join(outputDir, "summary-energy-report.json");
    const energyScores = finalReports.map(r => getEnergyScore(r));
    const totalEnergy = energyScores.reduce((sum, score) => sum + score, 0);
    const avgEnergy = finalReports.length > 0 ? totalEnergy / finalReports.length : 0;
    const maxEnergy = finalReports.length > 0 ? Math.max(...energyScores) : 0;
    const minEnergy = finalReports.length > 0 ? Math.min(...energyScores) : 0;
    const summary = {
        generatedAt: new Date().toISOString(),
        totalClasses: new Set(finalReports.map(r => r.className)).size,
        totalMethods: finalReports.length,
        astFiles: astPaths.length,
        cfgFiles: cfgPaths.length,
        hasBenchmarks: benchmarkResults.length > 0,
        benchmarkCount: benchmarkResults.length,
        deduplicationInfo: {
            applied: duplicateCount > 0,
            duplicatesRemoved: duplicateCount,
            uniqueMethods: finalReports.length
        },
        statistics: {
            energy: {
                total: parseFloat(totalEnergy.toFixed(3)),
                average: parseFloat(avgEnergy.toFixed(3)),
                max: parseFloat(maxEnergy.toFixed(3)),
                min: parseFloat(minEnergy.toFixed(3))
            },
            distribution: {
                highEnergy: finalReports.filter((r) => getEnergyScore(r) > 0.5).length,
                mediumEnergy: finalReports.filter((r) => {
                    const score = getEnergyScore(r);
                    return score >= 0.3 && score <= 0.5;
                }).length,
                lowEnergy: finalReports.filter((r) => getEnergyScore(r) < 0.3).length
            },
            complexity: {
                methodsWithLoops: finalReports.filter(r => r.loopCount > 0).length,
                methodsWithRecursion: finalReports.filter(r => r.recursion).length,
                avgLoopCount: finalReports.reduce((sum, r) => sum + r.loopCount, 0) / finalReports.length,
                avgNestingDepth: finalReports.reduce((sum, r) => sum + r.nestingDepth, 0) / finalReports.length,
                maxNestingDepth: Math.max(...finalReports.map(r => r.nestingDepth))
            },
            io: {
                methodsWithIO: finalReports.filter(r => r.ioCalls > 0).length,
                methodsWithDB: finalReports.filter(r => r.dbCalls > 0).length,
                totalIOCalls: finalReports.reduce((sum, r) => sum + r.ioCalls, 0),
                totalDBCalls: finalReports.reduce((sum, r) => sum + r.dbCalls, 0)
            },
            benchmarks: {
                methodsWithBenchmarks: finalReports.filter((r) => r.confidenceLevel === "high").length,
                methodsStaticOnly: finalReports.filter((r) => !r.confidenceLevel || r.confidenceLevel === "low").length
            }
        },
        topEnergyConsumers: finalReports
            .sort((a, b) => getEnergyScore(b) - getEnergyScore(a))
            .slice(0, 10)
            .map(r => ({
            className: r.className,
            methodName: r.methodName,
            energyScore: getEnergyScore(r),
            cpuScore: r.cpuScore,
            loopCount: r.loopCount,
            nestingDepth: r.nestingDepth
        })),
        reports: finalReports
    };
    fs_1.default.writeFileSync(summaryReportPath, JSON.stringify(summary, null, 2));
    console.log(`   ✅ Generated summary report`);
    // Final summary
    console.log("\n" + "=".repeat(70));
    console.log("✨ Analysis Complete!");
    console.log("=".repeat(70));
    console.log(`📂 Output directory: ${outputDir}`);
    console.log(`📊 Analysis summary:`);
    console.log(`   • Total methods: ${finalReports.length}`);
    console.log(`   • Classes analyzed: ${summary.totalClasses}`);
    console.log(`   • Average energy score: ${summary.statistics.energy.average}`);
    console.log(`   • High energy methods: ${summary.statistics.distribution.highEnergy}`);
    console.log(`   • Medium energy methods: ${summary.statistics.distribution.mediumEnergy}`);
    console.log(`   • Low energy methods: ${summary.statistics.distribution.lowEnergy}`);
    if (benchmarkResults.length > 0) {
        console.log(`   • Methods with benchmarks: ${summary.statistics.benchmarks.methodsWithBenchmarks}`);
    }
    if (duplicateCount > 0) {
        console.log(`   • Duplicates removed: ${duplicateCount}`);
    }
    console.log("\n📖 Reports generated:");
    console.log(`   • summary-energy-report.json (with statistics)`);
    if (opts.perClass) {
        console.log(`   • *-energy-report.json (${summary.totalClasses} class reports)`);
    }
    if (opts.perMethod) {
        console.log(`   • *_*-energy.json (${finalReports.length} method reports)`);
    }
    if (benchmarkResults.length > 0) {
        console.log(`   • enhanced-energy-report.json (with benchmark data)`);
    }
    // Show top energy consumers
    if (summary.topEnergyConsumers.length > 0) {
        console.log("\n🔥 Top 5 Energy Consumers:");
        summary.topEnergyConsumers.slice(0, 5).forEach((method, i) => {
            console.log(`   ${i + 1}. ${method.className}.${method.methodName}`);
            console.log(`      Energy: ${method.energyScore.toFixed(3)}, Loops: ${method.loopCount}, Nesting: ${method.nestingDepth}`);
        });
    }
    if (errorCount > 0) {
        console.warn(`\n⚠️  Warning: ${errorCount} files failed to process`);
    }
    console.log("\n✅ Done!");
    console.log(`\n💡 Tip: View detailed analysis in ${outputDir}/summary-energy-report.json`);
});
program.parse(process.argv);
