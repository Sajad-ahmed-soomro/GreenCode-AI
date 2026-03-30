import { loadAllASTFiles, saveReport, getRealLOCAndComments } from "./utils/fileUtils.js";
import { evaluateAllMetrics } from "./metrics/metricsHelper.js";
import { computeMethodScore, computeAverageScore } from "./metrics/scoreHelper.js";
import { generateSuggestions } from "./metrics/suggestionHelper.js";
import { generateGlobalSummary } from "./summary/globalSummary.js";

// NEW: exported function that runs the agent once
export function runMaintainabilityAgent(astDir: string, javaDir: string,outDir:string): number {
  // pass astDir from gateway
  const astFiles = loadAllASTFiles(astDir);
  let totalFiles = 0;

  for (const { fileName, data } of astFiles) {
    const classes = data.classes || [];
    const fileResults: any[] = [];

    // pass javaDir from gateway
    const { loc, comments } = getRealLOCAndComments(fileName, javaDir);

    for (const cls of classes) {
      const methods = cls.methods || [];

      for (const method of methods) {
        if (!method.name || method.name === cls.name) continue;

        const metrics = evaluateAllMetrics(method, { loc, comments });
        const { score: methodScore, level: methodLevel } = computeMethodScore(metrics);
        const suggestions = generateSuggestions(metrics);

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

    const { avgScore, level } = computeAverageScore(fileResults);

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

    saveReport(fileName, report,outDir);
    totalFiles++;
  }

  generateGlobalSummary(outDir);
  console.log("\n All AST files analyzed successfully.\n");
  return totalFiles;
}

// Optional CLI entrypoint stays commented out
// if (require.main === module) {
//   runMaintainabilityAgent(...);
// }
