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

// in run_optimization_agent.ts
export function runOptimizationAgent(
  modelDir: string,
  astDir: string,
  reportDir: string
): number {
  if (!fs.existsSync(modelDir) || !fs.existsSync(astDir)) {
    console.error("Model or AST directory not found");
    console.error("Expected modelDir:", modelDir);
    console.error("Expected astDir:", astDir);
    return 0;
  }

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const files = fs.readdirSync(modelDir).filter((f) => f.endsWith(".java"));
  if (files.length === 0) {
    console.log("No Java files found in:", modelDir);
    return 0;
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

    const astRaw = fs.readFileSync(astPath, "utf8");
    const astJson: JavaFileAst = JSON.parse(astRaw);
    const results = agent.analyzeJavaAst(javaPath, astJson);

    const report = {
      fileName: file,
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
  return totalAnalyzed;
}

// if (require.main === module) {
//   const [, , uploadId, runId] = process.argv;
//   if (!uploadId || !runId) {
//     console.error(
//       "Usage: ts-node run_optimization_agent.ts <uploadId> <runId>"
//     );
//     process.exit(1);
//   }
//   runOptimizationAgent(uploadId, runId);
// }

// export { runOptimizationAgent };
