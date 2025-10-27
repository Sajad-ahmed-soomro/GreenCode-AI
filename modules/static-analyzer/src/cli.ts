import { parseFolder } from "./parser/ASTParser.js";
import { analyzeFile } from "./analyzer/index.js";
import fs from "fs";
import path from "path";
export { analyzeFile } from "./analyzer/index.js";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("❌ Please provide a file or directory path");
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), inputPath);
const outputBase = path.resolve(process.cwd(), "output/ast");

async function run() {
  const stat = fs.statSync(fullPath);

  if (stat.isDirectory()) {
    //  Generate output path as "output/ast/<folderName>"
    const folderName = path.basename(fullPath);
    const astOut = path.join(outputBase, folderName);

    // Ensure output folder exists
    await fs.promises.mkdir(astOut, { recursive: true });

    console.log(`📁 Generating ASTs into: ${astOut}`);
    await parseFolder(fullPath, astOut);

    console.log("✅ Parsing complete, now analyzing files...\n");

    const astFiles = fs
      .readdirSync(astOut)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(astOut, f));

    for (const file of astFiles) {
      await analyzeFile(file);
    }

  } else {
    await analyzeFile(fullPath);
  }
}

run().catch(console.error);
