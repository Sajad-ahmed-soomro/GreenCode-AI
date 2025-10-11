import { promises as fs } from "fs";
import path from "path";
import { analyzeAST } from "../analysis/metrics/MetricsAnalyzer.js";

async function runAnalysis() {
  const astDir = path.join("samples", "ast");
  const outputDir = path.join("samples", "cfg");

  // Ensure output folder exists
  await fs.mkdir(outputDir, { recursive: true });

  const files = await fs.readdir(astDir);

  for (const f of files) {
    if (f.endsWith(".json")) {
      const filePath = path.join(astDir, f);
      const ast = JSON.parse(await fs.readFile(filePath, "utf8"));

      const result = analyzeAST(ast, filePath);

      // Save CFG output to file
      const outputPath = path.join(outputDir, f.replace(".json", "_cfg.json"));
      await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

      console.log(` Saved CFG for ${f} → ${outputPath}`);
    }
  }
}

runAnalysis().catch(console.error);
