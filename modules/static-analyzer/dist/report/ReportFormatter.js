import fs from "fs";
export class ReportFormatter {
    static toJSON(report, outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
        console.log(`Report saved to ${outputPath}`);
    }
    static toText(report) {
        let text = `\n--- Static Analysis Report ---\n`;
        text += `Total Violations: ${report.summary.total}\n`;
        text += `Critical: ${report.summary.critical}, High: ${report.summary.high}, Medium: ${report.summary.medium}, Low: ${report.summary.low}\n`;
        for (const v of report.details) {
            text += `\n[${v.severity.toUpperCase()}] ${v.ruleId}: ${v.description} (${v.location})`;
        }
        return text;
    }
}
