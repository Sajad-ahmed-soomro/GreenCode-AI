// src/FileScanner.ts
import { promises as fs } from "fs";
import * as path from "path";

/**
 * Recursively scans a directory and returns all .java file paths
 * @param dirPath - The starting folder path
 * @returns Promise<string[]> - List of Java file paths
 */
export async function scanJavaFiles(dirPath: string): Promise<string[]> {
  let javaFiles: string[] = [];

  // Read items in current directory
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      // Recursive scan
      const subFiles = await scanJavaFiles(fullPath);
      javaFiles = javaFiles.concat(subFiles);
    } else if (item.isFile() && item.name.endsWith(".java")) {
      javaFiles.push(fullPath);
    }
  }

  return javaFiles;
}

// Standalone execution (CLI style)
// Standalone execution (CLI style in ESM)
if (import.meta.url === `file://${process.argv[1]}`) {
  const folder = process.argv[2] || "samples"; // default folder
  scanJavaFiles(folder)
    .then(files => {
      console.log("✅ Java files found:");
      files.forEach(f => console.log(f));
    })
    .catch(err => console.error("❌ Error scanning:", err));
}

