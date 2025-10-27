// src/report/ReportGenerator.ts
import { RuleViolation } from "../rules/RuleEngine.js";

export class ReportGenerator {
  static generate(violations?: RuleViolation[]) {
    // ✅ Safety check — ensures we always have a valid array
    if (!Array.isArray(violations)) {
      console.error(" ReportGenerator.generate() received invalid data:", violations);
      violations = [];
    }

    const grouped = violations.reduce((acc: any, v) => {
      if (!acc[v.severity]) acc[v.severity] = [];
      acc[v.severity].push(v);
      return acc;
    }, {});

    const report = {
      summary: {
        total: violations.length,
        critical: grouped["critical"]?.length || 0,
        high: grouped["high"]?.length || 0,
        medium: grouped["medium"]?.length || 0,
        low: grouped["low"]?.length || 0,
      },
      details: violations,
    };

    console.log("✅ Generated report summary:", report.summary);
    return report;
  }
}
