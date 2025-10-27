// src/analysis/metrics/MetricsAnalyzer.ts
import { calculateCyclomaticComplexity } from "./CyclomaticComplexity.js";
import { calculateNestingDepth } from "./NestingDepth.js";
import { calculateFunctionSize } from "./FunctionSize.js";
import { buildCFG } from "../cfg/CFGBuilder.js";
import { FileMetrics, ClassMetrics, MethodMetrics } from "../../types/MethodMetrics.js";

/* ---------------- Helper: traverse AST tree ---------------- */
function traverse(node: any, callback: (node: any) => void) {
  if (!node || typeof node !== "object") return;
  callback(node);

  if (node.children) {
    for (const key of Object.keys(node.children)) {
      const child = node.children[key];
      if (Array.isArray(child)) {
        child.forEach(c => traverse(c, callback));
      } else if (typeof child === "object") {
        traverse(child, callback);
      }
    }
  }
}

/* ---------------- Helper: extract all methods ---------------- */
function extractMethods(ast: any): any[] {
  const methods: any[] = [];
  traverse(ast, (node: any) => {
    if (
      node.name === "methodDeclaration" ||
      node.name === "constructorDeclaration"
    ) {
      methods.push(node);
    }
  });
  return methods;
}

/* ---------------- Main Analyzer ---------------- */
export function analyzeAST(astJson: any, filePath: string): FileMetrics {
  const classes: ClassMetrics[] = [];

  // Support both { classes: [...] } and plain AST roots
  for (const cls of astJson.classes || [astJson]) {
    const methods = extractMethods(cls);

    const methodMetrics: MethodMetrics[] = methods.map((method: any) => {
      const bodyNode =
        method.body ||
        method.block ||
        method.children?.block ||
        method.children?.body ||
        method.children?.methodBody ||
        method; // fallback

      const cfg = buildCFG(method);

      return {
        name: method.name || "anonymous",
        cyclomaticComplexity: calculateCyclomaticComplexity(method),
        nestingDepth: calculateNestingDepth(bodyNode),
        functionSize: calculateFunctionSize(bodyNode),
        cfg,
      };
    });

    classes.push({
      className: cls.name || "AnonymousClass",
      methods: methodMetrics,
    });
  }

  return { fileName: filePath, classes };
}
