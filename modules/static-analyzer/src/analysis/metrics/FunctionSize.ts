// src/analysis/metrics/FunctionSize.ts
export function calculateFunctionSize(method: any): number {
  let size = 0;

  function traverse(node: any): void {
    if (!node) return;

    const name = node.name?.toLowerCase?.() || "";

    // Count statement-level nodes as contributing to function size
    const isStatement = [
      "expressionstatement",
      "returnstatement",
      "ifstatement",
      "forstatement",
      "whilestatement",
      "dostatement",
      "throwstatement",
      "switchstatement"
    ].includes(name);

    if (isStatement) size++;

    // Recurse into children
    if (node.children) {
      for (const arr of Object.values(node.children)) {
        if (Array.isArray(arr)) arr.forEach(traverse);
        else if (arr && typeof arr === "object") traverse(arr);
      }
    }
  }

  if (method.body) traverse(method.body);
  return size;
}
