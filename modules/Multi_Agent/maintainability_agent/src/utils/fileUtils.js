"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JAVA_FOLDER = exports.AST_FOLDER = void 0;
exports.loadAllASTFiles = loadAllASTFiles;
exports.saveReport = saveReport;
exports.getRealLOCAndComments = getRealLOCAndComments;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// 🧩 Recreate __dirname and __filename for ESM
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// const OUTPUT_DIR = path_1.default.join(__dirname, "../../output");
// void OUTPUT_DIR;
/** 🧩 Path to the AST folder */
exports.AST_FOLDER = path_1.default.join(__dirname, "../../../output/uploads/ast");
/** 📁 Base path where the actual .java source files are stored */
exports.JAVA_FOLDER = path_1.default.join(__dirname, "../../../output/uploads");
/** 📦 Load all AST JSON files */
function loadAllASTFiles() {
    if (!fs_1.default.existsSync(exports.AST_FOLDER)) {
        console.error(`❌ AST folder not found: ${exports.AST_FOLDER}`);
        return [];
    }
    const files = fs_1.default
        .readdirSync(exports.AST_FOLDER)
        .filter((f) => f.endsWith(".json"));
    const asts = [];
    for (const file of files) {
        const filePath = path_1.default.join(exports.AST_FOLDER, file);
        const content = fs_1.default.readFileSync(filePath, "utf-8");
        try {
            const json = JSON.parse(content);
            asts.push({ fileName: file, data: json });
        }
        catch (err) {
            console.error(`⚠️ Failed to parse ${file}:`, err);
        }
    }
    return asts;
}
/** Save output JSON for each analyzed file */
function saveReport(fileName, data) {
    const outDir = path_1.default.join(__dirname, "../../output");
    if (!fs_1.default.existsSync(outDir))
        fs_1.default.mkdirSync(outDir, { recursive: true });
    const outPath = path_1.default.join(outDir, fileName.replace(".json", "_report.json"));
    fs_1.default.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(` Report saved → ${outPath}`);
}
/**
 *  Reads the corresponding Java source file
 * and counts real Lines of Code (LOC) and comment lines
 */
function getRealLOCAndComments(fileName) {
    // Convert JSON filename (e.g., Calculator.json) → Calculator.java
    const javaFileName = fileName.replace(".json", ".java");
    const javaFilePath = path_1.default.join(exports.JAVA_FOLDER, javaFileName);
    if (!fs_1.default.existsSync(javaFilePath)) {
        console.warn(` Java source not found for ${fileName}`);
        return { loc: 0, comments: 0 };
    }
    const content = fs_1.default.readFileSync(javaFilePath, "utf-8");
    const lines = content.split(/\r?\n/);
    let loc = 0;
    let comments = 0;
    let inBlock = false;
    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed === "")
            continue;
        // Handle block comments (/* ... */)
        if (trimmed.startsWith("/*"))
            inBlock = true;
        if (inBlock)
            comments++;
        if (trimmed.endsWith("*/")) {
            inBlock = false;
            continue;
        }
        // Single-line comments
        if (!inBlock && trimmed.startsWith("//")) {
            comments++;
            continue;
        }
        // Count as LOC if it’s not comment
        if (!inBlock && !trimmed.startsWith("//"))
            loc++;
    }
    return { loc, comments };
}
