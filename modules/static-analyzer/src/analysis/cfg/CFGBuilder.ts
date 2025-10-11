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

  // --- Add loops ---
  for (const loop of method.loops || []) {
    const loopId = uuidv4();
    nodes.push({ id: loopId, label: loop, type: "statement", next: [] });
    edges.push([lastNodeId, loopId]);
    lastNodeId = loopId;
  }

  // --- Add conditionals ---
  for (const cond of method.conditionals || []) {
    const condId = uuidv4();
    nodes.push({ id: condId, label: cond, type: "condition", next: [] });
    edges.push([lastNodeId, condId]);
    lastNodeId = condId;
  }

  // --- Recursively parse conditionalsTree ---
  if (method.conditionalsTree && method.conditionalsTree.length > 0) {
    for (const tree of method.conditionalsTree) {
      processConditionTree(tree, nodes, edges, lastNodeId, endId);
    }
  }

  // --- Constructor chaining (this(), super()) ---
  for (const chain of method.constructorChaining || []) {
    const chainId = uuidv4();
    const label = `${chain.type}(${(chain.args || []).join(", ")})`;
    nodes.push({ id: chainId, label, type: "statement", next: [] });
    edges.push([lastNodeId, chainId]);
    lastNodeId = chainId;
  }

  // --- Return path ---
  if ((method.conditionals || []).includes("return")) {
    const returnId = uuidv4();
    nodes.push({ id: returnId, label: "return", type: "statement", next: [] });
    edges.push([lastNodeId, returnId]);
    edges.push([returnId, endId]);
  } else {
    edges.push([lastNodeId, endId]);
  }

  // --- Connect next references ---
  for (const [from, to] of edges) {
    const node = nodes.find((n) => n.id === from);
    if (node) node.next.push(to);
  }

  return { methodName: method.name, nodes, edges };
}

// Recursive helper for conditionalsTree
function processConditionTree(tree: any, nodes: CFGNode[], edges: [string, string][], parentId: string, endId: string) {
  const condId = uuidv4();
  nodes.push({ id: condId, label: tree.type, type: "condition", next: [] });
  edges.push([parentId, condId]);

  // Then block
  if (tree.thenBlock) {
    for (const stmt of tree.thenBlock) {
      const stmtId = uuidv4();
      nodes.push({ id: stmtId, label: stmt.type, type: "statement", next: [] });
      edges.push([condId, stmtId]);
    }
  }

  // Else block
  if (tree.elseBlock) {
    for (const stmt of tree.elseBlock) {
      if (stmt.type === "IfStatement") {
        processConditionTree(stmt, nodes, edges, condId, endId);
      } else {
        const stmtId = uuidv4();
        nodes.push({ id: stmtId, label: stmt.type, type: "statement", next: [] });
        edges.push([condId, stmtId]);
      }
    }
  }
}
