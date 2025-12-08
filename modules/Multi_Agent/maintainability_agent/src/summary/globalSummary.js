"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGlobalSummary = generateGlobalSummary;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** Path to output folder */
const OUTPUT_DIR = path_1.default.join(__dirname, "../../output");
/** Path to global summary file */
const SUMMARY_FILE = path_1.default.join(OUTPUT_DIR, "overall_report.json");
/** Load all file-level reports */
function generateGlobalSummary() {
    if (!fs_1.default.existsSync(OUTPUT_DIR)) {
        console.log("No output directory found. Run maintainability agent first.");
        return;
    }
    const files = fs_1.default.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith("_report.json"))
        .map(f => path_1.default.join(OUTPUT_DIR, f));
    if (files.length === 0) {
        console.log("No file reports found to summarize.");
        return;
    }
    //  Load existing summary (if present)
    let globalSummary = { analyzedFiles: [] };
    if (fs_1.default.existsSync(SUMMARY_FILE)) {
        try {
            globalSummary = JSON.parse(fs_1.default.readFileSync(SUMMARY_FILE, "utf-8"));
        }
        catch {
            console.warn(" Could not parse existing summary. Rebuilding...");
        }
    }
    const analyzedFiles = new Map();
    for (const entry of globalSummary.analyzedFiles || []) {
        analyzedFiles.set(entry.file, entry);
    }
    // Process each new file report
    for (const filePath of files) {
        const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        if (!Array.isArray(data.results))
            continue; // skip invalid files
        //  Compute file stats
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
        //  Update if file exists, else append
        analyzedFiles.set(data.file, existing ? { ...existing, ...newEntry } : newEntry);
    }
    // Convert map back to array
    const finalFiles = Array.from(analyzedFiles.values());
    //  Compute overall average
    const overallAvg = finalFiles.reduce((sum, f) => sum + (f.avgScore || 0), 0) / finalFiles.length;
    const overallLevel = overallAvg < 60 ? "Low" : overallAvg < 85 ? "Medium" : "High";
    const finalSummary = {
        analyzedFiles: finalFiles,
        overallAvg: parseFloat(overallAvg.toFixed(1)),
        overallLevel,
        totalFiles: finalFiles.length,
        updatedAt: new Date().toISOString()
    };
    fs_1.default.writeFileSync(SUMMARY_FILE, JSON.stringify(finalSummary, null, 2));
    console.log(`\n Global Maintainability Summary Updated → ${SUMMARY_FILE}`);
}
