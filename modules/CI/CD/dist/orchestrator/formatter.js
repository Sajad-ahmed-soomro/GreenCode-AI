"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIssuesFromAst = formatIssuesFromAst;
function formatIssuesFromAst(ast) {
    const issues = [];
    if (!ast.classes)
        return issues;
    ast.classes.forEach((cls) => {
        cls.methods.forEach((method, idx) => {
            const line = method.startLine ?? method.lineNumber ?? 0;
            const filePath = `${cls.name || 'Unknown'}.java`;
            // Nested Loop
            if (method.loopNestingDepth && method.loopNestingDepth > 1) {
                issues.push({
                    id: `ast_nested_${cls.name}_${method.name}_${idx}`,
                    source: 'ast',
                    filePath,
                    methodName: method.name,
                    line,
                    severity: 'high',
                    issueType: 'NESTED_LOOP',
                    description: `Nested loops detected in method "${method.name}"`,
                    explanation: `Loop nesting depth is ${method.loopNestingDepth}, which may cause high CPU usage.`,
                    fixedCode: 'Consider reducing nested loops or using efficient data structures',
                    recommendation: 'Use early exits, pre-computation, or hashmap-based lookup.',
                    confidence: 0.9,
                    tags: ['ast', 'performance']
                });
            }
            // Too Many Loops
            if (method.totalLoopCount && method.totalLoopCount > 2) {
                issues.push({
                    id: `ast_loops_${cls.name}_${method.name}_${idx}`,
                    source: 'ast',
                    filePath,
                    methodName: method.name,
                    line,
                    severity: 'medium',
                    issueType: 'EXCESSIVE_LOOPS',
                    description: `Too many loops in method "${method.name}"`,
                    explanation: `Total loops: ${method.totalLoopCount}. This may reduce performance.`,
                    fixedCode: 'Try optimizing or merging loops',
                    recommendation: 'Merge loops where possible and avoid repeated scans.',
                    confidence: 0.8,
                    tags: ['ast', 'performance']
                });
            }
            // Complex Conditionals
            if (method.conditionals && method.conditionals.length > 1) {
                issues.push({
                    id: `ast_cond_${cls.name}_${method.name}_${idx}`,
                    source: 'ast',
                    filePath,
                    methodName: method.name,
                    line,
                    severity: 'low',
                    issueType: 'COMPLEX_CONDITIONAL',
                    description: `Complex conditionals in method "${method.name}"`,
                    explanation: `Multiple conditional statements detected.`,
                    fixedCode: 'Refactor conditionals into smaller functions',
                    recommendation: 'Extract predicate methods for readability and maintainability.',
                    confidence: 0.7,
                    tags: ['ast', 'maintainability']
                });
            }
        });
    });
    return issues;
}
