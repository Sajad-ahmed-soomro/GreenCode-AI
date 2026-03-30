import fs from "fs";
import { RuleViolation } from "../rules/RuleEngine.js";

export interface Report {
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  details: RuleViolation[];
}

export class ReportFormatter {
  static toJSON(report: Report, outputPath: string) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`Report saved to ${outputPath}`);
  }

  static toText(report: Report): string {
    let text = `\n--- Static Analysis Report ---\n`;
    text += `Total Violations: ${report.summary.total}\n`;
    text += `Critical: ${report.summary.critical}, High: ${report.summary.high}, Medium: ${report.summary.medium}, Low: ${report.summary.low}\n`;

    for (const v of report.details) {
      text += `\n[${v.severity.toUpperCase()}] ${v.ruleId}: ${v.description} (${v.location})`;
    }
    return text;
  }
}
