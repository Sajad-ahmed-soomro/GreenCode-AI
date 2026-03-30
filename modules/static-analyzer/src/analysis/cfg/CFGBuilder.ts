import { v4 as uuidv4 } from "uuid";
import { CFG, CFGNode } from "../../types/CFGType.js";

export function buildCFG(method: any): CFG {
  const nodes: CFGNode[] = [];
  const edges: [string, string][] = [];

  const startId = uuidv4();
  const endId = uuidv4();
  nodes.push({ id: startId, label: "Start", type: "start", next: [] });
  nodes.push({ id: endId, label: "End", type: "end", next: [] });

  let lastNodeId = startId;
  const statements =
    method.body?.statements ||
    method.children?.block?.statements ||
    method.children?.body?.statements ||
    [];

  if (statements.length > 0) {
    statements.forEach((stmt: any, idx: number) => {
      const stmtId = uuidv4();
      const label = stmt.name || stmt.type || `stmt_${idx}`;
      nodes.push({ id: stmtId, label, type: "statement", next: [] });
      edges.push([lastNodeId, stmtId]);
      lastNodeId = stmtId;
    });
  }

  edges.push([lastNodeId, endId]);

  // Connect next references
  for (const [from, to] of edges) {
    const node = nodes.find(n => n.id === from);
    if (node && !node.next.includes(to)) node.next.push(to);
  }

  console.log(`✓ CFG generated for method: ${method.name || "anonymous"} (${nodes.length} nodes, ${edges.length} edges)`);
  return { methodName: method.name || "anonymous", nodes, edges };
}
