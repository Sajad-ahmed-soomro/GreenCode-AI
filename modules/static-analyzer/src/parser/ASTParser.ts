#!/usr/bin/env ts-node
import { promises as fs } from "fs";
import * as path from "path";
import { parse } from "java-parser";

/* ---------------- helpers ---------------- */
function gatherTokens(node: any, out: any[]): void {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) gatherTokens(n, out);
    return;
  }
  if (node.image !== undefined) {
    out.push(node);
    return;
  }
  if (node.children) {
    for (const childArr of Object.values(node.children)) {
      gatherTokens(childArr, out);
    }
  }
}

function findFirstNodeByName(node: any, name: string): any {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const found = findFirstNodeByName(n, name);
      if (found) return found;
    }
    return null;
  }
  if (node.name === name) return node;
  if (node.children) {
    for (const childArr of Object.values(node.children)) {
      const found = findFirstNodeByName(childArr, name);
      if (found) return found;
    }
  }
  return null;
}

function tokensText(tokens: any[]): string {
  let txt = tokens.map(t => t.image).join(" ").replace(/\s+/g, " ").trim();

  //  Arrays → String[]
  txt = txt.replace(/\[\s*\]/g, "[]");

  //  Varargs → int...
  txt = txt.replace(/\.\s*\.\s*\./g, "...");

  //  Remove spaces inside < >
  txt = txt.replace(/<\s+/g, "<").replace(/\s+>/g, ">");

  //  Ensure single space after commas (keep commas)
  txt = txt.replace(/,\s*/g, ", ");

  //  Remove space before ; ( ) <>
  txt = txt.replace(/\s+([;()<>])/g, "$1");

  //  Remove space after ( or <
  txt = txt.replace(/([(<])\s+/g, "$1");

  //  Collapse spaces
  txt = txt.replace(/\s+/g, " ").trim();

  //  Fix generics safely
txt = txt.replace(/<([^<>]+)>/g, (m: string, inner: string) => {
  let fixed = inner.trim().replace(/\s+/g, " ");

  // Insert commas only between identifiers without a comma
fixed = fixed.replace(
  /([A-Za-z0-9_\]>]|extends|super)\s+([A-Z][A-Za-z0-9_<>\[\]]*)/g,
  (_: string, left: string, right: string) => {
    if (left === "extends" || left === "super") {
      return `${left} ${right}`;
    }
    return `${left}, ${right}`;
  }
);

  // 🔴 Strong cleanup for stray commas
fixed = fixed
  .replace(/<\s*,\s*/g, "<")   // no comma after <
  .replace(/,\s*>/g, ">")      // no comma before >
  .replace(/\s+>/g, ">")       // <<< no space before >
  .replace(/,\s*,+/g, ",")     // collapse duplicates
  .replace(/,\s*$/g, "");       // <<< remove trailing comma at end

  return `<${fixed}>`;
});
txt = txt.replace(/\s+>/g, ">");

  return txt;
}

function extractIdentifierText(node: any): string {
  const toks: any[] = [];
  gatherTokens(node, toks);
  const ids = toks.filter(t => t.tokenType && t.tokenType.name === "Identifier");
  if (ids.length) return ids[ids.length - 1].image;
  return toks.length ? toks[toks.length - 1].image : "";
}

