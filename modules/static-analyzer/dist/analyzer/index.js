import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";
import gradient from "gradient-string";
import { analyzeAST, resetAnalysisTracking } from "../analysis/metrics/MetricsAnalyzer.js";
import { RuleEngine } from "../rules/RuleEngine.js";
import { ReportGenerator } from "../report/ReportGenerator.js";
import { ReportFormatter } from "../report/ReportFormatter.js";
export async function analyzeFile(targetPath, scanOutputDir) {
    console.clear();
    resetAnalysisTracking();
    console.log(gradient.pastel.multiline(figlet.textSync("GreenCode AI", { horizontalLayout: "fitted" })));
    console.log(chalk.dim("💡 Intelligent Static Code Analysis\n"));
    const stats = fs.statSync(targetPath);
    const filesToAnalyze = [];
    if (stats.isDirectory()) {
        fs.readdirSync(targetPath)
            .filter(f => f.endsWith(".json"))
            .forEach(f => filesToAnalyze.push(path.join(targetPath, f)));
    }
    else {
        filesToAnalyze.push(targetPath);
    }
    if (filesToAnalyze.length === 0) {
        console.log(chalk.red("❌ No .json AST files found to analyze."));
        return;
    }
    const reportDir = path.join(scanOutputDir, "report");
    const cfgDir = path.join(scanOutputDir, "cfg");
    const metricsDir = path.join(scanOutputDir, "metrics");
    [reportDir, cfgDir, metricsDir].forEach(dir => fs.mkdirSync(dir, { recursive: true }));
    const engine = new RuleEngine();
    const overallSummary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    for (const filePath of filesToAnalyze) {
        const fileName = path.basename(filePath);
        console.log(chalk.bold(`\n📄 Analyzing: ${fileName}\n`));
        let astJson;
        try {
            astJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch (err) {
            console.log(chalk.red(`Failed to parse ${fileName}: ${err}`));
            continue;
        }
        const analysisSpinner = ora("Generating metrics & CFGs...").start();
        let fileMetrics;
        try {
            fileMetrics = analyzeAST(astJson, fileName, metricsDir, cfgDir);
            analysisSpinner.succeed("Metrics & CFGs generated ✅");
        }
        catch (err) {
            analysisSpinner.fail(`Failed to analyze ${fileName}: ${err}`);
            continue;
        }
        const ruleSpinner = ora("Running rule engine...").start();
        let violations = [];
        try {
            violations = engine.analyzeCode(astJson, fileName, fileMetrics) || [];
            ruleSpinner.succeed(`Rule engine completed: ${violations.length} issue(s) ✅`);
        }
        catch (err) {
            ruleSpinner.fail(`Rule engine failed: ${err}`);
            continue;
        }
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
        }
        catch (err) {
            console.log(chalk.red(`Failed to save report for ${fileName}: ${err}`));
        }
    }
    console.log(chalk.bold("\n📊 Overall Analysis Summary"));
    console.log(chalk.green(`🎉 Reports and CFGs available in ${scanOutputDir}`));
}
