import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";
import runAnalysisPipeline from "./analyzer-runner.js"; // Main pipeline
import { runEnergyAnalyzer } from "./analyzer-runner.js"; // Energy analyzer
import energyRoutes from "./routes/energyRoutes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

[uploadDir, outputDir].forEach(dir => fs.mkdirSync(dir, { recursive: true }));

const upload = multer({ dest: uploadDir, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/energy', energyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Energy Analyzer API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Scan endpoint
app.post("/scan", upload.single("project"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  console.log("\n" + "=".repeat(60));
  console.log("📨 NEW SCAN REQUEST RECEIVED");
  console.log("=".repeat(60));
  console.log(`📄 File: ${req.file.originalname}`);
  console.log(`📁 Temp path: ${req.file.path}`);
  console.log(`📏 Size: ${req.file.size} bytes`);
  console.log("=".repeat(60) + "\n");

  let projectPath = req.file.path;
  let extractDir = null;

  try {
    // Extract zip if uploaded
    if (req.file.originalname.endsWith(".zip")) {
      extractDir = path.join(uploadDir, `${req.file.filename}_extracted`);
      fs.mkdirSync(extractDir, { recursive: true });
      
      const zip = new AdmZip(projectPath);
      zip.extractAllTo(extractDir, true);
      projectPath = extractDir;
      console.log(`✅ Extracted to: ${extractDir}`);
    }

    const scanId = path.basename(projectPath);
    const scanOutputDir = path.join(outputDir, scanId);
    fs.mkdirSync(scanOutputDir, { recursive: true });

    console.log(`🎯 Starting analysis pipeline for: ${scanId}`);
    await runAnalysisPipeline(projectPath, scanOutputDir, res);

    // Cleanup temp files
    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (extractDir && fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn("⚠️  Cleanup warning:", cleanupError.message);
    }

  } catch (error) {
    console.error("❌ Pipeline error:", error);
    if (!res.headersSent) res.status(500).json({ status: "error", message: "Analysis pipeline failed", error: error.message });
  }
});

// Run energy analyzer separately
app.post("/energy-analyzer", async (req, res) => {
  try {
    const { scanId } = req.body;
    if (!scanId) return res.status(400).json({ status: "error", message: "scanId is required" });

    const scanOutputDir = path.join(outputDir, scanId);
    const astDir = path.join(scanOutputDir, "ast");
    const cfgDir = path.join(scanOutputDir, "cfg");

    if (!fs.existsSync(astDir) || !fs.existsSync(cfgDir)) {
      return res.status(404).json({ status: "error", message: "AST or CFG directories not found. Run static analysis first." });
    }

    await new Promise((resolve) => {
      runEnergyAnalyzer(astDir, cfgDir, scanOutputDir, scanId, [], (data) => {
        res.json(data);
        resolve();
      });
    });

  } catch (error) {
    console.error("❌ Energy analyzer error:", error);
    res.status(500).json({ status: "error", message: "Energy analyzer failed", error: error.message });
  }
});

// Get energy reports endpoint
app.get("/scan/:scanId/energy", (req, res) => {
  const scanId = req.params.scanId;
  const scanOutputDir = path.join(outputDir, scanId);
  const energyDir = path.join(scanOutputDir, "energy");

  if (!fs.existsSync(scanOutputDir)) {
    return res.status(404).json({ status: "error", message: "Scan not found" });
  }

  if (!fs.existsSync(energyDir)) {
    return res.status(404).json({ status: "error", message: "Energy analysis not yet run for this scan" });
  }

  try {
    const energyFiles = fs.readdirSync(energyDir)
      .filter(f => f.endsWith(".json"));

    const energyReports = energyFiles.map(f => {
      const filePath = path.join(energyDir, f);
      return {
        file: f,
        content: JSON.parse(fs.readFileSync(filePath, "utf8"))
      };
    });

    const summaryReportPath = path.join(energyDir, "summary-energy-report.json");
    const summaryReport = fs.existsSync(summaryReportPath)
      ? JSON.parse(fs.readFileSync(summaryReportPath, "utf8"))
      : null;

    res.json({
      status: "success",
      scanId,
      totalReports: energyReports.length,
      reports: energyReports,
      summary: summaryReport
    });

  } catch (error) {
    console.error("❌ Error reading energy reports:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to read energy reports",
      error: error.message
    });
  }
});

// Helper to get directory size
function getDirectorySize(dir) {
  let size = 0;
  if (!fs.existsSync(dir)) return size;

  const calculate = (dirPath) => {
    fs.readdirSync(dirPath).forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) calculate(itemPath);
      else size += stat.size;
    });
  };
  calculate(dir);
  return size;
}

const PORT = process.env.PORT || 5400;
app.listen(PORT, () => {
  console.log("\n" + "✨".repeat(60));
  console.log("🚀 GREENCODE-AI GATEWAY STARTED SUCCESSFULLY");
  console.log("✨".repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`📊 Output directory: ${outputDir}`);
  console.log("✨".repeat(60) + "\n");
});