function extractParamTypeAndName(paramNode: any) {
const core =
    paramNode.children?.variableParaRegularParameter?.[0] ||
    paramNode.children?.variableArityParameter?.[0] || // varargs case
    paramNode;
 let typeNode = core.children?.unannType?.[0];
  let nameNode = core.children?.variableDeclaratorId?.[0];

  if (!typeNode) typeNode = findFirstNodeByName(paramNode, "unannType");
  if (!nameNode) nameNode = findFirstNodeByName(paramNode, "variableDeclaratorId");

  const typeTokens: any[] = [];
  gatherTokens(typeNode, typeTokens);
  let typeText = typeTokens.length ? tokensText(typeTokens) : "UnknownType";
  
 if (core.name === "variableArityParameter") {
    typeText = typeText + "...";
  }
// ---- NAME ----
  let nameText = "UnknownName";

  if (nameNode) {
    // normal path
    nameText = extractIdentifierText(nameNode);
  } else {
    // fallback: scan ALL tokens in the core
    const toks: any[] = [];
    gatherTokens(core, toks);
    const ids = toks.filter(t => t.tokenType && t.tokenType.name === "Identifier");
    if (ids.length) {
      // The *last Identifier* in varargs subtree is always the parameter name
      nameText = ids[ids.length - 1].image;
    }
  }
    return { type: typeText || "UnknownType", name: nameText || "UnknownName" };
}

/* ---------------- loops + conditionals ---------------- */
function findLoopsAndConditionals(node: any, methodObj: any ,isNested = false): void {
  if (!node) return;

  const addUnique = (list: string[], item: string) => {
    if (!list.includes(item)) list.push(item);
  };

  // ---------- IF/ELSE Tree ----------
  if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(node.name)) {
    const ifTree = parseIfStatement(node);
    addUnique(methodObj.conditionals, "if"); //  ADD THIS LINE

    if (ifTree && !isNested) {
      if (!methodObj.conditionalsTree) methodObj.conditionalsTree = [];
      methodObj.conditionalsTree.push(ifTree);
    }

    // 🚀 Recurse inside then/else to catch nested ifs
    if (node.children?.statement) {
      node.children.statement.forEach((stmt: any) => {
        findLoopsAndConditionals(stmt, methodObj, true);
      });
    }

    return; // stop here, already handled the if
  }

  
  if (node.name === "switchStatement") {
    addUnique(methodObj.conditionals, "switch");
    // detect case/default
    if (node.children?.switchBlock) {
      const block = node.children.switchBlock[0];
      const toks: any[] = [];
      gatherTokens(block, toks);
      toks.forEach(t => {
        if (t.image === "case") addUnique(methodObj.conditionals, "case");
        if (t.image === "default") addUnique(methodObj.conditionals, "default");
      });
    }
  }
  if (node.name === "whileStatement") {
    addUnique(methodObj.loops, "while");
  }
 //  FIX: Check for enhancedForStatement FIRST, then basicForStatement
if (node.name === "enhancedForStatement") {
  addUnique(methodObj.loops, "forEach");
}
else if (node.name === "basicForStatement") {
  addUnique(methodObj.loops, "for");
}
//  REMOVE the forStatement check - it's just a wrapper
  if (node.name === "doStatement") {
    addUnique(methodObj.loops, "doWhile");
  }
  if (node.name === "superMethodInvocation") {
  methodObj.conditionals.push("superCall");
}
if (node.name === "thisExpression") {
  methodObj.conditionals.push("thisRef");
}

 
  if (node.name === "tryStatement") {
    addUnique(methodObj.conditionals, "try");
  }
  if (node.name === "catchClause") {
    addUnique(methodObj.conditionals, "catch");
  }
  if (node.name === "finally") {
    addUnique(methodObj.conditionals, "finally");
  }
  if (node.name === "throwStatement") {
    addUnique(methodObj.conditionals, "throw");
  }
  if (node.name === "returnStatement") {
    addUnique(methodObj.conditionals, "return");
  }
  if (node.name === "breakStatement") {
    addUnique(methodObj.conditionals, "break");
  }
  if (node.name === "continueStatement") {
    addUnique(methodObj.conditionals, "continue");
  }
  if (node.name === "synchronizedStatement") {
    addUnique(methodObj.conditionals, "synchronized");
  }

 

   if (node.children) {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) {
        arr.forEach(child => findLoopsAndConditionals(child, methodObj, isNested));
      }
    }
  }

}



