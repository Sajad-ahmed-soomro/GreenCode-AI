import { parseFolder } from "./parser/ASTParser.js";
import { analyzeFile } from "./analyzer/index.js";
import fs from "fs";
import path from "path";

const inputPath = process.argv[2];
const scanOutputDir = process.argv[3]; // gateway/output/<scanId>

if (!inputPath || !scanOutputDir) {
  console.error("❌ Usage: node cli.js <projectPath> <scanOutputDir>");
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), inputPath);

async function run() {
  try {
    const stat = fs.statSync(fullPath);
    await fs.promises.mkdir(scanOutputDir, { recursive: true });

    const astOut = path.join(scanOutputDir, "ast");
    await fs.promises.mkdir(astOut, { recursive: true });

    if (stat.isDirectory()) {
      console.log(`📁 Generating ASTs into: ${astOut}`);
      await parseFolder(fullPath, astOut);

      const astFiles = fs
        .readdirSync(astOut)
        .filter(f => f.endsWith(".json"))
        .map(f => path.join(astOut, f));

      if (astFiles.length === 0) {
        console.error("❌ No AST files were generated. Check your parser!");
        process.exit(1);
      }

      for (const file of astFiles) {
        await analyzeFile(file, scanOutputDir); // CFGs + reports → scanOutputDir
      }
    } else {
      await analyzeFile(fullPath, scanOutputDir);
    }

    console.log("✅ Analysis complete!");
  } catch (err) {
    console.error("❌ CLI failed:", err);
    process.exit(1);
  }
}

run();
