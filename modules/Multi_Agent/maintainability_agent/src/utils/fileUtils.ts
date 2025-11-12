import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 🧩 Recreate __dirname and __filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "../../output");

/** 🧩 Path to the AST folder */
export const AST_FOLDER = path.join(
  __dirname,
  "../../../output/uploads/ast"
);

/** 📁 Base path where the actual .java source files are stored */
export const JAVA_FOLDER = path.join(
  __dirname,
  "../../../output/uploads"
);

/** 📦 Load all AST JSON files */
export function loadAllASTFiles(): any[] {
  if (!fs.existsSync(AST_FOLDER)) {
    console.error(`❌ AST folder not found: ${AST_FOLDER}`);
    return [];
  }

  const files = fs
    .readdirSync(AST_FOLDER)
    .filter((f) => f.endsWith(".json"));
  const asts: any[] = [];

  for (const file of files) {
    const filePath = path.join(AST_FOLDER, file);
    const content = fs.readFileSync(filePath, "utf-8");
    try {
      const json = JSON.parse(content);
      asts.push({ fileName: file, data: json });
    } catch (err) {
      console.error(`⚠️ Failed to parse ${file}:`, err);
    }
  }

  return asts;
}


/** Save output JSON for each analyzed file */
export function saveReport(fileName: string, data: any) {
  const outDir = path.join(__dirname, "../../output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, fileName.replace(".json", "_report.json"));
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(` Report saved → ${outPath}`);
}

/** 
 *  Reads the corresponding Java source file 
 * and counts real Lines of Code (LOC) and comment lines 
 */
export function getRealLOCAndComments(fileName: string): { loc: number; comments: number } {
  // Convert JSON filename (e.g., Calculator.json) → Calculator.java
  const javaFileName = fileName.replace(".json", ".java");
  const javaFilePath = path.join(JAVA_FOLDER, javaFileName);

  if (!fs.existsSync(javaFilePath)) {
    console.warn(` Java source not found for ${fileName}`);
    return { loc: 0, comments: 0 };
  }

  const content = fs.readFileSync(javaFilePath, "utf-8");
  const lines = content.split(/\r?\n/);

  let loc = 0;
  let comments = 0;
  let inBlock = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;

    // Handle block comments (/* ... */)
    if (trimmed.startsWith("/*")) inBlock = true;
    if (inBlock) comments++;
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
    if (!inBlock && !trimmed.startsWith("//")) loc++;
  }

  return { loc, comments };
}