function parseIfStatement(node: any): any {
  if (!node) return null;

  const ifNode: any = {
    type: "IfStatement",
    thenBlock: [],
    elseBlock: null,
  };

  // THEN
  if (node.children?.statement?.[0]) {
    ifNode.thenBlock = collectStatements(node.children.statement[0]);
  }

  // ELSE
  if (node.children?.statement?.[1]) {
    const elseBranch = node.children.statement[1];
    if (elseBranch.name?.includes("if")) {
      ifNode.elseBlock = parseIfStatement(elseBranch); // else-if
    } else {
      ifNode.elseBlock = collectStatements(elseBranch); // else
    }
  }

  return ifNode;
}


function collectStatements(node: any): any[] {
  if (!node) return [];
  const stmts: any[] = [];

  if (Array.isArray(node)) {
    node.forEach(n => stmts.push(...collectStatements(n)));
    return stmts;
  }

  //  Direct if/else/else-if
  if (["ifStatement", "ifThenStatement", "ifThenElseStatement"].includes(node.name)) {
    const innerIf = parseIfStatement(node);
    if (innerIf) stmts.push(innerIf);
    return stmts;
  }

  //  Unwrap wrappers (block, blockStatements, statement)
  if (["block", "blockStatements", "statement"].includes(node.name)) {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) {
        arr.forEach(child => stmts.push(...collectStatements(child)));
      }
    }
    return stmts;
  }

  //  Real leaf statements
  if (
    node.name === "expressionStatement" ||
    node.name === "statementExpression" ||
    node.name === "returnStatement" ||
    node.name === "throwStatement" ||
    node.name === "breakStatement" ||
    node.name === "continueStatement"
  ) {
    stmts.push({ type: "Statement" });
    return stmts;
  }

  //  Fallback recursion
  if (node.children) {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) {
        arr.forEach(child => stmts.push(...collectStatements(child)));
      }
    }
  }

  return stmts;
}

/* ---------------- WORKING Loop Tree Builder ---------------- */

interface LoopNode {
  type: string;
  nested: LoopNode[];
}

/**
 * FULLY FIXED: Handles all loop types and nested structures correctly
 */
function buildLoopTree(node: any, currentLoops: LoopNode[] = []): LoopNode[] {
  if (!node) return currentLoops;

  // Handle arrays
  if (Array.isArray(node)) {
    for (const n of node) {
      buildLoopTree(n, currentLoops);
    }
    return currentLoops;
  }

  // Check if this node is a loop (checking the actual loop implementation nodes)
  let loopType: string | null = null;
  let loopBody: any = null;
  
  if (node.name === "whileStatement") {
    loopType = "while";
    loopBody = node.children?.statement?.[0];
  } else if (node.name === "basicForStatement") {
    loopType = "for";
    loopBody = node.children?.statement?.[0];
  } else if (node.name === "enhancedForStatement") {
    loopType = "forEach";
    loopBody = node.children?.statement?.[0];
  } else if (node.name === "doStatement") {
    loopType = "doWhile";
    loopBody = node.children?.statement?.[0];
  }

  if (loopType && loopBody) {
    
    // Create the loop node with empty nested array
    const loopNode: LoopNode = {
      type: loopType,
      nested: []
    };
    
    
    // Recursively search for nested loops in the body
    buildLoopTree(loopBody, loopNode.nested);
    
    // Add this loop to the current level
    currentLoops.push(loopNode);
    
    //  IMPORTANT: Return here - don't recurse further since we already handled the body
    return currentLoops;
  }

  //  Not a loop - continue recursing through ALL children
  if (node.children) {
    for (const childArray of Object.values(node.children)) {
      if (Array.isArray(childArray)) {
        for (const child of childArray) {
          buildLoopTree(child, currentLoops);
        }
      }
    }
  }

  return currentLoops;
}
function extractLocalVariables(node: any, foundVars: Set<string> = new Set()): string[] {
  const variables: string[] = [];
  
  if (!node) return variables;
  
  if (Array.isArray(node)) {
    for (const n of node) {
      variables.push(...extractLocalVariables(n, foundVars));
    }
    return variables;
  }

  // Detect local variable declaration
  if (node.name === "localVariableDeclaration") {
    const varDecl = extractVariableDeclaration(node);
    if (varDecl && !foundVars.has(varDecl)) {
      foundVars.add(varDecl);
      variables.push(varDecl);
    }
  }

  //  Detect enhanced for loop variable (for-each)
  if (node.name === "enhancedForStatement") {
    const forVarDecl = node.children?.localVariableDeclaration?.[0];
    if (forVarDecl) {
      const varDecl = extractVariableDeclaration(forVarDecl);
      if (varDecl && !foundVars.has(varDecl)) {
        foundVars.add(varDecl);
        variables.push(varDecl);
      }
    }
    // STOP recursing into the body - we already got the loop var
    return variables;
  }

  // Detect basic for loop variable
  if (node.name === "basicForStatement") {
    const forInit = node.children?.forInit?.[0];
    if (forInit?.children?.localVariableDeclaration?.[0]) {
      const varDecl = extractVariableDeclaration(forInit.children.localVariableDeclaration[0]);
      if (varDecl && !foundVars.has(varDecl)) {
        foundVars.add(varDecl);
        variables.push(varDecl);
      }
    }
  }

  // Recurse into children
  if (node.children) {
    for (const childArray of Object.values(node.children)) {
      if (Array.isArray(childArray)) {
        for (const child of childArray) {
          variables.push(...extractLocalVariables(child, foundVars));
        }
      }
    }
  }

  return variables;
}

