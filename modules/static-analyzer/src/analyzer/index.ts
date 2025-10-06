import fs from "fs";
import path from "path";

export async function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");

  // Simulated analysis result (replace with real logic)
  const result = {
    file: filePath,
    lines: content.split("\n").length,
    chars: content.length,
    timestamp: new Date().toISOString(),
  };

  // Save results to output/analysis.json
  const outputDir = path.join(process.cwd(), "output");
  const outputFile = path.join(outputDir, `${path.basename(filePath)}.analysis.json`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf8");
  console.log(` Analysis result saved to: ${outputFile}`);

  return result;
}
