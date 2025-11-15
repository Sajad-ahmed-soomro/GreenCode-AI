#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import { generateReportsFromASTandCFGs, collectCFGPathsFromDir } from "../core/orchestrator";

const program = new Command();
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
  .action(async (opts: any) => {
    console.log("🚀 GreenCode Energy Analyzer");
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
    
    // 🔥 VALIDATION: Check for duplicates
    const methodKeys = allReports.map(r => `${r.className}.${r.methodName}`);
    const uniqueKeys = new Set(methodKeys);
    const duplicateCount = methodKeys.length - uniqueKeys.size;
    
    if (duplicateCount > 0) {
      console.warn(`   ⚠️  WARNING: Detected ${duplicateCount} duplicate method reports!`);
      console.warn(`   ℹ️  This should not happen with the fixed orchestrator.`);
      
      // Show which methods are duplicated
      const keyCount = new Map<string, number>();
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
    const outputDir = path.resolve(opts.out);
    fs.mkdirSync(outputDir, { recursive: true });

    // STEP 2: Handle benchmarks (if provided)
    let benchmarkResults = [];
    
    if (opts.benchmark) {
      console.log("\n📊 STEP 2: Load Benchmarks");
      console.log("-".repeat(70));
      
      try {
        // Dynamically import if benchmark module exists
        const { loadJavaBenchmarkResults, mergeStaticWithBenchmarks, saveEnhancedReport } = 
          await import("../analyzers/benchmarkAnalyzer");
        
        const resolvedPath = path.resolve(opts.benchmark);
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
          const enhancedReportPath = path.join(outputDir, "enhanced-energy-report.json");
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
      } catch (error) {
        console.error(`   ❌ Failed to load benchmarks:`, error);
        console.log("   ℹ️  Continuing with static analysis only...");
      }
    } else {
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
      const classesByName = new Map<string, any[]>();
      
      for (const report of finalReports) {
        if (!classesByName.has(report.className)) {
          classesByName.set(report.className, []);
        }
        classesByName.get(report.className)!.push(report);
      }
      
      for (const [className, classReports] of classesByName.entries()) {
        const classReportPath = path.join(outputDir, `${className}-energy-report.json`);
        
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
          hasBenchmarks: classReports.some((r: any) => r.confidenceLevel === "high"),
          statistics: classStats,
          reports: classReports
        };
        
        fs.writeFileSync(classReportPath, JSON.stringify(classOutput, null, 2));
        console.log(`      ✓ ${className}: ${classReports.length} methods, avg energy: ${classStats.avgEnergy.toFixed(3)}`);
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

    // Helper functions for type-safe access
    const getEnergyScore = (r: any) => r.combinedEnergyScore ?? r.energyScore;

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
          totalDBCalls: finalReports.reduce((sum, r) => sum + r.dbCalls, 0)
        },
        benchmarks: {
          methodsWithBenchmarks: finalReports.filter((r: any) => r.confidenceLevel === "high").length,
          methodsStaticOnly: finalReports.filter((r: any) => !r.confidenceLevel || r.confidenceLevel === "low").length
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

    fs.writeFileSync(summaryReportPath, JSON.stringify(summary, null, 2));
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