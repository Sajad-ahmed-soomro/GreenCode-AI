// src/compliance_agent.ts

import { namingRules, formattingRules } from "./rules.js";
import { suggestions } from "./suggestions.js";

export interface ComplianceIssue {
  line: number;
  type: string;
  name?: string;
  message: string;
}

export interface ComplianceSuggestion {
  line: number;
  suggestion: string;
}

// minimal shape of your Java AST parts
type AstMethod = { name: string; line?: number; startLine?: number; position?: { line?: number } };
type AstField  = { name: string; line?: number; startLine?: number; position?: { line?: number } };
type AstClass  = { name: string; line?: number; startLine?: number; methods?: AstMethod[]; fields?: AstField[] };
type AstFunc   = { name: string; line?: number; startLine?: number; position?: { line?: number } };

interface JavaAst {
  file: string;
  functions?: AstFunc[];
  classes?: AstClass[];
}

// helper: pick the first available line-like property, or 0
function getNodeLine(node: { line?: number; startLine?: number; position?: { line?: number } }): number {
  return (
    node.line ??
    node.startLine ??
    node.position?.line ??
    0
  );
}

// fallback: if AST has no line info, scan source to locate name
function findLineByName(codeLines: string[], name: string): number {
  const regex = new RegExp(`\\b${name}\\b`);
  for (let i = 0; i < codeLines.length; i++) {
    if (regex.test(codeLines[i])) return i + 1;
  }
  return 0;
}

export default class ComplianceAgent {
  constructor() {
    console.log("AST-Based Compliance Agent Loaded");
  }

  /**
   * Analyze using AST + raw code
   */
  analyze(code: string, ast: JavaAst) {
    const issues: ComplianceIssue[] = [];
    const suggestionsList: ComplianceSuggestion[] = [];

    const lines = code.split(/\r?\n/);

    // ======================================================
    // 1. AST: TOP-LEVEL FUNCTION CHECKS
    // ======================================================
    if (ast.functions && Array.isArray(ast.functions)) {
      const fnRule = namingRules.find(r => r.name === "function_snake_case");

      ast.functions.forEach(func => {
        if (!fnRule) return;
        const fname = func.name;
        if (!fname) return;

        if (!fnRule.pattern.test(fname)) {
          let line = getNodeLine(func);
          if (!line) line = findLineByName(lines, fname);

          issues.push({
            line,
            type: "Naming Issue",
            name: fname,
            message: fnRule.message
          });

          suggestionsList.push({
            line,
            suggestion: suggestions.suggestSnakeCase(fname)
          });
        }
      });
    }

    // ======================================================
    // 2. AST: CLASS + CLASS MEMBERS
    // ======================================================
    if (ast.classes && Array.isArray(ast.classes)) {
      const classRule = namingRules.find(r => r.name === "class_pascal_case");
      const methodRule = namingRules.find(r => r.name === "function_snake_case");
      const fieldRule = namingRules.find(r => r.name === "variable_snake_case");

      ast.classes.forEach(cls => {
        const className = cls.name;

        // ---------- CLASS NAME ----------
        if (classRule && className && !classRule.pattern.test(className)) {
          let line = getNodeLine(cls);
          if (!line) line = findLineByName(lines, className);

          issues.push({
            line,
            type: "Naming Issue",
            name: className,
            message: classRule.message
          });

          suggestionsList.push({
            line,
            suggestion: suggestions.suggestPascalCase(className)
          });
        }

        // ---------- CLASS METHODS ----------
        if (cls.methods && Array.isArray(cls.methods) && methodRule) {
          cls.methods.forEach(method => {
            const mname = method.name;
            if (!mname) return;

            if (!methodRule.pattern.test(mname)) {
              let line = getNodeLine(method);
              if (!line) line = findLineByName(lines, mname);

              issues.push({
                line,
                type: "Naming Issue",
                name: mname,
                message: methodRule.message
              });

              suggestionsList.push({
                line,
                suggestion: suggestions.suggestSnakeCase(mname)
              });
            }
          });
        }

        // ---------- CLASS FIELDS ----------
        if (cls.fields && Array.isArray(cls.fields) && fieldRule) {
          cls.fields.forEach(field => {
            const fname = field.name;
            if (!fname) return;

            if (!fieldRule.pattern.test(fname)) {
              let line = getNodeLine(field);
              if (!line) line = findLineByName(lines, fname);

              issues.push({
                line,
                type: "Naming Issue",
                name: fname,
                message: fieldRule.message
              });

              suggestionsList.push({
                line,
                suggestion: suggestions.suggestSnakeCase(fname)
              });
            }
          });
        }
      });
    }

    // ======================================================
    // 3. RAW CODE CHECKS (FORMAT + DEAD CODE)
    // ======================================================
    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      // formatting rules
      formattingRules.forEach(rule => {
        if (rule.pattern.test(lineText)) {
          issues.push({
            line: lineNumber,
            type: "Formatting Issue",
            message: rule.message
          });

          if (rule.name === "no_trailing_spaces") {
            suggestionsList.push({
              line: lineNumber,
              suggestion: suggestions.suggestRemoveTrailingSpaces(lineNumber)
            });
          }
        }
      });

      // long line rule
      const longRule = formattingRules.find(r => r.name === "line_length_limit");
      if (longRule && longRule.pattern.test(lineText)) {
        issues.push({
          line: lineNumber,
          type: "Formatting Issue",
          message: longRule.message
        });

        suggestionsList.push({
          line: lineNumber,
          suggestion: suggestions.suggestSplitLongLine(lineNumber)
        });
      }

      // commented-out dead code
      if (/\/\/.*(;|\{|\})/.test(lineText)) {
        issues.push({
          line: lineNumber,
          type: "Dead Code",
          message: "Commented-out code detected."
        });

        suggestionsList.push({
          line: lineNumber,
          suggestion: suggestions.suggestRemoveDeadCode(lineNumber)
        });
      }
    });

    // ======================================================
    // FINAL OUTPUT
    // ======================================================
    return {
      agent: "ComplianceAgent",
      issues,
      suggestions: suggestionsList
    };
  }
}
