"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runComplianceAgent = runComplianceAgent;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compliance_agent_js_1 = __importDefault(require("./compliance_agent.js"));
/**
 * Run compliance agent over all Java files using their ASTs.
 * @param {string} samplesDir  uploads/<scanId>_extracted/samples
 * @param {string} astDir      output/<scanId>_extracted/ast
 * @param {string} outDir      output/<scanId>_extracted/compliance
 * @returns {number} total files analyzed
 */
function runComplianceAgent(samplesDir, astDir, outDir) {
    if (!fs_1.default.existsSync(samplesDir) || !fs_1.default.existsSync(astDir)) {
        console.error("❌ Compliance: samples or AST dir not found");
        console.error("   samplesDir:", samplesDir);
        console.error("   astDir:", astDir);
        return 0;
    }
    fs_1.default.mkdirSync(outDir, { recursive: true });
    const files = fs_1.default.readdirSync(samplesDir).filter(f => f.endsWith(".java"));
    if (files.length === 0) {
        console.log("⚠️  Compliance: no .java files in", samplesDir);
        return 0;
    }
    const agent = new compliance_agent_js_1.default();
    let total = 0;
    for (const file of files) {
        const javaPath = path_1.default.join(samplesDir, file);
        const astPath = path_1.default.join(astDir, file.replace(".java", ".json"));
        if (!fs_1.default.existsSync(astPath)) {
            console.log(`⏭️  Compliance: skipping ${file}, AST missing at ${astPath}`);
            continue;
        }
        const sourceCode = fs_1.default.readFileSync(javaPath, "utf8");
        const astJson = JSON.parse(fs_1.default.readFileSync(astPath, "utf8"));
        const result = agent.analyze(sourceCode, astJson);
        const outFile = file.replace(".java", ".compliance.report.json");
        const outPath = path_1.default.join(outDir, outFile);
        fs_1.default.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
        console.log(`✅ Compliance analyzed: ${file}`);
        total++;
    }
    console.log(`\nComplianceAgent completed. Total files analyzed: ${total}`);
    return total;
}
