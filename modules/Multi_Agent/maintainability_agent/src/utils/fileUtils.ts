import fs from "fs";
import path from "path";

// 🧩 Recreate __dirname and __filename for ESM (still used by saveReport)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// ❌ remove AST_FOLDER / JAVA_FOLDER globals
// export const AST_FOLDER = ...
// export const JAVA_FOLDER = ...

/** 📦 Load all AST JSON files from a given directory */
export function loadAllASTFiles(astDir: string): any[] {
  if (!fs.existsSync(astDir)) {
    console.error(`❌ AST folder not found: ${astDir}`);
    return [];
  }

  const files = fs
    .readdirSync(astDir)
    .filter((f) => f.endsWith(".json"));

  const asts: any[] = [];

  for (const file of files) {
    const filePath = path.join(astDir, file);
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
export function saveReport(fileName: string, data: any, outDir: string) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, fileName.replace(".json", "_report.json"));
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(` Report saved → ${outPath}`);
}


/**
 * Reads the corresponding Java source file and
 * counts real LOC and comment lines, using a provided javaDir.
 */
export function getRealLOCAndComments(
  fileName: string,
  javaDir: string
): { loc: number; comments: number } {
  const javaFileName = fileName.replace(".json", ".java");
  const javaFilePath = path.join(javaDir, javaFileName);

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
