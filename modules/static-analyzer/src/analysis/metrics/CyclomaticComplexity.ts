export function calculateCyclomaticComplexity(method:any): number {
  // Start with base complexity of 1
  let complexity = 1;

  // Ensure conditionals exist and are an array
  const conditionals = Array.isArray(method?.conditionals)
    ? method.conditionals
    : [];

  // Add each conditional as +1
  complexity += conditionals.length;

  return complexity;
}
