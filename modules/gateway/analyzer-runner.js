import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectPath = process.argv[2];
if (!projectPath) process.exit(1);

const scanId = path.basename(projectPath);
const scanOutputDir = path.join(__dirname, "output", scanId);
fs.mkdirSync(scanOutputDir, { recursive: true });

// Step 1: Compile TypeScript (if needed)
const tsc = spawn("npx", ["tsc"], {
  cwd: path.join(__dirname, "../static-analyzer"),
  stdio: "inherit",
});

tsc.on("error", () => process.exit(1));

tsc.on("close", (code) => {
  if (code !== 0) process.exit(1);

  // Step 2: Run static-analyzer CLI → outputs already generated in scanOutputDir
  const analyzerProcess = spawn(
    "node",
    ["dist/cli.js", projectPath, scanOutputDir],
    {
      cwd: path.join(__dirname, "../static-analyzer"),
      stdio: "inherit", // show logs
    }
  );

  analyzerProcess.on("close", (code) => {
    console.log(`Analyzer finished for ${scanId} with code ${code}`);
    process.exit(0);
  });

  analyzerProcess.on("error", (err) => {
    console.error("Failed to start analyzer:", err.message);
    process.exit(1);
  });
});
