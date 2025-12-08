import { promises as fs } from "fs";
import * as path from "path";
export async function scanJavaFiles(dirPath) {
    let javaFiles = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            const subFiles = await scanJavaFiles(fullPath);
            javaFiles = javaFiles.concat(subFiles);
        }
        else if (item.isFile() && item.name.endsWith(".java")) {
            javaFiles.push(fullPath);
        }
    }
    return javaFiles;
}
if (import.meta.url === `file://${process.argv[1]}`) {
    const folder = process.argv[2] || "samples";
    scanJavaFiles(folder)
        .then(files => {
        console.log("✅ Java files found:");
        files.forEach(f => console.log(f));
    })
        .catch(err => console.error("❌ Error scanning:", err));
}
