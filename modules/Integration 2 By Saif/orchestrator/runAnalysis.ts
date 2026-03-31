import { getLatestJobFolder } from './jobResolver';
import { readAstJson } from './parseAst';
import { formatIssuesFromAst } from './formatter';
import { readModuleOutput } from '../api-client/fileReader';



async function run() {
    try {
        // Step 1: Resolve latest job folder
        const jobPath = getLatestJobFolder();

        // Step 2: Read AST JSON
        const ast = readAstJson(jobPath);

        // Step 3: Convert AST → Issues
        const issues = formatIssuesFromAst(ast);

        // Step 4: Output result (VERY IMPORTANT for VS Code)
        console.log(JSON.stringify(issues));
        
        const energy = readModuleOutput(jobPath, 'energy');
        


    } catch (error: any) {
        console.error(JSON.stringify({
            error: error.message
        }));
        process.exit(1);
    }
}
// Run when executed from CLI
run();