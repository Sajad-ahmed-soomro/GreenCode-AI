"use strict";
// --------------------------------------------------------
//  Maintainability Agent – Final Version
// --------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const fileUtils_js_1 = require("./utils/fileUtils.js");
const metricsHelper_js_1 = require("./metrics/metricsHelper.js");
const scoreHelper_js_1 = require("./metrics/scoreHelper.js");
const suggestionHelper_js_1 = require("./metrics/suggestionHelper.js");
const globalSummary_js_1 = require("./summary/globalSummary.js");
function main() {
    const astFiles = (0, fileUtils_js_1.loadAllASTFiles)();
    for (const { fileName, data } of astFiles) {
        const classes = data.classes || [];
        const fileResults = [];
        //  Fetch real LOC & comments count from original Java source
        const { loc, comments } = (0, fileUtils_js_1.getRealLOCAndComments)(fileName);
        //  Loop through each class & its methods
        for (const cls of classes) {
            const methods = cls.methods || [];
            for (const method of methods) {
                // Skip malformed or constructor methods
                if (!method.name || method.name === cls.name)
                    continue;
                // Run all metric checks
                const metrics = (0, metricsHelper_js_1.evaluateAllMetrics)(method, { loc, comments });
                // Compute maintainability score for the method
                const { score: methodScore, level: methodLevel } = (0, scoreHelper_js_1.computeMethodScore)(metrics);
                // Generate human-readable improvement suggestions
                const suggestions = (0, suggestionHelper_js_1.generateSuggestions)(metrics);
                // Store results
                fileResults.push({
                    className: cls.name,
                    methodName: method.name,
                    methodScore,
                    maintainabilityLevel: methodLevel,
                    metrics,
                    suggestions,
                });
            }
        }
        //  Compute per-file average score
        const { avgScore, level } = (0, scoreHelper_js_1.computeAverageScore)(fileResults);
        // Build report object
        const report = {
            file: fileName,
            totalClasses: classes.length,
            totalMethods: fileResults.length,
            realLOC: loc,
            realComments: comments,
            averageScore: avgScore,
            maintainabilityLevel: level,
            results: fileResults,
            message: ` File ${fileName} analyzed successfully.`,
        };
        //  Console Output Summary
        console.log(`\n ${fileName}`);
        console.log(`  → Classes: ${classes.length}`);
        console.log(`  → Methods: ${fileResults.length}`);
        console.log(`  → Real LOC: ${loc}, Comments: ${comments}`);
        for (const r of fileResults) {
            console.log(`   ${r.className}.${r.methodName} → Score ${r.methodScore} (${r.maintainabilityLevel})`);
            if (r.suggestions && r.suggestions.length > 0) {
                console.log(`      ${r.suggestions[0]}`);
            }
        }
        console.log(`   File Avg: ${avgScore} → Maintainability: ${level}`);
        //  Save JSON report
        (0, fileUtils_js_1.saveReport)(fileName, report);
    }
    // Generate global maintainability summary after all files are processed
    (0, globalSummary_js_1.generateGlobalSummary)();
    console.log("\n All AST files analyzed successfully.\n");
}
//  Run the agent
main();
