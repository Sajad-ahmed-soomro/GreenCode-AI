export function calculateFunctionSize(method: any): number {
  let count = 0;

  function traverse(node: any): void {
    if (!node) return;

    if (
      [
        "expressionStatement",
        "returnStatement",
        "ifStatement",
        "forStatement",
        "whileStatement",
        "doStatement",
        "throwStatement"
      ].includes(node.name)
    ) {
      count++;
    }

    if (node.children) {
      for (const arr of Object.values(node.children)) {
        if (Array.isArray(arr)) arr.forEach(traverse);
      }
    }
  }

  if (method.body) traverse(method.body);
  return count;
}