/**
 * Helper: Extracts type and name(s) from a localVariableDeclaration node
 */
function extractVariableDeclaration(node: any): string | null {
  if (!node) return null;

  // Get type
  const typeNode = node.children?.localVariableType?.[0];
  const typeTokens: any[] = [];
  gatherTokens(typeNode, typeTokens);
  const typeText = tokensText(typeTokens);

  // Get variable names (can be multiple: int x = 1, y = 2;)
  const varList = node.children?.variableDeclaratorList?.[0];
  if (!varList) return null;

  const declarators = varList.children?.variableDeclarator || [];
  const names: string[] = [];

  declarators.forEach((decl: any) => {
    const varId = decl.children?.variableDeclaratorId?.[0];
    if (varId) {
      const name = extractIdentifierText(varId);
      names.push(name);
    }
  });

  if (names.length === 0) return null;

  // Format: "int x, y" or "String name"
  return `${typeText} ${names.join(", ")}`;
}
/* ---------------- shared param extraction ---------------- */
function extractParams(decl: any): any[] {
  const params: any[] = [];
  const formals = decl?.children?.formalParameterList?.[0];
  if (!formals) return params;

  const regulars = formals.children?.formalParameter || [];
  regulars.forEach((p: any) => {
    const { type, name } = extractParamTypeAndName(p);
    params.push({ type, name });
  });

  const last = formals.children?.lastFormalParameter?.[0];
  if (last) {
    const varArity = last.children?.variableArityParameter?.[0];
    const nestedFormal = last.children?.formalParameter?.[0];
    if (varArity) {
      const { type, name } = extractParamTypeAndName(varArity);
      params.push({ type, name });
    } else if (nestedFormal) {
      const { type, name } = extractParamTypeAndName(nestedFormal);
      params.push({ type, name });
    }
  }
  return params;
}

