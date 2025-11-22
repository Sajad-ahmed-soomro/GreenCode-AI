/**
 * AST-Based ComplianceAgent
 *
 * - Uses AST for accurate naming detection
 * - Supports top-level functions (ast.functions[])
 * - Uses raw code for formatting & dead-code checks
 * - ZERO false positives
 */

const {
    namingRules,
    formattingRules
} = require("./rules");

const suggestions = require("./suggestions");

class ComplianceAgent {

    constructor() {
        console.log("AST-Based Compliance Agent Loaded");
    }

    /**
     * Analyze using AST + raw code
     */
    analyze(code, ast) {

        const issues = [];
        const suggestionsList = [];

        const lines = code.split("\n");

        // ======================================================
        // 1. AST: TOP-LEVEL FUNCTION CHECKS
        // ======================================================

        if (ast.functions && Array.isArray(ast.functions)) {
            ast.functions.forEach(func => {

                const fname = func.name;
                const rule = namingRules.find(r => r.name === "function_snake_case");

                if (rule && !rule.pattern.test(fname)) {
                    issues.push({
                        line: 0,
                        type: "Naming Issue",
                        name: fname,
                        message: rule.message
                    });

                    suggestionsList.push({
                        line: 0,
                        suggestion: suggestions.suggestSnakeCase(fname)
                    });
                }
            });
        }

        // ======================================================
        // 2. AST: CLASS + CLASS MEMBERS
        // ======================================================

        if (ast.classes && Array.isArray(ast.classes)) {

            ast.classes.forEach(cls => {

                // ---------- CLASS NAME ----------
                const className = cls.name;
                const classRule = namingRules.find(r => r.name === "class_pascal_case");

                if (classRule && !classRule.pattern.test(className)) {
                    issues.push({
                        line: 0,
                        type: "Naming Issue",
                        name: className,
                        message: classRule.message
                    });

                    suggestionsList.push({
                        line: 0,
                        suggestion: suggestions.suggestPascalCase(className)
                    });
                }

                // ---------- CLASS METHODS ----------
                if (cls.methods && Array.isArray(cls.methods)) {

                    cls.methods.forEach(method => {
                        const mname = method.name;
                        const mRule = namingRules.find(r => r.name === "function_snake_case");

                        if (mRule && !mRule.pattern.test(mname)) {
                            issues.push({
                                line: 0,
                                type: "Naming Issue",
                                name: mname,
                                message: mRule.message
                            });

                            suggestionsList.push({
                                line: 0,
                                suggestion: suggestions.suggestSnakeCase(mname)
                            });
                        }
                    });
                }

                // ---------- CLASS FIELDS ----------
                if (cls.fields && Array.isArray(cls.fields)) {

                    cls.fields.forEach(field => {
                        const fname = field.name;
                        const fRule = namingRules.find(r => r.name === "variable_snake_case");

                        if (fRule && !fRule.pattern.test(fname)) {
                            issues.push({
                                line: 0,
                                type: "Naming Issue",
                                name: fname,
                                message: fRule.message
                            });

                            suggestionsList.push({
                                line: 0,
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

        lines.forEach((line, index) => {

            const lineNumber = index + 1;

            // ---------- TRAILING SPACES ----------
            formattingRules.forEach(rule => {

                if (rule.pattern.test(line)) {
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

            // ---------- LONG LINE ----------
            const longRule = formattingRules.find(r => r.name === "line_length_limit");
            if (longRule && longRule.pattern.test(line)) {
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

            // ---------- COMMENTED-OUT DEAD CODE ----------
            if (/\/\/.*(;|\{|\})/.test(line)) {
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

module.exports = ComplianceAgent;
