export interface CFGNode {
  id: string;
  label: string;
  type: "start" | "end" | "statement" | "condition";
  next: string[];
}

export interface CFG {
  methodName: string;
  nodes: CFGNode[];
  edges: [string, string][]; // pairs of node IDs
}
