import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Run energy analyzer on AST and CFG directories
 */
export async function runEnergyAnalyzer(astDir, cfgDir, scanOutputDir, scanId, reports, sendResponse) {
  console.log("\n" + "=".repeat(80));
  console.log("PHASE 3: ENERGY ANALYZER");
  console.log("=".repeat(80) + "\n");


  const energyAnalyzerPath = path.join(process.cwd(), "../energy-analyzer");
  const energyCliPath = path.join(energyAnalyzerPath, "dist/cli/cli.js");
  const energySrcPath = path.join(energyAnalyzerPath, "src/cli/cli.ts");

  // Check if compilation is needed
  const needsCompilation = !fs.existsSync(energyCliPath) || 
    (fs.existsSync(energySrcPath) && 
     fs.statSync(energySrcPath).mtime > fs.statSync(energyCliPath).mtime);

  if (needsCompilation) {
    try {
      console.log(`🔨 Building energy analyzer...`);
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
      // Continue anyway in case dist already exists
    }
  }

  // Rest of your existing code...
  if (!fs.existsSync(energyCliPath)) {
    console.warn(`⚠️  Energy analyzer CLI not found at: ${energyCliPath}`);
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

  if (!fs.existsSync(energyCliPath)) {
    console.warn(`⚠️  Energy analyzer CLI not found at: ${energyCliPath}`);
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

  console.log(`✅ Energy analyzer CLI verified: ${energyCliPath}`);

  // Validate directories before spawning
  console.log("\n📋 Validating input directories...");
  
  if (!fs.existsSync(astDir)) {
    console.error(`❌ AST directory not found: ${astDir}`);
    return sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "AST directory not found",
      summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
    });
  }

  const astFiles = fs.readdirSync(astDir).filter(f => f.endsWith(".json"));
  console.log(`✅ AST directory: ${astDir}`);
  console.log(`   Found ${astFiles.length} JSON files`);
  
  if (astFiles.length === 0) {
    console.error(`❌ No JSON files in AST directory`);
    return sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "No AST JSON files found",
      summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
    });
  }

  if (!fs.existsSync(cfgDir)) {
    console.error(`❌ CFG directory not found: ${cfgDir}`);
    return sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "CFG directory not found",
      summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
    });
  }

  const cfgFiles = fs.readdirSync(cfgDir).filter(f => f.endsWith(".json"));
  console.log(`✅ CFG directory: ${cfgDir}`);
  console.log(`   Found ${cfgFiles.length} JSON files`);

  const energyDir = path.join(scanOutputDir, "energy");
  fs.mkdirSync(energyDir, { recursive: true });
  console.log(`✅ Output directory: ${energyDir}\n`);

  // Use --ast-dir (long form) which works correctly
  const args = [
    "--ast-dir", astDir,
    "--cfg", cfgDir,
    "--out", energyDir,
    "--per-class"
  ];

  console.log(`📝 Energy analyzer command:`);
  console.log(`   node ${energyCliPath} ${args.join(' ')}\n`);

  const energyProc = spawn("node", [energyCliPath, ...args], {
    cwd: path.join(process.cwd(), "../energy-analyzer"),
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
    env: { ...process.env, PATH: process.env.PATH }
  });

  let stdoutData = "";
  let stderrData = "";

  energyProc.stdout.on("data", (data) => {
    const text = data.toString();
    stdoutData += text;
    process.stdout.write(`[ENERGY-ANALYZER] ${text}`);
  });
  
  energyProc.stderr.on("data", (data) => {
    const text = data.toString();
    stderrData += text;
    process.stderr.write(`[ENERGY-ANALYZER ERROR] ${text}`);
  });

  energyProc.on("spawn", () => {
    console.log("🚀 Energy analyzer process spawned successfully...\n");
  });

  energyProc.on("error", (error) => {
    console.error(`❌ Energy analyzer spawn error:`, error);
    sendResponse({
      status: "done_energy_failed",
      scanId,
      reports,
      message: "Static analysis completed but energy analyzer failed to spawn",
      energyError: error.message,
      summary: {
        totalIssues: reports.length,
        hasEnergyAnalysis: false
      }
    });
  });

  energyProc.on("close", (code) => {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`🔹 Energy analyzer exited with code ${code}`);
    console.log(`${"=".repeat(80)}\n`);
    
    if (code !== 0) {
      console.error(`❌ Energy analyzer failed with exit code ${code}`);
      console.error(`📋 STDERR:`, stderrData || "(empty)");
    }
    
    const energyReports = [];
    let summaryReport = null;

    try {
      const files = fs.readdirSync(energyDir);
      console.log(`📂 Files in energy directory: ${files.length}`);
      
      const classReports = files
        .filter(f => f.includes('-energy-report.json') && f !== 'summary-energy-report.json')
        .map(f => {
          const content = JSON.parse(fs.readFileSync(path.join(energyDir, f), "utf8"));
          console.log(`✅ Read report: ${f} (${content.reports?.length || 0} methods)`);
          return content;
        });

      const summaryPath = path.join(energyDir, "summary-energy-report.json");
      if (fs.existsSync(summaryPath)) {
        summaryReport = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
        console.log(`✅ Read summary report`);
      }

      classReports.forEach(cr => {
        if (cr.reports && Array.isArray(cr.reports)) {
          energyReports.push(...cr.reports);
        }
      });
      
      console.log(`📊 Total energy reports collected: ${energyReports.length}`);
      
    } catch (error) {
      console.error(`❌ Error reading energy reports:`, error);
    }

    const hasEnergyAnalysis = energyReports.length > 0;

    sendResponse({
      status: hasEnergyAnalysis ? "done" : "done_energy_failed",
      scanId,
      reports,
      energyReports,
      energySummary: summaryReport,
      message: hasEnergyAnalysis ?
        `Energy analysis completed: ${energyReports.length} methods analyzed` :
        "Energy analysis failed or no reports generated",
      summary: {
        totalIssues: reports.length,
        hasEnergyAnalysis,
        energyMethodsAnalyzed: energyReports.length
      }
    });
  });
}

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

    console.log("\n" + "=".repeat(80));
    console.log("🚀 STARTING ANALYSIS PIPELINE");
    console.log("=".repeat(80));
    console.log(`⚡ Project: ${projectPath}`);
    console.log(`🗂 Output directory: ${scanOutputDir}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(80) + "\n");

    const cliPath = path.join(process.cwd(), "../static-analyzer/dist/cli.js");

    if (!fs.existsSync(cliPath)) {
      return sendErrorResponse(500, { 
        status: "error", 
        message: `Static analyzer CLI not found at: ${cliPath}` 
      });
    }

    console.log(`✅ CLI path verified: ${cliPath}`);
    console.log("\n" + "=".repeat(80));
    console.log("PHASE 1: STATIC ANALYZER");
    console.log("=".repeat(80) + "\n");

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

      const reports = fs.existsSync(reportDir)
        ? fs.readdirSync(reportDir).filter(f => f.endsWith(".json"))
            .map(f => JSON.parse(fs.readFileSync(path.join(reportDir, f), "utf8")))
        : [];

      if (!fs.existsSync(astDir) || !fs.existsSync(cfgDir) || fs.readdirSync(astDir).length === 0) {
        return sendResponse({
          status: "done_no_energy",
          scanId,
          reports,
          message: "Static analysis completed but AST/CFG missing - energy analysis skipped",
          summary: { totalIssues: reports.length, hasEnergyAnalysis: false }
        });
      }

      runEnergyAnalyzer(astDir, cfgDir, scanOutputDir, scanId, reports, sendResponse);
    };
  });
}