import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// After extracting project or setting projectPath
const scanId = path.basename(projectPath);
const scanOutputDir = path.join(outputDir, scanId);
fs.mkdirSync(scanOutputDir, { recursive: true });

console.log(`⚡ Starting analyzer for project: ${projectPath}`);
console.log(`🗂 Output directory: ${scanOutputDir}`);

const cliPath = path.join(__dirname, "../static-analyzer/dist/cli.js");
console.log(`🔹 CLI path resolved to: ${cliPath}`);
console.log(`🔹 CWD for spawn: ${path.join(__dirname, "../static-analyzer")}`);

// Run the analyzer
const analyzer = spawn(
  "node",
  [cliPath, projectPath, scanOutputDir],
  {
    cwd: path.join(__dirname, "../static-analyzer"),
    stdio: "inherit",
    shell: true
  }
);

analyzer.on("spawn", () => {
  console.log("🚀 Analyzer process spawned successfully...");
});

analyzer.on("close", (code) => {
  console.log(`🔹 Analyzer process closed with code: ${code}`);

  if (code !== 0) {
    console.error(`❌ Analyzer exited with code ${code}`);
    return res.status(500).json({ status: "error", message: "Analyzer failed" });
  }

  console.log(`✅ Analyzer finished successfully for ${scanId}`);
  console.log("📄 Reading reports and CFGs from output folder...");

  const reportDir = path.join(scanOutputDir, "report");
  const cfgDir = path.join(scanOutputDir, "cfg");

  console.log(`📂 Report directory: ${reportDir}`);
  console.log(`📂 CFG directory: ${cfgDir}`);

  const reports = fs.existsSync(reportDir)
    ? fs.readdirSync(reportDir)
        .filter(f => f.endsWith(".json"))
        .map(f => {
          console.log(`   Found report: ${f}`);
          return JSON.parse(fs.readFileSync(path.join(reportDir, f), "utf8"));
        })
    : [];

  const cfgs = fs.existsSync(cfgDir)
    ? fs.readdirSync(cfgDir)
        .filter(f => f.endsWith(".json"))
        .map(f => {
          console.log(`   Found CFG: ${f}`);
          return JSON.parse(fs.readFileSync(path.join(cfgDir, f), "utf8"));
        })
    : [];

  console.log(`📊 Total reports: ${reports.length}, total CFGs: ${cfgs.length}`);
  res.json({ status: "done", reports, cfgs, scanId });
});

analyzer.on("error", (err) => {
  console.error("❌ Failed to start analyzer:", err.message);
  res.status(500).json({ status: "error", message: err.message });
});
