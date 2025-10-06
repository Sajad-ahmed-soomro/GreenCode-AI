import { parse } from "java-parser";

// ---------- Recursively parse if/else ----------
function parseIf(node: any): any {
  if (!node) return null;

  const ifNode: any = {
    type: "IfStatement",
    thenBlock: [],
    elseBlock: null
  };

  // THEN branch
  if (node.children?.statement?.[0]) {
    ifNode.thenBlock = collectStatements(node.children.statement[0]);
  }

  // ELSE branch
  if (node.children?.statement?.[1]) {
    const elseBranch = node.children.statement[1];
    if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(elseBranch.name)) {
      ifNode.elseBlock = [parseIf(elseBranch)]; // else-if
    } else {
      ifNode.elseBlock = collectStatements(elseBranch); // normal else
    }
  }

  return ifNode;
}

// ---------- Collect statements inside blocks ----------
function collectStatements(node: any): any[] {
  if (!node) return [];
  const stmts: any[] = [];

  if (Array.isArray(node)) {
    node.forEach(n => stmts.push(...collectStatements(n)));
    return stmts;
  }

  // Nested if
  if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(node.name)) {
    const innerIf = parseIf(node);
    if (innerIf) stmts.push(innerIf);
    return stmts;
  }

  // Block { ... }
  if (node.name === "block" || node.name === "blockStatements") {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) {
        arr.forEach(child => stmts.push(...collectStatements(child)));
      }
    }
    return stmts;
  }

  // Leaf = normal statement
  if (
    node.name?.endsWith("Statement") ||
    node.name === "expressionStatement" ||
    node.name === "statementExpression"
  ) {
    stmts.push({ type: "Statement" });
    return stmts;
  }

  // Fallback
  if (node.children) {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) {
        arr.forEach(child => stmts.push(...collectStatements(child)));
      }
    }
  }

  return stmts;
}

// ---------- Main entry ----------
export function extractIfsFromJava(javaCode: string) {
  const cst = parse(javaCode); // parse Java source into CST
  const results: any[] = [];

  function walk(node: any) {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(n => walk(n));
      return;
    }

    if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(node.name)) {
      const tree = parseIf(node);
      if (tree) results.push(tree);
    }

    if (node.children) {
      for (const arr of Object.values(node.children)) {
        walk(arr);
      }
    }
  }

  walk(cst);
  return results;
}

// ---------- Example run ----------
if (require.main === module) {
  const javaCode = `
  public class Test {
      public void check(int x) {
          if (x > 10) {
              if (x > 20) {
                  System.out.println("very big");
              } else {
                  System.out.println("medium");
              }
          } else if (x > 0) {
              System.out.println("small");
          } else {
              if (x < -5) {
                  System.out.println("negative");
              } else {
                  System.out.println("non-positive");
              }
          }
      }
  }`;

  const trees = extractIfsFromJava(javaCode);
  console.log(JSON.stringify(trees, null, 2));
}
