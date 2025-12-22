#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import { generateReportsFromASTandCFGs, collectCFGPathsFromDir } from "../core/orchestrator";
import { loadJavaBenchmarkResults, mergeStaticWithBenchmarks, saveEnhancedReport } from "../analyzers/benchmarkAnalyzer";

const program = new Command();
program.name("greencode-energy-analyze")
  .description("Generate energy/perf reports from Java ASTs + CFGs with optional runtime benchmarks")
  .version("0.3.0")
  .addHelpText('after', `

EXAMPLES:
  # Static analysis only
  $ greencode-energy-analyze -A ./ast-files -c ./cfg-files -o ./energy-reports
  
  # Combined analysis with benchmarks
  $ greencode-energy-analyze -A ./ast-files -c ./cfg-files -b ./benchmark-results.json
  
  # Generate per-method reports
  $ greencode-energy-analyze -A ./ast-files -c ./cfg-files --per-method
  
  # Include zero-energy methods
  $ greencode-energy-analyze -A ./ast-files -c ./cfg-files --include-zero

BENCHMARK FORMAT:
  [
    {
      "className": "MyClass",
      "methodName": "myMethod",
      "medianMs": 25.3,
      "meanMs": 26.1,
      "runs": 100
    }
  ]

VIEW RESULTS:
  $ cat energy-reports/summary-energy-report.json | jq '.statistics'
  $ cat energy-reports/enhanced-energy-report.json | jq '.reports[] | select(.confidenceLevel == "high")'
`);

