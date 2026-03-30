import * as fs from "fs";
import * as path from "path";
import DataStructureAgent from "./data_structure_agent";

export function runDataStructureAgent(
  samplesDir: string,
  astDir: string,
  resultsDir: string
): { totalAnalyzed: number } {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const files = fs.readdirSync(samplesDir).filter(f => f.endsWith(".java"));

  let totalAnalyzed = 0;

  for (const file of files) {
    const javaPath = path.join(samplesDir, file);
    const astFileName = file.replace(".java", ".json");
    const astPath = path.join(astDir, astFileName);

    if (!fs.existsSync(astPath)) {
      console.log(`Skipping ${file}: AST not found`);
      continue;
    }

    const sourceCode: string = fs.readFileSync(javaPath, "utf8");
    const astData: string = fs.readFileSync(astPath, "utf8");
    const astObject: any = JSON.parse(astData);

    const agent = new DataStructureAgent();
    agent.loadInput(sourceCode, astObject);
    agent.analyze();

    const report = agent.buildReport();
    report.fileName = file;

    const resultFileName = file.replace(".java", ".report.json");
    const outputPath = path.join(resultsDir, resultFileName);

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

    console.log(`Analyzed: ${file}`);
    totalAnalyzed++;
  }

  console.log(`\nCompleted. Total files analyzed: ${totalAnalyzed}`);
  return { totalAnalyzed };
}
