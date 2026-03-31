import fs from "fs";
import path from "path";

// Recreate __filename / __dirname for ESM (still useful for a default)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

/**
 * Generate/update maintainability summary for a given output directory.
 * outputDir should be the folder where *_report.json files are written
 * e.g. gateway/output/<scanId>_extracted/maintainability
 */
export function generateGlobalSummary(outputDir: string ): void {
  const OUTPUT_DIR = outputDir;
  const SUMMARY_FILE = path.join(OUTPUT_DIR, "maintainability_report.json");

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("No output directory found. Run maintainability agent first.");
    return;
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("No output directory found. Run maintainability agent first.");
    return;
  }

  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith("_report.json"))
    .map(f => path.join(OUTPUT_DIR, f));

  if (files.length === 0) {
    console.log("No file reports found to summarize.");
    return;
  }

  // Load existing summary (if present)
  let globalSummary: any = { analyzedFiles: [] };
  if (fs.existsSync(SUMMARY_FILE)) {
    try {
      globalSummary = JSON.parse(fs.readFileSync(SUMMARY_FILE, "utf-8"));
    } catch {
      console.warn(" Could not parse existing summary. Rebuilding...");
    }
  }

  const analyzedFiles = new Map<string, any>();
  for (const entry of globalSummary.analyzedFiles || []) {
    analyzedFiles.set(entry.file, entry);
  }

  // Process each new file report
  for (const filePath of files) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!Array.isArray(data.results)) continue;

    const avgScore = data.averageScore || 0;
    const level = data.maintainabilityLevel || "Unknown";
    const totalMethods = data.totalMethods || 0;

    const existing = analyzedFiles.get(data.file);
    const newEntry = {
      file: data.file,
      avgScore,
      level,
      totalMethods,
      analyzedAt: new Date().toISOString()
    };

    analyzedFiles.set(data.file, existing ? { ...existing, ...newEntry } : newEntry);
  }

  const finalFiles = Array.from(analyzedFiles.values());

  const overallAvg =
    finalFiles.reduce((sum, f) => sum + (f.avgScore || 0), 0) / finalFiles.length;
  const overallLevel =
    overallAvg < 60 ? "Low" : overallAvg < 85 ? "Medium" : "High";

  const finalSummary = {
    analyzedFiles: finalFiles,
    overallAvg: parseFloat(overallAvg.toFixed(1)),
    overallLevel,
    totalFiles: finalFiles.length,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(finalSummary, null, 2));
  console.log(`\n Global Maintainability Summary Updated → ${SUMMARY_FILE}`);
}
