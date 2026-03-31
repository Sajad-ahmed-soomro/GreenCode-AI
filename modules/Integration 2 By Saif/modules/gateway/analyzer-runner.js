import { spawn } from "child_process";
import path from "path";
import fs from "fs";
// modules/gateway/analyzer-runner.js
import { runDataStructureAgent } from "../Multi_Agent/data_structure/data_structure_runner.js";
import { runOptimizationAgent } from "../Multi_Agent/optimization/run_optimization_agent.js";
import { runMaintainabilityAgent } from "../Multi_Agent/maintainability_agent/dist/maintainabilityAgent.js";
import { runComplianceAgent } from "../Multi_Agent/compliance/dist/run_compliance.js";



/**
 * Run energy analyzer on AST and CFG directories
 */


export async function runEnergyAnalyzer(
  astDir, 
  cfgDir, 
  scanOutputDir, 
  scanId, 
  reports, 
  sendResponse,
  options = {}
) {
  const { 
    benchmarkPath = null,
    runBenchmarks = false,
    mockBenchmarks = false,
    sourceCodePath = null
  } = options;

  const energyAnalyzerPath = path.join(process.cwd(), "../energy-analyzer");
  const energyCliPath = path.join(energyAnalyzerPath, "dist/cli/cli.js");
  const energySrcPath = path.join(energyAnalyzerPath, "src/cli/cli.ts");

  // Check if compilation is needed
  const needsCompilation = !fs.existsSync(energyCliPath) || 
    (fs.existsSync(energySrcPath) && 
     fs.statSync(energySrcPath).mtime > fs.statSync(energyCliPath).mtime);

  if (needsCompilation) {
    try {
      const buildProc = spawn("npm", ["run", "build"], {
        cwd: energyAnalyzerPath,
        stdio: "inherit",
        shell: true
      });

      await new Promise((resolve, reject) => {
        buildProc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Build failed with code ${code}`));
        });
        buildProc.on("error", reject);
      });
    } catch (error) {
      console.warn(`⚠️  Build failed: ${error.message}`);
    }
  }

  if (!fs.existsSync(energyCliPath)) {
    return sendResponse({
      status: "done_no_energy_cli",
      scanId,
      reports,
      message: "Analysis completed but energy analyzer not available",
      summary: {
        totalIssues: reports.length,
        hasEnergyAnalysis: false
      }
    });
  }

  // Validate AST directory
  if (!fs.existsSync(astDir)) {
    return sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "AST directory not found",
      summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
    });
  }

  const astFiles = fs.readdirSync(astDir).filter(f => f.endsWith(".json"));
  
  if (astFiles.length === 0) {
    return sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "No AST JSON files found",
      summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
    });
  }

  // Validate CFG directory
  if (!fs.existsSync(cfgDir)) {
    return sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "CFG directory not found",
      summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
    });
  }

  const cfgFiles = fs.readdirSync(cfgDir).filter(f => f.endsWith(".json"));

  // ✅ AUTO-FIND JAVA SOURCE CODE IN UPLOADS FOLDER
  let javaSourceDir = sourceCodePath;
  
  if (runBenchmarks && !javaSourceDir) {
    // Try to automatically find Java source in uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads");
    
    if (fs.existsSync(uploadsDir)) {
      console.log(`🔍 Searching for Java source code in uploads folder: ${uploadsDir}`);
      
      // Look for Java files or src folders
      const possibleJavaDirs = [
        uploadsDir,
        path.join(uploadsDir, "src"),
        path.join(uploadsDir, "src/main/java"),
        path.join(uploadsDir, "java"),
        path.join(uploadsDir, "source")
      ];
      
      for (const dir of possibleJavaDirs) {
        if (fs.existsSync(dir)) {
          const javaFiles = getAllJavaFiles(dir);
          if (javaFiles.length > 0) {
            javaSourceDir = dir;
            console.log(`✅ Found ${javaFiles.length} Java files in: ${dir}`);
            break;
          }
        }
      }
      
      if (!javaSourceDir) {
        console.warn(`⚠️  No Java source files found in uploads folder`);
        console.log(`   Falling back to mock benchmarks...`);
        mockBenchmarks = true;
        runBenchmarks = false;
      }
    } else {
      console.warn(`⚠️  Uploads folder not found: ${uploadsDir}`);
    }
  }

  const energyDir = path.join(scanOutputDir, "energy");
  fs.mkdirSync(energyDir, { recursive: true });

  // Build args for energy analyzer
  const args = [
    "--ast-dir", astDir,
    "--cfg", cfgDir,
    "--out", energyDir,
    "--per-class"
  ];

  // Handle benchmark options
  let hasBenchmarks = false;
  let benchmarkSource = "none";
  
  if (runBenchmarks && javaSourceDir) {
    // ✅ Auto-run benchmarks with found Java source code
    if (!fs.existsSync(javaSourceDir)) {
      console.error(`❌ Java source code directory not found: ${javaSourceDir}`);
      console.log("ℹ️  Falling back to mock benchmarks...");
      args.push("--mock-benchmarks");
      hasBenchmarks = true;
      benchmarkSource = "mock (fallback)";
    } else {
      // Verify it contains Java files
      const javaFiles = getAllJavaFiles(javaSourceDir);
      if (javaFiles.length === 0) {
        console.warn(`⚠️  No Java files found in: ${javaSourceDir}`);
        console.log("ℹ️  Trying to find Java files in subdirectories...");
        
        // Search recursively
        const recursiveJavaFiles = [];
        function findJavaFilesRecursive(dir) {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              findJavaFilesRecursive(fullPath);
            } else if (entry.name.endsWith('.java')) {
              recursiveJavaFiles.push(fullPath);
            }
          }
        }
        
        try {
          findJavaFilesRecursive(javaSourceDir);
          if (recursiveJavaFiles.length > 0) {
            console.log(`✅ Found ${recursiveJavaFiles.length} Java files recursively`);
            // Use the original directory - CLI will search recursively
          } else {
            console.log("ℹ️  No Java files found, using mock benchmarks");
            args.push("--mock-benchmarks");
            hasBenchmarks = true;
            benchmarkSource = "mock (no Java files)";
            javaSourceDir = null;
          }
        } catch (error) {
          console.error(`❌ Error searching for Java files: ${error.message}`);
        }
      }
      
      if (javaSourceDir) {
        args.push("--run-benchmarks", "--source-code", javaSourceDir);
        hasBenchmarks = true;
        benchmarkSource = "auto-generated";
        console.log(`🚀 Auto-running benchmarks with Java source from: ${javaSourceDir}`);
        console.log(`📁 Found ${javaFiles.length} Java files`);
      }
    }
  } else if (mockBenchmarks) {
    args.push("--mock-benchmarks");
    hasBenchmarks = true;
    benchmarkSource = "mock";
    console.log(`🎭 Using mock benchmark data...`);
  } else if (benchmarkPath && fs.existsSync(benchmarkPath)) {
    args.push("--benchmark", benchmarkPath);
    hasBenchmarks = true;
    benchmarkSource = "provided file";
    console.log(`📊 Using existing benchmarks: ${benchmarkPath}`);
  }

  console.log(`📝 Running energy analyzer with ${hasBenchmarks ? `benchmarks (${benchmarkSource})` : 'static analysis only'}`);

  const energyProc = spawn("node", [energyCliPath, ...args], {
    cwd: path.join(process.cwd(), "../energy-analyzer"),
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    env: { ...process.env, PATH: process.env.PATH }
  });

  let stdoutData = "";
  let stderrData = "";

  // Capture output for debugging
  energyProc.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });
  
  energyProc.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  energyProc.on("error", (error) => {
    console.error(`❌ Energy analyzer spawn error:`, error);
    sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "Energy analyzer failed to spawn",
      energyError: error.message,
      summary: {
        totalIssues: reports.length,
        hasEnergyAnalysis: false
      }
    });
  });

  energyProc.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ Energy analyzer failed with exit code ${code}`);
      if (stderrData) {
        console.error(`📋 Error output:`, stderrData);
      }
    }
    
    const energyReports = [];
    let combinedReport = null;
    let staticReport = null;
    let enhancedReport = null;
    let summaryData = null;

    try {
      const files = fs.readdirSync(energyDir);
      console.log(`📁 Files in energy directory:`, files);
      
      // ✅ Read the COMBINED report first (this is the main one)
      const combinedPath = path.join(energyDir, "combined-analysis-report.json");
      if (fs.existsSync(combinedPath)) {
        combinedReport = JSON.parse(fs.readFileSync(combinedPath, "utf8"));
        console.log(`✅ Found combined report: ${combinedReport.metadata?.analysisMode || 'unknown'}`);
        
        // Extract all method reports from combined report
        if (combinedReport.reports && Array.isArray(combinedReport.reports)) {
          energyReports.push(...combinedReport.reports);
        }
      } else {
        console.warn(`⚠️  Combined report not found at: ${combinedPath}`);
      }
      
      // ✅ Read static report
      const staticPath = path.join(energyDir, "static-analysis-report.json");
      if (fs.existsSync(staticPath)) {
        staticReport = JSON.parse(fs.readFileSync(staticPath, "utf8"));
        console.log(`✅ Found static report: ${staticReport.totalMethods || 0} methods`);
        
        // If no combined report, use static reports
        if (energyReports.length === 0 && staticReport.reports) {
          energyReports.push(...staticReport.reports);
        }
      }
      
      // ✅ Read enhanced report (if benchmarks were used)
      const enhancedPath = path.join(energyDir, "enhanced-energy-report.json");
      if (fs.existsSync(enhancedPath)) {
        enhancedReport = JSON.parse(fs.readFileSync(enhancedPath, "utf8"));
        console.log(`✅ Found enhanced report with ${enhancedReport.methodsWithBenchmarks || 0} benchmarked methods`);
        
        // If no combined report, use enhanced reports
        if (energyReports.length === 0 && enhancedReport.reports) {
          energyReports.push(...enhancedReport.reports);
        }
      }
      
      // ✅ Fallback - read class-specific reports (for backward compatibility)
      if (energyReports.length === 0) {
        const classReports = files
          .filter(f => f.includes('-energy-report.json') && !f.includes('summary-'))
          .map(f => {
            try {
              const content = JSON.parse(fs.readFileSync(path.join(energyDir, f), "utf8"));
              return content;
            } catch (error) {
              console.warn(`⚠️  Failed to parse ${f}:`, error);
              return null;
            }
          })
          .filter(cr => cr !== null);

        classReports.forEach(cr => {
          if (cr.reports && Array.isArray(cr.reports)) {
            energyReports.push(...cr.reports);
          }
        });
      }
      
      // ✅ Prepare summary data from combined report
      if (combinedReport) {
        summaryData = {
          totalClasses: combinedReport.summary?.totalClasses || 0,
          totalMethods: combinedReport.summary?.totalMethods || 0,
          analysisMode: combinedReport.metadata?.analysisMode || 'static_only',
          hasBenchmarks: combinedReport.metadata?.dataSources?.hasBenchmarks || false,
          benchmarkCoverage: combinedReport.metadata?.dataSources?.benchmarkCoverage || "0%",
          energyOverview: combinedReport.summary?.energyOverview || {},
          correlation: combinedReport.correlationAnalysis || null,
          statistics: combinedReport.statistics || {}
        };
      }
      
    } catch (error) {
      console.error(`❌ Error reading energy reports:`, error);
    }

    const hasEnergyAnalysis = energyReports.length > 0;

    // ✅ Enhanced response with ALL data
    sendResponse({
      status: hasEnergyAnalysis ? "done" : "done_energy_failed",
      scanId,
      reports,
      energyReports,           // All method-level reports
      combinedAnalysis: combinedReport,  // ✅ The complete combined report
      staticAnalysis: staticReport,      // ✅ Static-only data
      enhancedAnalysis: enhancedReport,  // ✅ Benchmark-enhanced data
      energySummary: summaryData,        // ✅ Summary from combined report
      hasBenchmarkData: hasBenchmarks && (combinedReport?.metadata?.dataSources?.hasBenchmarks || false),
      message: hasEnergyAnalysis ?
        `Energy analysis completed: ${energyReports.length} methods analyzed${hasBenchmarks ? ' (with benchmarks)' : ''}` :
        "Energy analysis failed or no reports generated",
      summary: {
        totalIssues: reports.length,
        hasEnergyAnalysis,
        energyMethodsAnalyzed: energyReports.length,
        hasBenchmarks: hasBenchmarks && (combinedReport?.metadata?.dataSources?.hasBenchmarks || false),
        analysisMode: combinedReport?.metadata?.analysisMode || 'static_only',
        benchmarkCoverage: combinedReport?.metadata?.dataSources?.benchmarkCoverage || "0%"
      }
    });
  });
}

