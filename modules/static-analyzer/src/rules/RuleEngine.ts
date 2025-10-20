// src/rules/RuleEngine.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RuleViolation {
  ruleId: string;
  description: string;
  severity: string;
  location: string;
}

export class RuleEngine {
  private rules: any;

  constructor() {
    const configPath = path.join(__dirname, "../../src/config/rules.json");
    this.rules = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  analyzeCode(code: string, fileName: string): RuleViolation[] {
    const results: RuleViolation[] = [];

    // --- Style Rules ---
    if (/import .*;[\s\S]*import .*;/g.test(code)) {
      results.push(this.createViolation("QA001", fileName, "Duplicate imports found"));
    }
    if (code.includes("eval(")) {
      results.push(this.createViolation("QS001", fileName, "eval() detected"));
    }
    if (/password\s*=\s*["'].*["']/i.test(code)) {
      results.push(this.createViolation("QS002", fileName, "Hardcoded password found"));
    }
    if (/Runtime\.getRuntime\(\)\.exec/.test(code)) {
      results.push(this.createViolation("QS008", fileName, "System command execution found"));
    }

    // --- Missing Default in Switch ---
    const switchMatches = code.match(/switch\s*\(.*\)[\s\S]*?\{/g);
    if (switchMatches && !/default\s*:/g.test(code)) {
      results.push(this.createViolation("QA003", fileName, "Switch without default case"));
    }

    return results;
  }

  private createViolation(ruleId: string, file: string, message?: string): RuleViolation {
    const rule = this.getRule(ruleId);
    return {
      ruleId,
      description: message || rule.desc,
      severity: rule.severity,
      location: file,
    };
  }

  private getRule(ruleId: string) {
    for (const cat of Object.values(this.rules.categories)) {
      if ((cat as any)[ruleId]) return (cat as any)[ruleId];
    }
    return { desc: "Unknown rule", severity: "low" };
  }
}
