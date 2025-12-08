import path from "path";
// modules/gateway/analyzer-runner.js
// modules/gateway/controllers/dataStructureController.js
import { runDataStructureAgent } from "../../Multi_Agent/data_structure/data_structure_runner.js"

export const runDataStructureScan = (req, res) => {
  try {
    const { projectPath, scanOutputDir } = req.body;

    // scanId is folder name (same as in uploads / static analyzer output)
    const scanId = path.basename(projectPath);

    // Java samples and ASTs are under uploads/<scanId>/
    const uploadsBase = path.join(process.cwd(), "uploads", scanId);
    const samplesDir = path.join(uploadsBase, "model");    // or "java" if that is your folder name
    const astDir = path.join(uploadsBase, "ast");
    const resultsDir = path.join(scanOutputDir, "data-structure-results");

    const result = runDataStructureAgent(samplesDir, astDir, resultsDir);

    res.json({
      status: "done",
      projectPath,
      scanOutputDir,
      scanId,
      totalAnalyzed: result.totalAnalyzed,
      resultsDir
    });
  } catch (err) {
    console.error("Data structure agent failed:", err);
    res.status(500).json({
      status: "error",
      message: "Data structure analysis failed",
      error: err.message
    });
  }
};