program
  .option("-a, --ast <path>", "Path to single AST JSON file")
  .option("-A, --ast-dir <path>", "Path to directory containing AST JSON files")
  .requiredOption("-c, --cfg <path>", "Path to a CFG JSON file OR directory")
  .option("-b, --benchmark <path>", "Path to benchmark JSON file or directory (optional)")
  .option("-o, --out <path>", "Output directory for energy reports", "energy-reports")
  .option("--per-method", "Generate separate report for each method", false)
  .option("--per-class", "Generate separate report for each class", true)
  .option("--include-zero", "Include methods with zero energy score", false)
  .action(async (opts: any) => {
    console.log("🚀 GreenCode Energy Analyzer v0.3.0");
    console.log("=".repeat(70));
    
    // Handle AST inputs
    let astPaths: string[] = [];
    
    if (opts.ast) {
      astPaths = [path.resolve(opts.ast)];
      console.log(`📄 Single AST file: ${path.basename(astPaths[0])}`);
    } else if (opts.astDir) {
      const astDir = path.resolve(opts.astDir);
      
      if (!fs.existsSync(astDir)) {
        console.error(`❌ Error: AST directory not found: ${astDir}`);
        process.exit(1);
      }
      
      const astFiles = fs.readdirSync(astDir).filter(f => f.endsWith(".json"));
      
      if (astFiles.length === 0) {
        console.error(`❌ Error: No JSON files found in: ${astDir}`);
        process.exit(1);
      }
      
      astPaths = astFiles.map(f => path.join(astDir, f));
      console.log(`📁 Found ${astPaths.length} AST files`);
    } else {
      console.error("❌ Error: Either --ast or --ast-dir must be provided");
      process.exit(1);
    }

    // Handle CFG inputs
    const cfgArg = path.resolve(opts.cfg);
    let cfgPaths: string[] = [];
    
    if (!fs.existsSync(cfgArg)) {
      console.error("❌ CFG path not found:", cfgArg);
      process.exit(2);
    }
    
    const stat = fs.statSync(cfgArg);
    if (stat.isDirectory()) {
      cfgPaths = collectCFGPathsFromDir(cfgArg);
      console.log(`📁 Found ${cfgPaths.length} CFG files`);
    } else {
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
      if (!fs.existsSync(astPath)) {
        console.warn("⚠️  AST file not found:", astPath);
        errorCount++;
        continue;
      }

      try {
        console.log(`   🔄 Processing: ${path.basename(astPath)}`);
        const reports = generateReportsFromASTandCFGs(astPath, cfgPaths);
        allReports.push(...reports);
        processedCount++;
      } catch (error) {
        console.error(`   ❌ Failed: ${path.basename(astPath)}`, error);
        errorCount++;
      }
    }

    console.log(`\n   ✅ Processed ${processedCount} AST files`);
    console.log(`   📊 Generated ${allReports.length} method reports`);
    
    // Deduplicate reports
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
    
    const duplicateCount = allReports.length - deduplicatedReports.length;
    if (duplicateCount > 0) {
      console.log(`   ✅ Deduplicated: ${deduplicatedReports.length} unique methods (removed ${duplicateCount} duplicates)`);
    }

    // Filter out zero energy methods if requested
    let staticReports = deduplicatedReports;
    if (!opts.includeZero) {
      const beforeCount = staticReports.length;
      staticReports = staticReports.filter(r => r.energyScore > 0);
      const removedCount = beforeCount - staticReports.length;
      
      if (removedCount > 0) {
        console.log(`   ℹ️  Filtered out ${removedCount} methods with zero energy`);
      }
    }

    if (staticReports.length === 0) {
      console.error("❌ No methods found to analyze after filtering");
      process.exit(1);
    }

    // Create output directory
    const outputDir = path.resolve(opts.out);
    fs.mkdirSync(outputDir, { recursive: true });

    // STEP 2: Handle benchmarks (if provided)
    let finalReports = staticReports;
    let hasBenchmarks = false;
    let benchmarkResults = [];
    
    if (opts.benchmark) {
      console.log("\n📊 STEP 2: Load & Merge Benchmarks");
      console.log("-".repeat(70));
      
      try {
        const resolvedPath = path.resolve(opts.benchmark);
        console.log(`   📂 Loading from: ${resolvedPath}`);
        benchmarkResults = loadJavaBenchmarkResults(resolvedPath);
        console.log(`   ✅ Loaded ${benchmarkResults.length} benchmark results\n`);
        
        if (benchmarkResults.length > 0) {
          const enhancedReports = mergeStaticWithBenchmarks(staticReports, benchmarkResults);
          
          // Save enhanced report
          const enhancedReportPath = path.join(outputDir, "enhanced-energy-report.json");
          saveEnhancedReport(enhancedReports, enhancedReportPath, {
            astFiles: astPaths.length,
            cfgFiles: cfgPaths.length,
            benchmarkResults: benchmarkResults.length,
            deduplicationApplied: duplicateCount > 0,
            duplicatesRemoved: duplicateCount
          });
          
          finalReports = enhancedReports;
          hasBenchmarks = true;
        }
      } catch (error) {
        console.error(`   ❌ Failed to load benchmarks:`, error);
        console.log("   ℹ️  Continuing with static analysis only...\n");
      }
    } else {
      console.log("\n📊 STEP 2: Benchmarks");
      console.log("-".repeat(70));
      console.log("   ℹ️  No benchmarks provided - using static analysis only\n");
    }

    // STEP 3: Generate reports
    console.log("📈 STEP 3: Generate Reports");
    console.log("-".repeat(70));

    // Helper to get the right energy score
    const getEnergyScore = (r: any) => r.combinedEnergyScore ?? r.energyScore;

    // Generate per-class reports
    if (opts.perClass) {
      console.log("\n   📝 Generating per-class reports...");
      const classesByName = new Map<string, any[]>();
      
      for (const report of finalReports) {
        if (!classesByName.has(report.className)) {
          classesByName.set(report.className, []);
        }
        classesByName.get(report.className)!.push(report);
      }
      
      for (const [className, classReports] of classesByName.entries()) {
        const classReportPath = path.join(outputDir, `${className}-energy-report.json`);
        
        const classStats = {
          totalEnergy: classReports.reduce((sum, r) => sum + getEnergyScore(r), 0),
          avgEnergy: classReports.reduce((sum, r) => sum + getEnergyScore(r), 0) / classReports.length,
          maxEnergy: Math.max(...classReports.map(r => getEnergyScore(r))),
          minEnergy: Math.min(...classReports.map(r => getEnergyScore(r))),
          methodsWithLoops: classReports.filter(r => r.loopCount > 0).length,
          methodsWithRecursion: classReports.filter(r => r.recursion).length,
          highEnergyMethods: classReports.filter(r => getEnergyScore(r) > 0.5).length,
          withBenchmarks: classReports.filter((r: any) => r.confidenceLevel === "high").length
        };
        
        const classOutput = {
          generatedAt: new Date().toISOString(),
          className: className,
          totalMethods: classReports.length,
          hasBenchmarks: hasBenchmarks,
          statistics: classStats,
          reports: classReports.sort((a, b) => getEnergyScore(b) - getEnergyScore(a))
        };
        
        fs.writeFileSync(classReportPath, JSON.stringify(classOutput, null, 2));
        console.log(`      ✓ ${className}: ${classReports.length} methods, avg: ${classStats.avgEnergy.toFixed(3)}`);
      }
      
      console.log(`   ✅ Generated ${classesByName.size} class reports`);
    }

    // Generate per-method reports
    if (opts.perMethod) {
      console.log("\n   📝 Generating per-method reports...");
      for (const report of finalReports) {
        const methodReportPath = path.join(
          outputDir, 
          `${report.className}_${report.methodName}-energy.json`
        );
        fs.writeFileSync(methodReportPath, JSON.stringify(report, null, 2));
      }
      console.log(`   ✅ Generated ${finalReports.length} method reports`);
    }

    // Generate summary report
    const summaryReportPath = path.join(outputDir, "summary-energy-report.json");
    
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
      hasBenchmarks: hasBenchmarks,
      benchmarkCount: benchmarkResults.length,
      benchmarkCoverage: hasBenchmarks 
        ? `${((finalReports.filter((r: any) => r.confidenceLevel === "high").length / finalReports.length) * 100).toFixed(1)}%`
        : "0%",
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
          highEnergy: finalReports.filter((r: any) => getEnergyScore(r) > 0.5).length,
          mediumEnergy: finalReports.filter((r: any) => {
            const score = getEnergyScore(r);
            return score >= 0.3 && score <= 0.5;
          }).length,
          lowEnergy: finalReports.filter((r: any) => getEnergyScore(r) < 0.3).length
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
          totalDBCalls: finalReports.reduce((sum, r) => sum + (r.dbCalls || 0), 0)
        },
        benchmarks: hasBenchmarks ? {
          methodsWithBenchmarks: finalReports.filter((r: any) => r.confidenceLevel === "high").length,
          methodsStaticOnly: finalReports.filter((r: any) => !r.confidenceLevel || r.confidenceLevel === "low").length,
          avgExecutionTime: finalReports.filter((r: any) => r.medianMs).length > 0
            ? finalReports.filter((r: any) => r.medianMs).reduce((sum, r: any) => sum + r.medianMs, 0) / 
              finalReports.filter((r: any) => r.medianMs).length
            : 0
        } : null
      },
      topEnergyConsumers: finalReports
        .sort((a, b) => getEnergyScore(b) - getEnergyScore(a))
        .slice(0, 10)
        .map(r => ({
          className: r.className,
          methodName: r.methodName,
          energyScore: getEnergyScore(r),
          staticEnergy: (r as any).staticEnergyScore || r.energyScore,
          runtimeEnergy: (r as any).runtimeEnergyScore,
          executionTime: (r as any).medianMs,
          loopCount: r.loopCount,
          nestingDepth: r.nestingDepth,
          hasBenchmark: (r as any).confidenceLevel === "high"
        })),
      reports: finalReports
    };

    fs.writeFileSync(summaryReportPath, JSON.stringify(summary, null, 2));
    console.log(`   ✅ Generated summary report`);

    // Final summary
    console.log("\n" + "=".repeat(70));
    console.log("✨ Analysis Complete!");
    console.log("=".repeat(70));
    console.log(`📂 Output directory: ${outputDir}`);
    console.log(`\n📊 Analysis Summary:`);
    console.log(`   • Total methods: ${finalReports.length}`);
    console.log(`   • Classes analyzed: ${summary.totalClasses}`);
    console.log(`   • Average energy score: ${summary.statistics.energy.average.toFixed(3)}`);
    console.log(`   • High energy methods: ${summary.statistics.distribution.highEnergy}`);
    console.log(`   • Medium energy methods: ${summary.statistics.distribution.mediumEnergy}`);
    console.log(`   • Low energy methods: ${summary.statistics.distribution.lowEnergy}`);
    
    if (hasBenchmarks && summary.statistics.benchmarks) {
      console.log(`\n⏱️  Benchmark Integration:`);
      console.log(`   • Methods with benchmarks: ${summary.statistics.benchmarks.methodsWithBenchmarks}`);
      console.log(`   • Benchmark coverage: ${summary.benchmarkCoverage}`);
      console.log(`   • Avg execution time: ${summary.statistics.benchmarks.avgExecutionTime.toFixed(2)}ms`);
    }
    
    if (duplicateCount > 0) {
      console.log(`\n🔧 Deduplication:`);
      console.log(`   • Duplicates removed: ${duplicateCount}`);
    }
    
    console.log("\n📖 Reports Generated:");
    console.log(`   • summary-energy-report.json (comprehensive statistics)`);
    if (hasBenchmarks) {
      console.log(`   • enhanced-energy-report.json (static + benchmark data)`);
    }
    if (opts.perClass) {
      console.log(`   • *-energy-report.json (${summary.totalClasses} class reports)`);
    }
    if (opts.perMethod) {
      console.log(`   • *_*-energy.json (${finalReports.length} method reports)`);
    }
    
    // Show top energy consumers
    if (summary.topEnergyConsumers.length > 0) {
      console.log("\n🔥 Top 5 Energy Consumers:");
      summary.topEnergyConsumers.slice(0, 5).forEach((method, i) => {
        const benchmarkInfo = method.hasBenchmark 
          ? ` | ${method.executionTime?.toFixed(2)}ms`
          : " | no benchmark";
        console.log(`   ${i + 1}. ${method.className}.${method.methodName}`);
        console.log(`      Energy: ${method.energyScore.toFixed(3)}${benchmarkInfo}`);
      });
    }
    
    if (errorCount > 0) {
      console.warn(`\n⚠️  Warning: ${errorCount} files failed to process`);
    }
    
    console.log("\n✅ Done!");
    console.log(`💡 Tip: View detailed analysis in ${outputDir}/summary-energy-report.json`);
    
    if (hasBenchmarks) {
      console.log(`💡 Combined results available in ${outputDir}/enhanced-energy-report.json`);
    } else {
      console.log(`💡 Add --benchmark <path> to include runtime performance data`);
    }
  });

program.parse(process.argv);