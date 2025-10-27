export function calculateNestingDepth(method: any): number {
  let maxDepth = 0;

  function traverse(node: any, currentDepth: number): void {
    if (!node) return;

    // Update max depth
    if (currentDepth > maxDepth) {
      maxDepth = currentDepth;
    }

    const nodeName = node.name?.toLowerCase() || "";
    
    // Check if this node increases nesting depth
    const isNestingNode = [
      "ifstatement",
      "forstatement", 
      "whilestatement",
      "dostatement",
      "switchstatement",
      "trystatement",
      "catchclause",
      "foreachstatement"
    ].some(n => nodeName.includes(n.toLowerCase()));

    const nextDepth = isNestingNode ? currentDepth + 1 : currentDepth;

    // Traverse children
    if (node.children) {
      for (const key of Object.keys(node.children)) {
        const child = node.children[key];
        if (Array.isArray(child)) {
          child.forEach(c => traverse(c, nextDepth));
        } else if (child && typeof child === "object") {
          traverse(child, nextDepth);
        }
      }
    }

    // Also check direct properties
    for (const key of Object.keys(node)) {
      if (key !== "children" && key !== "name" && key !== "value") {
        const prop = node[key];
        if (prop && typeof prop === "object" && !Array.isArray(prop)) {
          traverse(prop, nextDepth);
        }
      }
    }
  }

  if (method.body) {
    traverse(method.body, 0);
  }
  
  return maxDepth;
}