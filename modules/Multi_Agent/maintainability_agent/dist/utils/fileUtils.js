import fs from "fs";
import path from "path";
export function loadAllASTFiles(astDir) {
    if (!fs.existsSync(astDir)) {
        console.error(`❌ AST folder not found: ${astDir}`);
        return [];
    }
    const files = fs
        .readdirSync(astDir)
        .filter((f) => f.endsWith(".json"));
    const asts = [];
    for (const file of files) {
        const filePath = path.join(astDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
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
export function saveReport(fileName, data, outDir) {
    if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, fileName.replace(".json", "_report.json"));
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(` Report saved → ${outPath}`);
}
export function getRealLOCAndComments(fileName, javaDir) {
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
        if (trimmed === "")
            continue;
        if (trimmed.startsWith("/*"))
            inBlock = true;
        if (inBlock)
            comments++;
        if (trimmed.endsWith("*/")) {
            inBlock = false;
            continue;
        }
        if (!inBlock && trimmed.startsWith("//")) {
            comments++;
            continue;
        }
        if (!inBlock && !trimmed.startsWith("//"))
            loc++;
    }
    return { loc, comments };
}
