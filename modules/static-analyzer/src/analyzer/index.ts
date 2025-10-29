import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import Table from "cli-table3";

import { analyzeAST, resetAnalysisTracking } from "../analysis/metrics/MetricsAnalyzer.js";
import { RuleEngine } from "../rules/RuleEngine.js";
import { ReportGenerator } from "../report/ReportGenerator.js";
import { ReportFormatter } from "../report/ReportFormatter.js";

export async function analyzeFile(targetPath: string) {
  console.clear();
  resetAnalysisTracking();

  console.log(
    gradient.pastel.multiline(
      figlet.textSync("GreenCode AI", { horizontalLayout: "fitted" })
    )
  );
  console.log(chalk.dim("💡 Intelligent Static Code Analysis\n"));

  const stats = fs.statSync(targetPath);
  const filesToAnalyze: string[] = [];

  if (stats.isDirectory()) {
    const allFiles = fs.readdirSync(targetPath);
    allFiles.forEach((file) => {
      if (file.endsWith(".json")) {
        filesToAnalyze.push(path.join(targetPath, file));
      }
    });
  } else {
    filesToAnalyze.push(targetPath);
  }

  if (filesToAnalyze.length === 0) {
    console.log(chalk.red("❌ No .json AST files found to analyze."));
    return;
  }

  // Output directories
  const outputDir = path.join(process.cwd(), "output");
  const reportDir = path.join(outputDir, "report");
  const cfgDir = path.join(outputDir, "cfg");     
  const metricsDir = path.join(outputDir, "metrics"); 
  [outputDir, reportDir, cfgDir, metricsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const overallSummary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  const engine = new RuleEngine();

  for (const filePath of filesToAnalyze) {
    const fileName = path.basename(filePath);
    console.log(chalk.bold(`\n📄 Analyzing: ${fileName}\n`));

    let astJson;
    try {
      const content = fs.readFileSync(filePath, "utf8");
      astJson = JSON.parse(content);
    } catch (error) {
      console.log(chalk.red(`Failed to read/parse ${fileName}: ${error}`));
      continue;
    }

    const isMetricsFile = astJson.fileName && astJson.classes?.[0]?.methods?.[0]?.cyclomaticComplexity !== undefined;
    let fileMetrics;

    if (isMetricsFile) {
      console.log(chalk.yellow("⚠️  This appears to be a metrics file, skipping CFG generation."));
      fileMetrics = astJson;
    } else {
      const analysisSpinner = ora("Generating metrics & CFGs...").start();
      try {
        // Analyze AST and save metrics + CFG per method
        fileMetrics = analyzeAST(astJson, fileName, metricsDir, cfgDir);
        analysisSpinner.succeed("Metrics & CFGs generated ✅");
      } catch (error) {
        analysisSpinner.fail(`Failed to analyze ${fileName}: ${error}`);
        continue;
      }
    }

    // Run Rule Engine
    const ruleSpinner = ora("Running rule engine...").start();
    let violations = [];
    try {
      violations = engine.analyzeCode(astJson, fileName, fileMetrics) || [];
      ruleSpinner.succeed(`Rule engine completed: ${violations.length} issue(s) ✅`);
    } catch (error) {
      ruleSpinner.fail(`Rule engine failed: ${error}`);
      continue;
    }

    // Generate report
    try {
      const report = ReportGenerator.generate(violations);
      const reportFile = path.join(reportDir, `${fileName}.report.json`);
      ReportFormatter.toJSON(report, reportFile);

      overallSummary.total += report.summary.total;
      overallSummary.critical += report.summary.critical;
      overallSummary.high += report.summary.high;
      overallSummary.medium += report.summary.medium;
      overallSummary.low += report.summary.low;

      console.log(chalk.dim(`   📄 Report saved → ${reportFile}`));
    } catch (error) {
      console.log(chalk.red(`Failed to save report for ${fileName}: ${error}`));
    }

    // Display violations table
    if (violations.length > 0) {
      const table = new Table({
        head: ["Severity", "Rule ID", "Description", "Location"].map(h => chalk.gray(h)),
        colWidths: [12, 20, 50, 25],
        style: { compact: true },
        wordWrap: true,
      });

      violations.forEach((v) => {
        const color =
          v.severity === "critical"
            ? chalk.bgRed.white
            : v.severity === "high"
            ? chalk.red
            : v.severity === "medium"
            ? chalk.yellow
            : chalk.blue;

        table.push([color(v.severity.toUpperCase()), v.ruleId, v.description, chalk.gray(v.location)]);
      });

      console.log(table.toString());
    } else {
      console.log(chalk.green("✅ No issues found — looks clean!"));
    }
  }

  // Final summary
  console.log(chalk.bold("\n─────────────────────────────────────────────"));
  console.log(chalk.bold("📊 Overall Analysis Summary"));
  console.log(chalk.bold("─────────────────────────────────────────────"));
  console.log(chalk.dim(`   Total Issues: ${overallSummary.total}`));
  console.log(chalk.red(`   Critical: ${overallSummary.critical}`));
  console.log(chalk.yellow(`   High: ${overallSummary.high}`));
  console.log(chalk.magenta(`   Medium: ${overallSummary.medium}`));
  console.log(chalk.blue(`   Low: ${overallSummary.low}\n`));
  console.log(chalk.green("🎉 Analysis complete! Reports available in /output/report\n"));
}
