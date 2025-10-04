#!/usr/bin/env ts-node
import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

import { scanJavaFiles } from "./FileScanner.js";
import { parseJavaFile } from "./ASTParser.js";

/**
 * Parse all Java files in a folder and output .json AST files
 */
export async function parseFolder(folderPath: string, outDir: string) {
  // 1. Scan folder
  const javaFiles = await scanJavaFiles(folderPath);
  if (javaFiles.length === 0) {
    console.log("⚠️ No .java files found in", folderPath);
    return;
  }

  // 2. Ensure output dir exists
  await fs.mkdir(outDir, { recursive: true });

  // 3. Parse each file and save JSON
  for (const file of javaFiles) {
    try {
      const astJson = await parseJavaFile(file); // returns JSON object
      const fileName = path.basename(file, ".java") + ".json";
      const outFile = path.join(outDir, fileName);

      await fs.writeFile(outFile, JSON.stringify(astJson, null, 2), "utf8");
      console.log("✅ Parsed:", file, "→", outFile);
    } catch (err) {
      console.error("❌ Failed parsing", file, ":", err);
    }
  }
}

// ---------------- CLI entrypoint (ESM replacement for require.main) ----------------
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const folder = process.argv[2] || "samples";
  const outDir = process.argv[3] || path.join("samples", "ast");

  parseFolder(folder, outDir).catch(err =>
    console.error("❌ Batch parse error:", err)
  );
}
