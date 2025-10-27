import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import Table from "cli-table3";

import { analyzeAST } from "../analysis/metrics/MetricsAnalyzer.js";
import { RuleEngine } from "../rules/RuleEngine.js";
import { ReportGenerator } from "../report/ReportGenerator.js";
import { ReportFormatter } from "../report/ReportFormatter.js";

export async function analyzeFile(targetPath: string) {
  console.clear();

  // 🌿 Fancy Banner
  console.log(
    gradient.pastel.multiline(
      figlet.textSync("GreenCode AI", { horizontalLayout: "fitted" })
    )
  );
  console.log(chalk.dim("💡 Intelligent Static Code Analysis\n"));

  const stats = fs.statSync(targetPath);
  const filesToAnalyze: string[] = [];

  // If user passed a directory, analyze all .json files inside
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

  const overallSummary = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const engine = new RuleEngine();

  for (const filePath of filesToAnalyze) {
    const fileName = path.basename(filePath);
    console.log(chalk.bold(`\nAnalyzing: ${fileName}\n`));

    // 🔹 Step 1: Read file
    const spinner = ora(`Reading ${fileName}...`).start();
    const content = fs.readFileSync(filePath, "utf8");
    spinner.succeed("File loaded");

    // 🔹 Step 2: Parse AST
    const astSpinner = ora("Parsing AST JSON...").start();
    let astJson;
    try {
      astJson = JSON.parse(content);
      astSpinner.succeed("AST parsed");
    } catch (error) {
      astSpinner.fail(`Failed to parse ${fileName}: ${error}`);
      continue;
    }

    // 🔹 Step 3: Determine if this is AST or CFG/Metrics
    const analysisSpinner = ora("Analyzing file...").start();
    let fileMetrics;
    let astForAnalysis = astJson;

    // Check if this is a metrics/CFG file or an AST file
    if (astJson.fileName && astJson.classes && astJson.classes[0]?.methods?.[0]?.cfg) {
      // This is a CFG/metrics file
      fileMetrics = astJson;
      analysisSpinner.succeed(
        `Metrics loaded: ${fileMetrics.classes.length} class(es), ` +
        `${fileMetrics.classes.reduce((sum: any, c: any) => sum + c.methods.length, 0)} method(s)`
      );
    } else if (astJson.file && astJson.classes) {
      // This is an AST file - calculate metrics
      fileMetrics = analyzeAST(astJson, fileName);
      analysisSpinner.succeed(
        `Metrics calculated: ${fileMetrics.classes.length} class(es), ` +
        `${fileMetrics.classes.reduce((sum, c) => sum + c.methods.length, 0)} method(s)`
      );
    } else {
      analysisSpinner.warn("Unknown file format - analyzing as raw AST");
    }

    // 🔹 Step 4: Run Rule Engine (pass both AST and metrics)
    const ruleSpinner = ora("Running rule engine...").start();
    const violations = engine.analyzeCode(astForAnalysis, fileName, fileMetrics) || [];
    ruleSpinner.succeed(`Found ${violations.length} issue(s)`);

    // 🔹 Step 5: Generate & Save Report
    const report = ReportGenerator.generate(violations);
    const outputFile = path.join(outputDir, `${fileName}.report.json`);
    ReportFormatter.toJSON(report, outputFile);

    // 🔹 Update totals
    overallSummary.total += report.summary.total;
    overallSummary.critical += report.summary.critical;
    overallSummary.high += report.summary.high;
    overallSummary.medium += report.summary.medium;
    overallSummary.low += report.summary.low;

    // 🔹 Step 6: Display table for this file
    if (violations.length > 0) {
      const table = new Table({
        head: [
          chalk.gray("Severity"),
          chalk.gray("Rule ID"),
          chalk.gray("Description"),
          chalk.gray("Location"),
        ],
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

        table.push([
          color(v.severity.toUpperCase()),
          v.ruleId,
          v.description,
          chalk.gray(v.location),
        ]);
      });

      console.log(table.toString());
    } else {
      console.log(chalk.green("✅ No issues found — looks clean!"));
    }

    console.log(chalk.dim(`Report saved → ${outputFile}\n`));
  }

  // 🔹 Final overall summary
  console.log(chalk.bold("\n─────────────────────────────────────────────"));
  console.log(chalk.bold("📊 Overall Analysis Summary"));
  console.log(chalk.bold("─────────────────────────────────────────────"));
  console.log(
    `Total: ${chalk.white(overallSummary.total)}   ` +
      `${chalk.red("Critical: " + overallSummary.critical)}   ` +
      `${chalk.yellow("High: " + overallSummary.high)}   ` +
      `${chalk.magenta("Medium: " + overallSummary.medium)}   ` +
      `${chalk.blue("Low: " + overallSummary.low)}`
  );

  console.log(chalk.bold("\n✨ Analysis complete! Reports saved in → ") + chalk.cyan(outputDir));
  console.log(chalk.dim("─────────────────────────────────────────────\n"));
}