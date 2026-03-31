"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jobResolver_1 = require("./jobResolver");
const parseAst_1 = require("./parseAst");
const formatter_1 = require("./formatter");
const fileReader_1 = require("../api-client/fileReader");
async function run() {
    try {
        // Step 1: Resolve latest job folder
        const jobPath = (0, jobResolver_1.getLatestJobFolder)();
        // Step 2: Read AST JSON
        const ast = (0, parseAst_1.readAstJson)(jobPath);
        // Step 3: Convert AST → Issues
        const issues = (0, formatter_1.formatIssuesFromAst)(ast);
        // Step 4: Output result (VERY IMPORTANT for VS Code)
        console.log(JSON.stringify(issues));
        const energy = (0, fileReader_1.readModuleOutput)(jobPath, 'energy');
    }
    catch (error) {
        console.error(JSON.stringify({
            error: error.message
        }));
        process.exit(1);
    }
}
// Run when executed from CLI
run();