/* ---------------- methods + constructors ---------------- */
function extractMethods(node: any, className: string): any[] {

  const methods: any[] = [];

  // ---------- METHOD ----------
  if (node.name === "methodDeclaration") {
    const decl = node.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0];
    const methodName = decl?.children?.Identifier?.[0]?.image || "UnknownMethod";
    const params = extractParams(decl);

    const methodObj: any = { name: methodName, params, loops: [], conditionals: [] };
    
    if (node.children.methodBody?.[0]) {
      findLoopsAndConditionals(node.children.methodBody[0], methodObj);
      
        
      const loopTree = buildLoopTree(node.children.methodBody[0], []);
      
      if (loopTree.length > 0) {
        methodObj.loopsTree = loopTree;
      }
    }
      //  ADD THESE 4 LINES
    const localVars = extractLocalVariables(node.children.methodBody[0]);
    if (localVars.length > 0) {
      methodObj.localVariables = localVars;
    }
    // detect synchronized keyword in method modifiers
const modifiers = node.children?.methodModifier || [];
const toks: any[] = [];
gatherTokens(modifiers, toks);
if (toks.some(t => t.image === "synchronized")) {
  methodObj.conditionals.push("synchronized");
}
    Object.assign(methodObj, extractExtraInfo?.(node, "method") || {});

    methods.push(methodObj);
  }

 // ---------- CONSTRUCTOR ----------
if (node.name === "constructorDeclaration") {
  const ctorDecl = node.children?.constructorDeclarator?.[0];

  //  Always set constructor name to class name
  const ctorName = className;

  const params = extractParams(ctorDecl);

  const ctorObj: any = { name: ctorName, params, loops: [], conditionals: [] };
  if (node.children.constructorBody?.[0]) {
    findLoopsAndConditionals(node.children.constructorBody[0], ctorObj);
    //  ADD THIS ONE LINE
       const loopTree = buildLoopTree(node.children.constructorBody[0], []);
    if (loopTree.length > 0) {
      ctorObj.loopsTree = loopTree;
    }
    
    //  ADD THESE 4 LINES
    const localVars = extractLocalVariables(node.children.constructorBody[0]);
    if (localVars.length > 0) {
      ctorObj.localVariables = localVars;
    }
  }
      Object.assign(ctorObj, extractExtraInfo?.(node, "constructor") || {});

  methods.push(ctorObj);
}

  // ---------- recurse ----------
  if (node.children) {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) arr.forEach(child => methods.push(...extractMethods(child, className)));

    }
  }

  return methods;
}

/* ---------------- classes ---------------- */
function extractClasses(node: any): any[] {
  const classes: any[] = [];

  if (node.name === "normalClassDeclaration") {
    const className =
      node.children?.typeIdentifier?.[0]?.children?.Identifier?.[0]?.image || "UnknownClass";

    // Only methods declared in this class (avoid pulling inner-class methods)
    const bodyDecls = node.children?.classBody?.[0]?.children?.classBodyDeclaration || [];
    const methods: any[] = [];
    bodyDecls.forEach((decl: any) => {
      methods.push(...extractMethods(decl, className));
    });

    //  Attach extra info (extends, implements, fields…)
    const extra = extractExtraInfo(node, "class");

    classes.push({
      type: "Class",
      name: className,
      methods,
      ...extra
    });
  }

  // Recurse into child nodes to find nested/inner classes
  if (node.children) {
    for (const arr of Object.values(node.children)) {
      if (Array.isArray(arr)) {
        arr.forEach(child => classes.push(...extractClasses(child)));
      }
    }
  }

  return classes;
}

