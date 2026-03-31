export function formatIssuesFromAst(ast: any): any[] {
    const issues: any[] = [];

    if (!ast.classes) return issues;

    ast.classes.forEach((cls: any) => {
        cls.methods.forEach((method: any) => {

            // Nested Loop
            if (method.loopNestingDepth && method.loopNestingDepth > 1) {
                issues.push({
                    line: 0,
                    severity: 'high',
                    issueType: 'NESTED_LOOP',
                    description: `Nested loops detected in method "${method.name}"`,
                    explanation: `Loop nesting depth is ${method.loopNestingDepth}, which may cause high CPU usage.`,
                    fixedCode: 'Consider reducing nested loops or using efficient data structures',
                    confidence: 0.9
                });
            }

            // Too Many Loops
            if (method.totalLoopCount && method.totalLoopCount > 2) {
                issues.push({
                    line: 0,
                    severity: 'medium',
                    issueType: 'EXCESSIVE_LOOPS',
                    description: `Too many loops in method "${method.name}"`,
                    explanation: `Total loops: ${method.totalLoopCount}. This may reduce performance.`,
                    fixedCode: 'Try optimizing or merging loops',
                    confidence: 0.8
                });
            }

            // Complex Conditionals
            if (method.conditionals && method.conditionals.length > 1) {
                issues.push({
                    line: 0,
                    severity: 'low',
                    issueType: 'COMPLEX_CONDITIONAL',
                    description: `Complex conditionals in method "${method.name}"`,
                    explanation: `Multiple conditional statements detected.`,
                    fixedCode: 'Refactor conditionals into smaller functions',
                    confidence: 0.7
                });
            }

        });
    });

    return issues;
}