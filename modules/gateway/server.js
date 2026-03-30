import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import http from "http";
import { WebSocketServer } from "ws";
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import runAnalysisPipeline from "./analyzer-runner.js"; // Main pipeline
import { runEnergyAnalyzer } from "./analyzer-runner.js"; // Energy analyzer
import energyRoutes from "./routes/energyRoutes.js"
import dataStructureRoutes from "./routes/dataStructureRoutes.js";
import dataStructuresRoutes from './routes/dataStructuresRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js'; // Add this

import maintainabilityRoutes from './routes/maintainabilityRoutes.js'; // Add this

import optimizationRoutes from './routes/optimizationRoutes.js';
import unifiedRoutes from './routes/unifiedRoutes.js'



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

app.use('/api/data-structure', dataStructuresRoutes);

app.use('/api/compliance', complianceRoutes); 

app.use('/api/maintainability', maintainabilityRoutes); // Add this route

app.use('/api/optimization', optimizationRoutes);


app.use("/api",unifiedRoutes);
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Energy Analyzer API' });
});

app.use(cors({
  origin: 'http://localhost:3000', // Your Next.js frontend
  credentials: true
}));
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
      
      // Keep the original zip file AND extracted folder
      console.log(`💾 Original zip preserved at: ${req.file.path}`);
      console.log(`📂 Extracted folder kept at: ${extractDir}`);
    } else {
      // For non-zip files, keep the original file
      console.log(`💾 File preserved at: ${projectPath}`);
    }

    const scanId = path.basename(projectPath);
    const scanOutputDir = path.join(outputDir, scanId);
    fs.mkdirSync(scanOutputDir, { recursive: true });

    console.log(`🎯 Starting analysis pipeline for: ${scanId}`);
    await runAnalysisPipeline(projectPath, scanOutputDir, res);

    // REMOVED CLEANUP - FILES ARE PRESERVED
    console.log("\n" + "=".repeat(60));
    console.log("✅ ANALYSIS COMPLETE - FILES PRESERVED");
    console.log("=".repeat(60));
    console.log(`📦 Original upload: ${req.file.path}`);
    if (extractDir) {
      console.log(`📁 Extracted folder: ${extractDir}`);
    }
    console.log(`📊 Results saved to: ${scanOutputDir}`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Pipeline error:", error);
    
    // Even on error, files are preserved for debugging
    console.log(`🔍 Files preserved for debugging:`);
    console.log(`   - Original: ${req.file.path}`);
    if (extractDir) console.log(`   - Extracted: ${extractDir}`);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        status: "error", 
        message: "Analysis pipeline failed", 
        error: error.message,
        note: "Uploaded files preserved for debugging"
      });
    }
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
// data structures agent
app.use("/data-structure", dataStructureRoutes);

// ----- Unified analyze: POST /api/analyze (file upload or code snippet) -----
app.post("/api/analyze", upload.single("project"), async (req, res) => {
  let projectPath;
  let scanId;
  let scanOutputDir;
  let extractDir = null;

  try {
    if (req.file) {
      projectPath = req.file.path;
      if (req.file.originalname.endsWith(".zip")) {
        extractDir = path.join(uploadDir, `${req.file.filename}_extracted`);
        fs.mkdirSync(extractDir, { recursive: true });
        const zip = new AdmZip(projectPath);
        zip.extractAllTo(extractDir, true);
        projectPath = extractDir;
      }
    } else if (req.body && req.body.code) {
      const fileName = req.body.fileName || req.body.filePath || "Code.java";
      const name = fileName.endsWith(".java") ? fileName : `${fileName}.java`;
      scanId = `snippet_${uuidv4().slice(0, 8)}`;
      extractDir = path.join(uploadDir, scanId);
      const samplesDir = path.join(extractDir, "samples");
      fs.mkdirSync(samplesDir, { recursive: true });
      fs.writeFileSync(path.join(samplesDir, name), req.body.code, "utf8");
      projectPath = extractDir;
    } else {
      return res.status(400).json({
        success: false,
        error: "Provide either a file upload (multipart 'project') or JSON body: { code: string, fileName?: string }",
      });
    }

    scanId = scanId || path.basename(projectPath);
    scanOutputDir = path.join(outputDir, scanId);
    fs.mkdirSync(scanOutputDir, { recursive: true });

    await runAnalysisPipeline(projectPath, scanOutputDir, res);
  } catch (error) {
    console.error("❌ /api/analyze error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// ----- WebSocket for real-time analysis updates -----
const PORT = process.env.PORT || 5400;
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const wsClients = new Set();
wss.on("connection", (ws) => {
  wsClients.add(ws);
  ws.send(JSON.stringify({ type: "connected", message: "GreenCode AI gateway" }));
  ws.on("close", () => wsClients.delete(ws));
});
export function broadcastAnalysisProgress(data) {
  const msg = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (client.readyState === 1) try { client.send(msg); } catch (_) {}
  });
}

server.listen(PORT, () => {
  console.log("\n" + "✨".repeat(60));
  console.log("🚀 GREENCODE-AI GATEWAY STARTED SUCCESSFULLY");
  console.log("✨".repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`📊 Output directory: ${outputDir}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log("✨".repeat(60) + "\n");
});