function extractExtraInfo(node: any, context: "class" | "method" | "constructor"): any {
  const info: any = {};

  // ---------- CLASS LEVEL ----------
  if (context === "class") {
// Extends
if (node.children?.superclass?.[0]) {
  const typeNode = node.children.superclass[0].children?.classType?.[0] 
                 || node.children.superclass[0];
  const toks: any[] = [];
  gatherTokens(typeNode, toks);
  info.extends = tokensText(toks);   // e.g. "Base<String>"
}

// Implements
if (node.children?.superinterfaces?.[0]) {
  const intfs = node.children.superinterfaces[0].children.interfaceTypeList?.[0] 
              || node.children.superinterfaces[0];
  const toks: any[] = [];
  gatherTokens(intfs, toks);
  info.implements = tokensText(toks).split(",").map(s => s.trim());
}


// Generic type parameters for class
    if (node.children?.typeParameters?.[0]) {
      const toks: any[] = [];
      gatherTokens(node.children.typeParameters[0], toks);
      info.generics = tokensText(toks); // e.g. "<T, U>"
    }
    // Fields
    const fields: any[] = [];
    const bodyDecls = node.children?.classBody?.[0]?.children?.classBodyDeclaration || [];
    bodyDecls.forEach((decl: any) => {
      if (decl.children?.classMemberDeclaration?.[0]?.children?.fieldDeclaration) {
        const fieldDecl = decl.children.classMemberDeclaration[0].children.fieldDeclaration[0];
        const toks: any[] = [];
        gatherTokens(fieldDecl, toks);
        fields.push(tokensText(toks));
      }
    });
    info.fields = fields;
  }

  // ---------- METHOD/CONSTRUCTOR ----------
  if (context === "method" || context === "constructor") {
     const mh = node.children?.methodHeader?.[0];
    if (mh?.children?.typeParameters?.[0]) {
      const toks: any[] = [];
      gatherTokens(mh.children.typeParameters[0], toks);
      info.methodGenerics = tokensText(toks);
    }
  //  CLEAN throws extraction
  if (node.children?.throws_?.[0]) {
    const exList = node.children.throws_[0].children?.exceptionTypeList?.[0];
    if (exList?.children?.exceptionType) {
      info.throws = exList.children.exceptionType.map((et: any) => {
        const toks: any[] = [];
        gatherTokens(et, toks);
        return tokensText(toks);
      });
    }
  }

    // Return type (methods only, constructors have no return type)
    if (context === "method" && node.children?.methodHeader?.[0]?.children?.result?.[0]) {
      const toks: any[] = [];
      gatherTokens(node.children.methodHeader[0].children.result[0], toks);
      info.returnType = tokensText(toks);
    }

    // Modifiers (including annotations)
    const modifiers = node.children?.methodModifier || node.children?.constructorModifier || [];
    const modToks: any[] = [];
    gatherTokens(modifiers, modToks);

    info.modifiers = modToks.map((t, i, arr) => {
      if (t.image === "@" && arr[i + 1]) {
        return "@" + arr[i + 1].image; // merge @ + Identifier
      }
      // skip the identifier immediately after @ to avoid duplication
      if (i > 0 && arr[i - 1].image === "@") return null;
      return t.image;
    }).filter(Boolean);

    // Throws clause
    if (node.children?.throws_?.[0]) {
      const toks: any[] = [];
      gatherTokens(node.children.throws_[0], toks);
      info.throws = tokensText(toks).split(",").map(s => s.trim());
    }
    if (node.children?.constructorBody?.[0]) {
  const body = node.children.constructorBody[0];
  const decls = body.children?.explicitConstructorInvocation || [];
  if (decls.length > 0) {
    const chains: any[] = [];

    decls.forEach((c: any) => {
      const toks: any[] = [];
      gatherTokens(c, toks);
      const callText = tokensText(toks);

      let chainType: "this" | "super" = "this";
      if (callText.startsWith("super")) chainType = "super";

      // Extract args inside (...)
      const argMatch = callText.match(/\((.*)\)/);
      const args = argMatch && argMatch[1].trim().length > 0
        ? argMatch[1].split(",").map(a => a.trim())
        : [];

      chains.push({ type: chainType, args });
    });

    info.constructorChaining = chains;
  }
}

  }

  return info;
}

/* ---------------- main ---------------- */
export async function parseJavaFile(filePath: string) {
  const code = await fs.readFile(filePath, "utf8");
  const cst = parse(code);

  const classes = extractClasses(cst);
  return { file: filePath, classes };
}


