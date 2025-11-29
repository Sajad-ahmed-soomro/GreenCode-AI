// run_optimization_agent.ts

import * as fs from "fs";
import * as path from "path";
import { OptimizationAgent, JavaFileAst } from "./src/optimizationAgent";

interface OptimizationReport {
  fileName: string;
  uploadId: string;
  runId: string;
  sourcePath: string;
  astPath: string;
  agent: "optimization";
  results: any[];
}

function runOptimizationAgent(uploadId: string, runId: string): void {
  // __dirname = modules/Multi_Agent/optimization
  // gateway = modules/gateway
  const gatewayRoot = path.join(__dirname, "..", "..", "gateway");

  const uploadRoot = path.join(gatewayRoot, "uploads", uploadId);
  const modelDir = path.join(uploadRoot, "samples", "model");
  const astDir = path.join(uploadRoot, "samples", "ast");

  const outputRoot = path.join(gatewayRoot, "output", runId);
  const reportDir = path.join(outputRoot, "report");

  if (!fs.existsSync(modelDir) || !fs.existsSync(astDir)) {
    console.error("Model or AST directory not found for upload:", uploadId);
    console.error("Expected modelDir:", modelDir);
    console.error("Expected astDir:", astDir);
    return;
  }

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const files = fs.readdirSync(modelDir).filter((f) => f.endsWith(".java"));
  if (files.length === 0) {
    console.log("No Java files found in:", modelDir);
    return;
  }

  const agent = new OptimizationAgent();
  let totalAnalyzed = 0;

  for (const file of files) {
    const javaPath = path.join(modelDir, file);
    const astFileName = file.replace(".java", ".json");
    const astPath = path.join(astDir, astFileName);

    if (!fs.existsSync(astPath)) {
      console.log(`Skipping ${file}: AST not found at ${astPath}`);
      continue;
    }

    // Load and parse the Java AST JSON
    const astRaw = fs.readFileSync(astPath, "utf8");
    const astJson: JavaFileAst = JSON.parse(astRaw);

    const results = agent.analyzeJavaAst(javaPath, astJson);

    const report: OptimizationReport = {
      fileName: file,
      uploadId,
      runId,
      sourcePath: javaPath,
      astPath,
      agent: "optimization",
      results
    };

    const resultFileName = file.replace(".java", ".optimization.report.json");
    const outputPath = path.join(reportDir, resultFileName);

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`OptimizationAgent analyzed: ${file}`);
    totalAnalyzed++;
  }

  console.log(
    `\nOptimizationAgent completed. Total files analyzed: ${totalAnalyzed}`
  );
}

if (require.main === module) {
  const [, , uploadId, runId] = process.argv;
  if (!uploadId || !runId) {
    console.error(
      "Usage: ts-node run_optimization_agent.ts <uploadId> <runId>"
    );
    process.exit(1);
  }
  runOptimizationAgent(uploadId, runId);
}

export { runOptimizationAgent };
