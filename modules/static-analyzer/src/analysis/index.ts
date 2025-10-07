import { promises as fs } from "fs";
import path from "path";
import { analyzeAST } from "../analysis/metrics/MetricsAnalyzer.js";

async function runAnalysis() {
  const astDir = path.join("samples", "ast");
  const files = await fs.readdir(astDir);

  for (const f of files) {
    if (f.endsWith(".json")) {
      const filePath = path.join(astDir, f);
      const ast = JSON.parse(await fs.readFile(filePath, "utf8"));
      const result = analyzeAST(ast, filePath);
      console.log("Metrics for", f, "=>");
      console.log(JSON.stringify(result, null, 2));
    }
  }
}

runAnalysis().catch(console.error);
