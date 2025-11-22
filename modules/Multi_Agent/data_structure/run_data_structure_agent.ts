import * as fs from "fs";
import * as path from "path";
import DataStructureAgent from "./data_structure_agent";

function runDataStructureAgent(): void {

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
        const sourceCode: string = fs.readFileSync(javaPath, "utf8");

        // Load AST JSON
        const astData: string = fs.readFileSync(astPath, "utf8");
        const astObject: any = JSON.parse(astData);

        // Create agent
        const agent = new DataStructureAgent();

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

