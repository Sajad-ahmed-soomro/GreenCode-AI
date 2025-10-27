// src/rules/RuleEngine.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { FileMetrics } from "../types/MethodMetrics.js";

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
    const possiblePaths = [
      path.join(__dirname, "../config/rules.json"),
      path.join(__dirname, "../../src/config/rules.json"),
      path.join(process.cwd(), "src/config/rules.json"),
    ];

    const configPath = possiblePaths.find((p) => fs.existsSync(p));

    if (!configPath) {
      throw new Error("❌ rules.json not found in any expected path.");
    }

    console.log("✅ Loaded rules from:", configPath);
    this.rules = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  analyzeCode(astJson: any, fileName: string, metrics?: FileMetrics): RuleViolation[] {
    const results: RuleViolation[] = [];

    const ast = typeof astJson === "string" ? JSON.parse(astJson) : astJson;

    // Run structure-based checks
    this.analyzeAST(ast, fileName, results);

    // Run metrics-based checks if available
    if (metrics?.classes?.length) {
      this.analyzeMetrics(metrics, fileName, results);
    }

    return results;
  }

  private analyzeAST(node: any, fileName: string, results: RuleViolation[]): void {
    if (!node) return;

    // Security / Style / Documentation
    this.checkSecurityIssues(node, fileName, results);
    this.checkStyleIssues(node, fileName, results);
    this.checkDocumentation(node, fileName, results);

    // Traverse recursively
    if (Array.isArray(node)) {
      node.forEach(item => this.analyzeAST(item, fileName, results));
    } else if (typeof node === "object") {
      for (const key of Object.keys(node)) {
        const value = node[key];
        if (value && typeof value === "object") {
          this.analyzeAST(value, fileName, results);
        }
      }
    }
  }

  /* ---------------- Security Rules ---------------- */
  private checkSecurityIssues(node: any, fileName: string, results: RuleViolation[]): void {
    if (!node || typeof node !== "object") return;

    if (node.methods && Array.isArray(node.methods)) {
      node.methods.forEach((method: any) => {
        const allCode = JSON.stringify(method);

        if (allCode.includes("eval(")) {
          results.push(this.createViolation("QS001", fileName, method, 
            `Dangerous eval() usage in ${node.name}.${method.name}()`));
        }

        if (allCode.match(/password\s*=\s*["']|apikey\s*=\s*["']|secret\s*=\s*["']/i)) {
          results.push(this.createViolation("QS002", fileName, method,
            `Hardcoded credential detected in ${node.name}.${method.name}()`));
        }

        if (allCode.match(/executeQuery.*\+|query.*\+|SELECT.*\+|INSERT.*\+/i)) {
          results.push(this.createViolation("QS003", fileName, method,
            `Possible SQL injection in ${node.name}.${method.name}()`));
        }

        if (allCode.match(/Runtime\.getRuntime\(\)\.exec|ProcessBuilder|exec\(/i)) {
          results.push(this.createViolation("QS008", fileName, method,
            `System command execution in ${node.name}.${method.name}()`));
        }
      });
    }
  }

  /* ---------------- Style Rules ---------------- */
  private checkStyleIssues(node: any, fileName: string, results: RuleViolation[]): void {
    if (!node || typeof node !== "object") return;

    if (node.methods && Array.isArray(node.methods)) {
      node.methods.forEach((method: any) => {
        if (method.conditionals?.includes("switch")) {
          const hasDefault = this.hasDefaultInTree(method.conditionalsTree);
          if (!hasDefault) {
            results.push(this.createViolation("QA003", fileName, method,
              `Switch without default case in ${node.name}.${method.name}()`));
          }
        }
      });
    }
  }

  private hasDefaultInTree(tree: any): boolean {
    if (!tree || !Array.isArray(tree)) return false;
    return tree.some((node: any) => {
      if (!node) return false;
      if (node.type === "default" || node.type === "DefaultStatement") return true;
      return (
        this.hasDefaultInTree(node.thenBlock) ||
        this.hasDefaultInTree(node.elseBlock)
      );
    });
  }

  /* ---------------- Documentation Rules ---------------- */
  private checkDocumentation(node: any, fileName: string, results: RuleViolation[]): void {
    if (!node || typeof node !== "object") return;

    if (node.methods && Array.isArray(node.methods)) {
      node.methods.forEach((method: any) => {
        if (method.modifiers?.includes("public") && !method.javadoc && !method.comment) {
          results.push(this.createViolation("QD001", fileName, method,
            `Missing documentation for ${node.name}.${method.name}()`));
        }
      });
    }
  }

  /* ---------------- Metrics Rules ---------------- */
  private analyzeMetrics(metrics: FileMetrics, fileName: string, results: RuleViolation[]): void {
    if (metrics.classes.length > 1) {
      results.push(this.createViolation("QA004", fileName, null, 
        `File contains ${metrics.classes.length} classes`));
    }

    for (const cls of metrics.classes) {
      const className = cls.className;

      for (const method of cls.methods) {
        const methodName = method.name || "unknownMethod";
        const { cyclomaticComplexity, functionSize, nestingDepth } = method;

        if (cyclomaticComplexity > 10) {
          results.push(this.createViolation("QA006", fileName, null,
            `High cyclomatic complexity (${cyclomaticComplexity}) in ${className}.${methodName}()`));
        }

        if (functionSize > 50) {
          results.push(this.createViolation("QA007", fileName, null,
            `Large function (${functionSize} statements) in ${className}.${methodName}()`));
        }

        if (nestingDepth > 4) {
          results.push(this.createViolation("QA008", fileName, null,
            `Deep nesting (${nestingDepth} levels) in ${className}.${methodName}()`));
        }
      }
    }
  }

  /* ---------------- Helper Methods ---------------- */
  private createViolation(ruleId: string, file: string, node: any, message?: string): RuleViolation {
    const rule = this.getRule(ruleId);
    const location = node ? this.getNodeLocation(file, node) : file;
    
    return {
      ruleId,
      description: message || rule.desc,
      severity: rule.severity,
      location,
    };
  }

  private getNodeLocation(file: string, node: any): string {
    if (node.name) return `${file} > ${node.name}`;
    const line = node.position?.line || node.line || "?";
    return `${file}:${line}`;
  }

  private getRule(ruleId: string) {
    for (const cat of Object.values(this.rules.categories)) {
      if ((cat as any)[ruleId]) return (cat as any)[ruleId];
    }
    return { desc: "Unknown rule", severity: "low" };
  }
}
