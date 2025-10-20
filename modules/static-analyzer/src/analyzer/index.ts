import fs from "fs";
import path from "path";
import { RuleEngine } from "../rules/RuleEngine.js";
import { ReportGenerator } from "../report/ReportGenerator.js";
import { ReportFormatter } from "../report/ReportFormatter.js";

export async function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");

  // 1️ Run rule engine on the code
  const engine = new RuleEngine();
  const violations = engine.analyzeCode(content, path.basename(filePath));

  // 2️ Generate summarized report
  const report = ReportGenerator.generate(violations);

  // 3️Prepare output directory
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 4️ Save report to JSON file
  const outputFile = path.join(outputDir, `${path.basename(filePath)}.report.json`);
  ReportFormatter.toJSON(report, outputFile);

  console.log(`✅ Report generated for: ${filePath}`);
  return report;
}
