// --------------------------------------------------------
//  Maintainability Agent – Final Version
// --------------------------------------------------------


import { loadAllASTFiles, saveReport, getRealLOCAndComments } from "./utils/fileUtils.js";
import { evaluateAllMetrics } from "./metrics/metricsHelper.js";
import { computeMethodScore, computeAverageScore } from "./metrics/scoreHelper.js";
import { generateSuggestions } from "./metrics/suggestionHelper.js";
import { generateGlobalSummary } from "./summary/globalSummary.js";

function main(): void {
  const astFiles = loadAllASTFiles();

  for (const { fileName, data } of astFiles) {
    const classes = data.classes || [];
    const fileResults: any[] = [];

    //  Fetch real LOC & comments count from original Java source
    const { loc, comments } = getRealLOCAndComments(fileName);

    //  Loop through each class & its methods
    for (const cls of classes) {
      const methods = cls.methods || [];

      for (const method of methods) {
        // Skip malformed or constructor methods
        if (!method.name || method.name === cls.name) continue;

        // Run all metric checks
        const metrics = evaluateAllMetrics(method, { loc, comments });

        // Compute maintainability score for the method
        const { score: methodScore, level: methodLevel } = computeMethodScore(metrics);

        // Generate human-readable improvement suggestions
        const suggestions = generateSuggestions(metrics);

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
    const { avgScore, level } = computeAverageScore(fileResults);

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
      console.log(
        `   ${r.className}.${r.methodName} → Score ${r.methodScore} (${r.maintainabilityLevel})`
      );

      if (r.suggestions && r.suggestions.length > 0) {
        console.log(`      ${r.suggestions[0]}`);
      }
    }

    console.log(`   File Avg: ${avgScore} → Maintainability: ${level}`);

    //  Save JSON report
    saveReport(fileName, report);
  }
// Generate global maintainability summary after all files are processed
generateGlobalSummary();

  console.log("\n All AST files analyzed successfully.\n");
}

//  Run the agent
main();
