export function calculateCyclomaticComplexity(method) {
    let complexity = 1;
    const conditionals = Array.isArray(method?.conditionals)
        ? method.conditionals
        : [];
    complexity += conditionals.length;
    return complexity;
}
