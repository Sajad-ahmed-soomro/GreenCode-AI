import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

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

app.post("/scan", upload.single("project"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  let projectPath = req.file.path;
  let extractDir = null;

  // Extract zip if uploaded
  if (req.file.originalname.endsWith(".zip")) {
    extractDir = path.join(uploadDir, `${req.file.filename}_extracted`);
    fs.mkdirSync(extractDir);
    const zip = new AdmZip(projectPath);
    zip.extractAllTo(extractDir, true);
    projectPath = extractDir;
  }

  try {
    const scanId = path.basename(projectPath);
    const scanOutputDir = path.join(outputDir, scanId);
    fs.mkdirSync(scanOutputDir, { recursive: true });

    const cliPath = path.join(__dirname, "../static-analyzer/dist/cli.js");

    if (!fs.existsSync(cliPath)) {
      return res.status(500).json({ status: "error", message: "Analyzer CLI not found. Compile static-analyzer first." });
    }

    console.log(`⚡ Running static-analyzer CLI on: ${projectPath}`);
    const analyzer = spawn(
      "node",
      [cliPath, projectPath, scanOutputDir],
      {
        cwd: path.join(__dirname, "../static-analyzer"),
        stdio: "inherit",
        shell: true,
      }
    );

    analyzer.on("close", (code) => {
      if (code !== 0) {
        console.error(`❌ Analyzer exited with code ${code}`);
        return res.status(500).json({ status: "error", message: "Analyzer failed" });
      }

      console.log(`✅ Analyzer finished for ${scanId}`);

      // Read results from output folder
      const reportDir = path.join(scanOutputDir, "report");
      const cfgDir = path.join(scanOutputDir, "cfg");

      const reports = fs.existsSync(reportDir)
        ? fs.readdirSync(reportDir)
            .filter(f => f.endsWith(".json"))
            .map(f => JSON.parse(fs.readFileSync(path.join(reportDir, f), "utf8")))
        : [];

      const cfgs = fs.existsSync(cfgDir)
        ? fs.readdirSync(cfgDir)
            .filter(f => f.endsWith(".json"))
            .map(f => JSON.parse(fs.readFileSync(path.join(cfgDir, f), "utf8")))
        : [];

      // Clean up uploaded files
      fs.unlinkSync(req.file.path);
      if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true });

      res.json({ status: "done", scanId, reports, cfgs });
    });

    analyzer.on("error", (err) => {
      console.error("❌ Failed to start analyzer:", err.message);
      res.status(500).json({ status: "error", message: err.message });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = 5400;
app.listen(PORT, () => console.log(`✅ Gateway running on port ${PORT}`));
