export function calculateNestingDepth(method: any): number {
  function traverse(node: any, depth = 0): number {
    if (!node || typeof node !== "object") return depth;

    const isConditional = ["if", "ifThenStatement", "for", "while", "switch", "try"].includes(node.name);
    const currentDepth = isConditional ? depth + 1 : depth;

    let maxDepth = currentDepth;
    if (node.children) {
      for (const child of Object.values(node.children)) {
        if (Array.isArray(child)) {
          for (const c of child) {
            maxDepth = Math.max(maxDepth, traverse(c, currentDepth));
          }
        }
      }
    }
    return maxDepth;
  }

  const depth=traverse(method) - 1;
  return Math.max(0,depth-1) // subtract base level
}
