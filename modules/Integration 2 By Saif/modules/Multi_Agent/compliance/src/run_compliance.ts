import fs from "fs";
import path from "path";
import ComplianceAgentClass from "./compliance_agent.js";

/**
 * Run compliance agent over all Java files using their ASTs.
 * @param {string} samplesDir  uploads/<scanId>_extracted/samples
 * @param {string} astDir      output/<scanId>_extracted/ast
 * @param {string} outDir      output/<scanId>_extracted/compliance
 * @returns {number} total files analyzed
 */
export function runComplianceAgent(samplesDir: string,
  astDir: string,
  outDir: string):number {
  if (!fs.existsSync(samplesDir) || !fs.existsSync(astDir)) {
    console.error("❌ Compliance: samples or AST dir not found");
    console.error("   samplesDir:", samplesDir);
    console.error("   astDir:", astDir);
    return 0;
  }

  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(samplesDir).filter(f => f.endsWith(".java"));
  if (files.length === 0) {
    console.log("⚠️  Compliance: no .java files in", samplesDir);
    return 0;
  }

  const agent = new ComplianceAgentClass();
  let total = 0;

  for (const file of files) {
    const javaPath = path.join(samplesDir, file);
    const astPath = path.join(astDir, file.replace(".java", ".json"));

    if (!fs.existsSync(astPath)) {
      console.log(`⏭️  Compliance: skipping ${file}, AST missing at ${astPath}`);
      continue;
    }

    const sourceCode = fs.readFileSync(javaPath, "utf8");
    const astJson = JSON.parse(fs.readFileSync(astPath, "utf8"));

    const result = agent.analyze(sourceCode, astJson);

    const outFile = file.replace(".java", ".compliance.report.json");
    const outPath = path.join(outDir, outFile);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

    console.log(`✅ Compliance analyzed: ${file}`);
    total++;
  }

  console.log(`\nComplianceAgent completed. Total files analyzed: ${total}`);
  return total;
}
