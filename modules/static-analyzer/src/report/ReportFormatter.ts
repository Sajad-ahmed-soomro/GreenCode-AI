// src/report/ReportFormatter.ts
import fs from "fs";

export class ReportFormatter {
  static toJSON(report: any, outputPath: string) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`Report saved to ${outputPath}`);
  }

  static toText(report: any): string {
    let text = `\n--- Static Analysis Report ---\n`;
    text += `Total Violations: ${report.summary.total}\n`;
    for (const v of report.details) {
      text += `\n[${v.severity.toUpperCase()}] ${v.ruleId}: ${v.description} (${v.location})`;
    }
    return text;
  }
}
