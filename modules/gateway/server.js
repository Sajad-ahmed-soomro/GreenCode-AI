import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
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

// POST /scan → upload project and return results from latest output folder
// POST /scan → upload project and return results from latest output folder
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
    // Find the folder that actually has report or cfg files
    const outputFolders = fs.readdirSync(outputDir).filter(f =>
      fs.statSync(path.join(outputDir, f)).isDirectory()
    ).sort().reverse(); // newest first

    let latestFolder = null;
    for (const folder of outputFolders) {
      const rDir = path.join(outputDir, folder, "report");
      const cDir = path.join(outputDir, folder, "cfg");
      if ((fs.existsSync(rDir) && fs.readdirSync(rDir).length > 0) ||
          (fs.existsSync(cDir) && fs.readdirSync(cDir).length > 0)) {
        latestFolder = folder;
        break;
      }
    }

    if (!latestFolder) {
      return res.status(500).json({ status: "error", message: "No analysis results found" });
    }

    console.log("Selected output folder:", latestFolder);

    const reportDir = path.join(outputDir, latestFolder, "report");
    const cfgDir = path.join(outputDir, latestFolder, "cfg");

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

    console.log("Reports found:", reports.length, "CFGs found:", cfgs.length);

    // Aggregate frontend-friendly summary & findings
    const summary = {
      filesScanned: reports.length,
      rulesViolated: reports.reduce((acc, r) => acc + (r.total || 0), 0),
      codeSmells: reports.reduce((acc, r) => acc + (r.codeSmells || 0), 0),
      hotspots: reports.reduce((acc, r) => acc + (r.hotspots || 0), 0),
    };

    const findings = reports.flatMap((r, idx) =>
      (r.findings || []).map(f => ({ id: idx + 1, ...f }))
    );

    // Clean up uploaded project files
    fs.unlinkSync(req.file.path);
    if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true });

    res.json({ status: "done", reportFolder: latestFolder, summary, findings, reports, cfgs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = 5400;
app.listen(PORT, () => console.log(`✅ Gateway running on port ${PORT}`));
