 // src/compliance_agent.ts - UPDATED FOR JAVA CAMELCASE

import { namingRules, formattingRules } from "./rules.js";
import { suggestions } from "./suggestions.js";

export interface ComplianceIssue {
  line: number;
  type: string;
  name?: string;
  message: string;
  severity?: "low" | "medium" | "high"; // Added severity
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

// Helper to detect if a field is a Java constant
function isConstantField(fieldName: string, lineText: string): boolean {
  const line = lineText.toLowerCase();
  
  // Heuristic 1: Name is already in UPPER_CASE
  if (/^[A-Z][A-Z0-9_]*$/.test(fieldName)) {
    return true;
  }
  
  // Heuristic 2: Line contains "static final" or "final static"
  if (line.includes('static final') || line.includes('final static')) {
    return true;
  }
  
  // Heuristic 3: Line contains "public static final" or "private static final"
  if (line.includes('public static final') || line.includes('private static final')) {
    return true;
  }
  
  // Heuristic 4: Common constant naming patterns
  const commonConstantPatterns = [
    'MAX_', 'MIN_', 'DEFAULT_', 'TYPE_', 'FLAG_', 
    'ERROR_', 'SUCCESS_', 'VERSION_', 'CONFIG_',
    'THRESHOLD_', 'LIMIT_', 'COUNT_', 'SIZE_'
  ];
  
  return commonConstantPatterns.some(pattern => 
    fieldName.toUpperCase().startsWith(pattern)
  );
}

// Helper to detect if a method is a getter/setter
function isGetterSetterMethod(methodName: string): { isGetter: boolean; isSetter: boolean; isBooleanGetter: boolean } {
  const result = { isGetter: false, isSetter: false, isBooleanGetter: false };
  
  if (methodName.startsWith('get') && methodName.length > 3) {
    result.isGetter = true;
  } else if (methodName.startsWith('set') && methodName.length > 3) {
    result.isSetter = true;
  } else if (
    (methodName.startsWith('is') && methodName.length > 2) ||
    (methodName.startsWith('has') && methodName.length > 3) ||
    (methodName.startsWith('can') && methodName.length > 3)
  ) {
    result.isBooleanGetter = true;
  }
  
  return result;
}

export default class ComplianceAgent {
  constructor() {
    console.log("Java Compliance Agent Loaded (camelCase support)");
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
      const fnRule = namingRules.find(r => r.name === "method_camel_case"); // Updated

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
            message: fnRule.message,
            severity: "medium"
          });

