#!/usr/bin/env ts-node
import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import { scanJavaFiles } from "../core/FileScanner.js";
import { parseJavaFile } from "./ASTParser.js";
export async function parseFolder(folderPath, outDir) {
    const javaFiles = await scanJavaFiles(folderPath);
    if (javaFiles.length === 0) {
        console.log("No .java files found in", folderPath);
        return;
    }
    await fs.mkdir(outDir, { recursive: true });
    for (const file of javaFiles) {
        try {
            const astJson = await parseJavaFile(file);
            const fileName = path.basename(file, ".java") + ".json";
            const outFile = path.join(outDir, fileName);
            await fs.writeFile(outFile, JSON.stringify(astJson, null, 2), "utf8");
            console.log(" Parsed:", file, "→", outFile);
        }
        catch (err) {
            console.error(" Failed parsing", file, ":", err);
        }
    }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const folder = process.argv[2] || "samples";
    const outDir = process.argv[3] || path.join("samples", "ast");
    parseFolder(folder, outDir).catch(err => console.error(" Batch parse error:", err));
}