// Helper function to get all Java files
function getAllJavaFiles(dir) {
  const javaFiles = [];
  
  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.java')) {
        javaFiles.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return javaFiles;
}
// ✅ Example usage with benchmarks:
// await runEnergyAnalyzer(
//   astDir, 
//   cfgDir, 
//   scanOutputDir, 
//   scanId, 
//   reports, 
//   sendResponse,
//   { 
//     benchmarkPath: path.join(scanOutputDir, "benchmark-results.json") 
//   }
// );

// ✅ Example usage without benchmarks (static only):
// await runEnergyAnalyzer(
//   astDir, 
//   cfgDir, 
//   scanOutputDir, 
//   scanId, 
//   reports, 
//   sendResponse
// );
/**
 * Main pipeline
 */
export default function runAnalysisPipeline(projectPath, scanOutputDir, res) {
  return new Promise((resolve, reject) => {
    let responseSent = false;

    const sendResponse = (data) => { 
      if (responseSent) return; 
      responseSent = true; 
      res.json(data); 
      resolve(data); 
    };
    
    const sendErrorResponse = (status, data) => { 
      if (responseSent) return; 
      responseSent = true; 
      res.status(status).json(data); 
      reject(data); 
    };

    const scanId = path.basename(projectPath);

    // console.log("\n" + "=".repeat(80));
    // console.log("🚀 STARTING ANALYSIS PIPELINE");
    // console.log("=".repeat(80));
    // console.log(`⚡ Project: ${projectPath}`);
    // console.log(`🗂 Output directory: ${scanOutputDir}`);
    // console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    // console.log("=".repeat(80) + "\n");

    const cliPath = path.join(process.cwd(), "../static-analyzer/dist/cli.js");

    if (!fs.existsSync(cliPath)) {
      return sendErrorResponse(500, { 
        status: "error", 
        message: `Static analyzer CLI not found at: ${cliPath}` 
      });
    }

    // console.log(`✅ CLI path verified: ${cliPath}`);
    // console.log("\n" + "=".repeat(80));
    // console.log("PHASE 1: STATIC ANALYZER");
    // console.log("=".repeat(80) + "\n");

    const analyzer = spawn("node", [cliPath, projectPath, scanOutputDir], {
      cwd: path.join(process.cwd(), "../static-analyzer"),
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
      env: { ...process.env, PATH: process.env.PATH }
    });

    analyzer.stdout.on("data", (data) => process.stdout.write(`[STATIC-ANALYZER] ${data}`));
    analyzer.stderr.on("data", (data) => process.stderr.write(`[STATIC-ANALYZER ERROR] ${data}`));

    analyzer.on("error", (error) => sendErrorResponse(500, { 
      status: "error", 
      message: `Failed to start static analyzer: ${error.message}`, 
      details: error.code 
    }));

    analyzer.on("close", (code) => {
      if (code !== 0) {
        return sendErrorResponse(500, { 
          status: "error", 
          message: "Static analyzer failed", 
          code 
        });
      }
      validateStaticAnalyzer();
    });

    const validateStaticAnalyzer = () => {
      const reportDir = path.join(scanOutputDir, "report");
      const astDir = path.join(scanOutputDir, "ast");
      const cfgDir = path.join(scanOutputDir, "cfg");

      console.log("📂 reportDir:", reportDir);
      console.log("📂 astDir:", astDir);
      console.log("📂 cfgDir:", cfgDir);

      const reports = fs.existsSync(reportDir)
        ? fs.readdirSync(reportDir).filter(f => f.endsWith(".json"))
            .map(f => JSON.parse(fs.readFileSync(path.join(reportDir, f), "utf8")))
        : [];

      // ---- Data‑structure agent paths ----
      const projectRoot = projectPath;                       // uploads/<scanId>_extracted
      const samplesDir = path.join(projectRoot, "samples");  // Java files here
      const dsResultsDir = path.join(scanOutputDir, "data-structure-results");

      console.log("📂 projectRoot:", projectRoot);
      console.log("📂 samplesDir (Java):", samplesDir);
      console.log("📂 dsResultsDir:", dsResultsDir);

      if (fs.existsSync(samplesDir)) {
        const allSampleFiles = fs.readdirSync(samplesDir);
        console.log("📄 files in samplesDir:", allSampleFiles);
        console.log("📄 .java files:", allSampleFiles.filter(f => f.endsWith(".java")));
      } else {
        console.log("❌ samplesDir does NOT exist");
      }

      if (fs.existsSync(astDir)) {
        const allAstFiles = fs.readdirSync(astDir);
        console.log("📄 files in astDir:", allAstFiles);
      } else {
        console.log("❌ astDir does NOT exist");
      }

      const dsResult = runDataStructureAgent(samplesDir, astDir, dsResultsDir);
      console.log("📊 Data-structure agent analyzed %d files", dsResult.totalAnalyzed);

      // ---- Optimization agent paths & run ----
      const optModelDir = samplesDir;               // use samples/ where .java live
      const optAstDir   = astDir;                   // output/<scanId>_extracted/ast
      const optReportDir = path.join(scanOutputDir, "optimization-report");

      console.log("🔎 [OPT] modelDir:", optModelDir);
      console.log("🔎 [OPT] astDir:", optAstDir);
      console.log("🔎 [OPT] reportDir:", optReportDir);

      if (fs.existsSync(optModelDir)) {
        const modelFiles = fs.readdirSync(optModelDir);
        console.log("📄 [OPT] files in modelDir:", modelFiles);
        console.log("📄 [OPT] .java files in modelDir:", modelFiles.filter(f => f.endsWith(".java")));
      } else {
        console.log("❌ [OPT] modelDir does NOT exist");
      }

      if (fs.existsSync(optAstDir)) {
        const optAstFiles = fs.readdirSync(optAstDir);
        console.log("📄 [OPT] files in astDir:", optAstFiles);
        console.log("📄 [OPT] .json files in astDir:", optAstFiles.filter(f => f.endsWith(".json")));
      } else {
        console.log("❌ [OPT] astDir does NOT exist");
      }

      const optAnalyzed = runOptimizationAgent(optModelDir, optAstDir, optReportDir);
      console.log("📊 Optimization agent analyzed %d files", optAnalyzed);

      // ---- Maintainability agent run ----
      console.log("🚀 Running maintainability agent...");
      const maintAstDir = astDir;       // same AST dir as other agents
      const maintJavaDir = samplesDir;  // same Java dir as other agents
      const maintOutDir  = path.join(scanOutputDir, "maintainability");
      const maintFiles = runMaintainabilityAgent(maintAstDir, maintJavaDir, maintOutDir);
      console.log("📊 Maintainability agent analyzed %d files", maintFiles);

       // ---- Compliance agent paths & run ----
      const complianceSamplesDir = samplesDir;                       // uploads/<scanId>_extracted/samples
      const complianceAstDir     = astDir;                           // output/<scanId>_extracted/ast
      const complianceOutDir     = path.join(scanOutputDir, "compliance");

      console.log("🔎 [COMP] samplesDir:", complianceSamplesDir);
      console.log("🔎 [COMP] astDir:", complianceAstDir);
      console.log("🔎 [COMP] outDir:", complianceOutDir);

      const complianceAnalyzed = runComplianceAgent(
        complianceSamplesDir,
        complianceAstDir,
        complianceOutDir
      );
      console.log("📊 Compliance agent analyzed %d files", complianceAnalyzed);

      // ---- Energy analyzer (existing logic) ----
      // 1. Check if AST/CFG files exist (from static analyzer)
if (!fs.existsSync(astDir) || !fs.existsSync(cfgDir) || fs.readdirSync(astDir).length === 0) {
  // If not, skip energy analysis
  return sendResponse({});
}

// 2. Find Java source in uploads folder
const uploadsDir = path.join(process.cwd(), "uploads");
const scanId = path.basename(projectPath);
const javaSourceDir = path.join(uploadsDir, scanId);

// 3. Check if Java files exist
let javaFilesCount = 0;
if (fs.existsSync(javaSourceDir)) {
  const javaFiles = getAllJavaFiles(javaSourceDir);
  javaFilesCount = javaFiles.length;
}

// 4. Call runEnergyAnalyzer with CORRECT paths
runEnergyAnalyzer(
  astDir,           // ✅ AST from static analyzer
  cfgDir,           // ✅ CFG from static analyzer  
  scanOutputDir,    // Output directory
  scanId,           // Scan ID
  reports,          // Static reports
  sendResponse,     // Callback
  {
    runBenchmarks: javaFilesCount > 0,  // Only run real benchmarks if Java exists
    sourceCodePath: javaFilesCount > 0 ? javaSourceDir : null,
    mockBenchmarks: javaFilesCount === 0  // Use mock if no Java
  }
);
    };


  });
}