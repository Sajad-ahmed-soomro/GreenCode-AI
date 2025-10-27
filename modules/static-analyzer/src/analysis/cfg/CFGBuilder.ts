import { v4 as uuidv4 } from "uuid";
import { CFG, CFGNode } from "../../types/CFGType.js";

/**
 * Build a control flow graph (CFG) for a given method AST node.
 * Ensures at least one intermediate node exists, even if AST lacks loops/conditionals.
 */
export function buildCFG(method: any): CFG {
  const nodes: CFGNode[] = [];
  const edges: [string, string][] = [];

  const startId = uuidv4();
  const endId = uuidv4();
  nodes.push({ id: startId, label: "Start", type: "start", next: [] });
  nodes.push({ id: endId, label: "End", type: "end", next: [] });

  let lastNodeId = startId;

  // --- Add method body statements if available ---
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

  // --- Add loops if defined ---
  for (const loop of method.loops || []) {
    const loopId = uuidv4();
    nodes.push({ id: loopId, label: loop || "loop", type: "statement", next: [] });
    edges.push([lastNodeId, loopId]);
    lastNodeId = loopId;
  }

  // --- Add conditionals if defined ---
  for (const cond of method.conditionals || []) {
    const condId = uuidv4();
    nodes.push({ id: condId, label: cond || "cond", type: "condition", next: [] });
    edges.push([lastNodeId, condId]);
    lastNodeId = condId;
  }

  // --- Recursively process conditionalsTree ---
  if (method.conditionalsTree && method.conditionalsTree.length > 0) {
    method.conditionalsTree.forEach((tree: any) => {
      const exitNodes = processConditionTree(tree, nodes, edges, lastNodeId, endId);
      // Connect all exit nodes from this conditional tree to the next statement or end
      exitNodes.forEach(exitId => {
        // Don't duplicate edges
        if (!edges.some(([from, to]) => from === exitId && to === endId)) {
          lastNodeId = exitId;
        }
      });
    });
  }

  // --- Constructor chaining (this(), super()) ---
  for (const chain of method.constructorChaining || []) {
    const chainId = uuidv4();
    const label = `${chain.type || "constructor"}(${(chain.args || []).join(", ")})`;
    nodes.push({ id: chainId, label, type: "statement", next: [] });
    edges.push([lastNodeId, chainId]);
    lastNodeId = chainId;
  }

  // --- Ensure return path connects properly ---
  edges.push([lastNodeId, endId]);

  // --- Connect `next` references ---
  for (const [from, to] of edges) {
    const node = nodes.find((n) => n.id === from);
    if (node && !node.next.includes(to)) {
      node.next.push(to);
    }
  }

  // Debug info
  console.log(`✓ CFG generated for method: ${method.name || "anonymous"} (${nodes.length} nodes, ${edges.length} edges)`);

  return { methodName: method.name || "anonymous", nodes, edges };
}

/**
 * Recursive helper to process nested conditionals.
 * Returns array of exit node IDs from this conditional block.
 */
function processConditionTree(
  tree: any,
  nodes: CFGNode[],
  edges: [string, string][],
  parentId: string,
  endId: string
): string[] {
  const condId = uuidv4();
  nodes.push({ id: condId, label: tree.type || "if", type: "condition", next: [] });
  edges.push([parentId, condId]);

  const exitNodes: string[] = [];
  let thenLastNode = condId;
  let elseLastNode = condId;

  // Then block
  if (tree.thenBlock && tree.thenBlock.length > 0) {
    tree.thenBlock.forEach((stmt: any, idx: number) => {
      const stmtId = uuidv4();
      const label = stmt.type || `then_stmt_${idx}`;
      nodes.push({ id: stmtId, label, type: "statement", next: [] });
      edges.push([thenLastNode, stmtId]);
      thenLastNode = stmtId;
    });
    exitNodes.push(thenLastNode);
  } else {
    // Empty then block leads directly from condition
    exitNodes.push(condId);
  }

  // Else block
  if (tree.elseBlock && tree.elseBlock.length > 0) {
    tree.elseBlock.forEach((stmt: any, idx: number) => {
      if (stmt.type === "IfStatement") {
        // Nested if-else
        const nestedExits = processConditionTree(stmt, nodes, edges, condId, endId);
        exitNodes.push(...nestedExits);
      } else {
        const stmtId = uuidv4();
        const label = stmt.type || `else_stmt_${idx}`;
        nodes.push({ id: stmtId, label, type: "statement", next: [] });
        edges.push([elseLastNode, stmtId]);
        elseLastNode = stmtId;
      }
    });
    if (elseLastNode !== condId) {
      exitNodes.push(elseLastNode);
    }
  } else {
    // No else block, condition leads directly out
    exitNodes.push(condId);
  }

  return exitNodes;
}


/**
 * Builds a combined Control Flow Graph (CFG) for an entire class.
 * Merges all method CFGs inside a single graph, linking methods sequentially.
 */
export function buildClassCFG(classNode: any): CFG {
  // const classId = uuidv4();
  const startId = uuidv4();
  const endId = uuidv4();

  const nodes: CFGNode[] = [
    { id: startId, label: `Start (${classNode.name})`, type: "start", next: [] },
    { id: endId, label: `End (${classNode.name})`, type: "end", next: [] },
  ];
  const edges: [string, string][] = [];

  let lastNodeId = startId;

  const methods = classNode.methods || [];

  for (const method of methods) {
    // Build per-method CFG
    const methodCFG = buildCFG(method);

    // Rename method nodes with class context
    methodCFG.nodes.forEach((n) => {
      n.label = `${classNode.name}.${methodCFG.methodName} → ${n.label}`;
    });

    // Merge method nodes/edges into class CFG
    nodes.push(...methodCFG.nodes);
    edges.push(...methodCFG.edges);

    // Connect last node to first node of method
    const firstNode = methodCFG.nodes.find((n) => n.type === "start");
    if (firstNode) edges.push([lastNodeId, firstNode.id]);

    // Update chain for next method
    const lastNode = methodCFG.nodes.find((n) => n.type === "end");
    if (lastNode) lastNodeId = lastNode.id;
  }

  // Connect the last node to the class End
  edges.push([lastNodeId, endId]);

  // Connect next references
  for (const [from, to] of edges) {
    const node = nodes.find((n) => n.id === from);
    if (node && !node.next.includes(to)) node.next.push(to);
  }

  console.log(
    `✓ CFG generated for class: ${classNode.name} (${nodes.length} nodes, ${edges.length} edges)`
  );

  return { methodName: classNode.name, nodes, edges };
}
