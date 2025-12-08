"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const data_structure_agent_1 = __importDefault(require("./data_structure_agent"));
function runDataStructureAgent() {
    const samplesDir = path.join(__dirname, "samples");
    const astDir = path.join(__dirname, "asts");
    const resultsDir = path.join(__dirname, "results");
    // Ensure results folder exists
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
    }
    // Read all .java files from samples folder
    const files = fs.readdirSync(samplesDir).filter(f => f.endsWith(".java"));
    let totalAnalyzed = 0;
    for (const file of files) {
        const javaPath = path.join(samplesDir, file);
        const astFileName = file.replace(".java", ".json");
        const astPath = path.join(astDir, astFileName);
        // If AST doesn't exist → skip
        if (!fs.existsSync(astPath)) {
            console.log(`Skipping ${file}: AST not found`);
            continue;
        }
        // Load Java source
        const sourceCode = fs.readFileSync(javaPath, "utf8");
        // Load AST JSON
        const astData = fs.readFileSync(astPath, "utf8");
        const astObject = JSON.parse(astData);
        // Create agent
        const agent = new data_structure_agent_1.default();
        // Give file content to agent
        agent.loadInput(sourceCode, astObject);
        // Run agent analysis
        agent.analyze();
        // Build final report
        const report = agent.buildReport();
        report.fileName = file;
        // Save report in results folder
        const resultFileName = file.replace(".java", ".report.json");
        const outputPath = path.join(resultsDir, resultFileName);
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
        console.log(`Analyzed: ${file}`);
        totalAnalyzed++;
    }
    console.log(`\nCompleted. Total files analyzed: ${totalAnalyzed}`);
}
runDataStructureAgent();