          suggestionsList.push({
            line,
            suggestion: suggestions.suggestCamelCase(fname) // Updated
          });
        }
      });
    }

    // ======================================================
    // 2. AST: CLASS + CLASS MEMBERS
    // ======================================================
    if (ast.classes && Array.isArray(ast.classes)) {
      const classRule = namingRules.find(r => r.name === "class_pascal_case");
      const methodRule = namingRules.find(r => r.name === "method_camel_case"); // Updated
      const fieldRule = namingRules.find(r => r.name === "variable_camel_case"); // Updated
      const constantRule = namingRules.find(r => r.name === "constant_upper_snake_case"); // Added

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
            message: classRule.message,
            severity: "high" // Class naming is important
          });

          suggestionsList.push({
            line,
            suggestion: suggestions.suggestPascalCase(className)
          });
        }

        // ---------- CLASS METHODS ----------
        if (cls.methods && Array.isArray(cls.methods)) {
          cls.methods.forEach(method => {
            const mname = method.name;
            if (!mname) return;

            let line = getNodeLine(method);
            if (!line) line = findLineByName(lines, mname);
            
            // Check for getter/setter patterns
            const methodType = isGetterSetterMethod(mname);
            
            // Special handling for getters/setters
            if (methodType.isGetter || methodType.isSetter || methodType.isBooleanGetter) {
              // Verify the method name follows proper camelCase after prefix
              const baseName = mname.substring(methodType.isGetter ? 3 : 
                                               methodType.isSetter ? 3 : 
                                               methodType.isBooleanGetter ? (mname.startsWith('is') ? 2 : 3) : 0);
              
              if (baseName.length === 0 || !/^[A-Z]/.test(baseName)) {
                // Getters/setters should have capital letter after prefix
                issues.push({
                  line,
                  type: "Naming Issue",
                  name: mname,
                  message: methodType.isGetter ? "Getter method should follow getPropertyName() pattern" :
                          methodType.isSetter ? "Setter method should follow setPropertyName() pattern" :
                          "Boolean getter should follow isPropertyName() or hasPropertyName() pattern",
                  severity: "medium"
                });
                
                if (methodType.isGetter) {
                  suggestionsList.push({
                    line,
                    suggestion: suggestions.suggestGetterMethodName(baseName.toLowerCase())
                  });
                } else if (methodType.isSetter) {
                  suggestionsList.push({
                    line,
                    suggestion: suggestions.suggestSetterMethodName(baseName.toLowerCase())
                  });
                } else if (methodType.isBooleanGetter) {
                  suggestionsList.push({
                    line,
                    suggestion: suggestions.suggestBooleanGetterMethodName(mname)
                  });
                }
              }
            }
            
            // Regular method naming check
            else if (methodRule && !methodRule.pattern.test(mname)) {
              issues.push({
                line,
                type: "Naming Issue",
                name: mname,
                message: methodRule.message,
                severity: "medium"
              });

              suggestionsList.push({
                line,
                suggestion: suggestions.suggestCamelCase(mname) // Updated
              });
            }
          });
        }

        // ---------- CLASS FIELDS ----------
        if (cls.fields && Array.isArray(cls.fields)) {
          cls.fields.forEach(field => {
            const fname = field.name;
            if (!fname) return;

            let line = getNodeLine(field);
            if (!line) line = findLineByName(lines, fname);
            
            // Get the line text for better constant detection
            const lineText = line ? lines[line - 1] : '';
            
            // Check if it's a constant
            if (isConstantField(fname, lineText)) {
              // Apply constant rule
              if (constantRule && !constantRule.pattern.test(fname)) {
                issues.push({
                  line,
                  type: "Naming Issue",
                  name: fname,
                  message: constantRule.message,
                  severity: "medium"
                });

                suggestionsList.push({
                  line,
                  suggestion: suggestions.suggestUpperSnakeCase(fname) // Updated
                });
              }
            } else {
              // Apply regular variable rule
              if (fieldRule && !fieldRule.pattern.test(fname)) {
                issues.push({
                  line,
                  type: "Naming Issue",
                  name: fname,
                  message: fieldRule.message,
                  severity: "low"
                });

                suggestionsList.push({
                  line,
                  suggestion: suggestions.suggestCamelCase(fname) // Updated
                });
              }
            }
          });
        }
      });
    }

    // ======================================================
    // 3. RAW CODE CHECKS (FORMAT + DEAD CODE + IMPORTS)
    // ======================================================
    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;

      // ---------- FORMATTING RULES ----------
      formattingRules.forEach(rule => {
        if (rule.pattern.test(lineText)) {
          issues.push({
            line: lineNumber,
            type: "Formatting Issue",
            message: rule.message,
            severity: "low"
          });

          if (rule.name === "no_trailing_spaces") {
            suggestionsList.push({
              line: lineNumber,
              suggestion: suggestions.suggestRemoveTrailingSpaces(lineNumber)
            });
          } else if (rule.name === "no_tabs_allowed") {
            suggestionsList.push({
              line: lineNumber,
              suggestion: `Replace tabs with spaces on line ${lineNumber}`
            });
          }
        }
      });

      // ---------- LONG LINE RULE ----------
      const longRule = formattingRules.find(r => r.name === "line_length_limit");
      if (longRule && longRule.pattern.test(lineText)) {
        issues.push({
          line: lineNumber,
          type: "Formatting Issue",
          message: longRule.message,
          severity: "low"
        });

        suggestionsList.push({
          line: lineNumber,
          suggestion: suggestions.suggestSplitLongLine(lineNumber)
        });
      }

      // ---------- COMMENTED-OUT DEAD CODE ----------
      if (/\/\/.*(;|\{|\})/.test(lineText)) {
        issues.push({
          line: lineNumber,
          type: "Dead Code",
          message: "Commented-out code detected.",
          severity: "low"
        });

        suggestionsList.push({
          line: lineNumber,
          suggestion: suggestions.suggestRemoveDeadCode(lineNumber)
        });
      }

      // ---------- UNUSED IMPORTS DETECTION ----------
      if (lineText.trim().startsWith('import ')) {
        const importMatch = lineText.match(/import\s+([\w.]+)(?:\s*;)?/);
        if (importMatch) {
          const importName = importMatch[1];
          // Simple check: see if import is used in the code
          const isUsed = code.includes(importName.split('.').pop() || '');
          if (!isUsed) {
            issues.push({
              line: lineNumber,
              type: "Import Issue",
              message: `Unused import: ${importName}`,
              severity: "low"
            });

            suggestionsList.push({
              line: lineNumber,
              suggestion: suggestions.suggestRemoveUnusedImport(importName)
            });
          }
        }
      }

      // ---------- PACKAGE NAMING ----------
      if (lineText.trim().startsWith('package ')) {
        const packageMatch = lineText.match(/package\s+([\w.]+)(?:\s*;)?/);
        if (packageMatch) {
          const packageName = packageMatch[1];
          // Package should be all lowercase
          if (packageName !== packageName.toLowerCase()) {
            issues.push({
              line: lineNumber,
              type: "Naming Issue",
              message: "Package name should be lowercase",
              severity: "medium"
            });

            suggestionsList.push({
              line: lineNumber,
              suggestion: suggestions.suggestPackageNaming(packageName)
            });
          }
        }
      }
    });

    // ======================================================
    // FINAL OUTPUT
    // ======================================================
    return {
      agent: "JavaComplianceAgent",
      issues,
      suggestions: suggestionsList,
      summary: {
        totalIssues: issues.length,
        bySeverity: {
          high: issues.filter(i => i.severity === "high").length,
          medium: issues.filter(i => i.severity === "medium").length,
          low: issues.filter(i => i.severity === "low").length
        },
        byType: {
          naming: issues.filter(i => i.type.includes("Naming")).length,
          formatting: issues.filter(i => i.type.includes("Formatting")).length,
          deadCode: issues.filter(i => i.type.includes("Dead Code")).length,
          import: issues.filter(i => i.type.includes("Import")).length
        }
      }
    };
  }
}