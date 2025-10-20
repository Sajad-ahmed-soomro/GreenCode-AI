import { parseFolder } from "./parser/ASTParser.js";
import { analyzeFile } from "./analyzer/index.js";
import fs from "fs";
import path from "path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(" Please provide a file or directory path");
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), inputPath);

async function run() {
  const stat = fs.statSync(fullPath);

  if (stat.isDirectory()) {
    const astOut = path.join(fullPath, "ast");
    await parseFolder(fullPath, astOut); //  generate ASTs first
    console.log(" Parsing complete, now analyzing files...\n");

    const files = fs
      .readdirSync(fullPath)
      .filter((f) => f.endsWith(".java"))
      .map((f) => path.join(fullPath, f));

    for (const file of files) {
      await analyzeFile(file);
    }
  } else {
    await analyzeFile(fullPath);
  }
}

run().catch(console.error);
