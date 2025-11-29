"use strict";
// run_optimization_agent.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOptimizationAgent = runOptimizationAgent;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const optimizationAgent_1 = require("./src/optimizationAgent");
function runOptimizationAgent(uploadId, runId) {
    // __dirname = modules/Multi_Agent/optimization
    // gateway = modules/gateway
    const gatewayRoot = path.join(__dirname, "..", "..", "gateway");
    const uploadRoot = path.join(gatewayRoot, "uploads", uploadId);
    const modelDir = path.join(uploadRoot, "samples", "model");
    const astDir = path.join(uploadRoot, "samples", "ast");
    const outputRoot = path.join(gatewayRoot, "output", runId);
    const reportDir = path.join(outputRoot, "report");
    if (!fs.existsSync(modelDir) || !fs.existsSync(astDir)) {
        console.error("Model or AST directory not found for upload:", uploadId);
        console.error("Expected modelDir:", modelDir);
        console.error("Expected astDir:", astDir);
        return;
    }
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    const files = fs.readdirSync(modelDir).filter((f) => f.endsWith(".java"));
    if (files.length === 0) {
        console.log("No Java files found in:", modelDir);
        return;
    }
    const agent = new optimizationAgent_1.OptimizationAgent();
    let totalAnalyzed = 0;
    for (const file of files) {
        const javaPath = path.join(modelDir, file);
        const astFileName = file.replace(".java", ".json");
        const astPath = path.join(astDir, astFileName);
        if (!fs.existsSync(astPath)) {
            console.log(`Skipping ${file}: AST not found at ${astPath}`);
            continue;
        }
        // Load and parse the Java AST JSON
        const astRaw = fs.readFileSync(astPath, "utf8");
        const astJson = JSON.parse(astRaw);
        const results = agent.analyzeJavaAst(javaPath, astJson);
        const report = {
            fileName: file,
            uploadId,
            runId,
            sourcePath: javaPath,
            astPath,
            agent: "optimization",
            results
        };
        const resultFileName = file.replace(".java", ".optimization.report.json");
        const outputPath = path.join(reportDir, resultFileName);
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
        console.log(`OptimizationAgent analyzed: ${file}`);
        totalAnalyzed++;
    }
    console.log(`\nOptimizationAgent completed. Total files analyzed: ${totalAnalyzed}`);
}
if (require.main === module) {
    const [, , uploadId, runId] = process.argv;
    if (!uploadId || !runId) {
        console.error("Usage: ts-node run_optimization_agent.ts <uploadId> <runId>");
        process.exit(1);
    }
    runOptimizationAgent(uploadId, runId);
}
