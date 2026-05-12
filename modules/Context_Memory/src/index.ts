import fs from "fs";
import path from "path";

/* ---------- TYPES ---------- */
// Context Memory Engine for GreenCode AI

type Risk = "low" | "medium" | "high";

interface FunctionInfo {
  visibility: string;
  static: boolean;
  calls: Record<string, number>;
  calledBy: Record<string, number>;
  risk: Risk;
}

interface ClassContext {
  [methodName: string]: FunctionInfo;
}

interface FileContext {
  [className: string]: ClassContext;
}

/* ---------- CONFIG ---------- */

const JAVA_FOLDER = "JAVA_PROJECT"; // 🔴 change path
const OUTPUT_FOLDER = "output";

/* ---------- HELPERS ---------- */

function getAllJavaFiles(dir: string, list: string[] = []): string[] {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      getAllJavaFiles(full, list);
    } else if (f.endsWith(".java")) {
      list.push(full);
    }
  }
  return list;
}

function removeComments(code: string): string {
  let result = code.replace(/\/\*[\s\S]*?\*\//g, " ");
  result = result.replace(/\/\/.*/g, " ");
  return result;
}

function removeStringLiterals(code: string): string {
  let result = code.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  return result;
}

function findMatchingBrace(code: string, startPos: number): number {
  let braceCount = 1;
  let i = startPos;
  let inString = false;
  let stringChar = '';
  
  while (i < code.length && braceCount > 0) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    i++;
  }
  
  return i - 1;
}

/* ---------- GLOBAL STRUCTURES ---------- */

interface ParsedMethod {
  className: string;
  methodName: string;
  fullName: string;
  visibility: string;
  isStatic: boolean;
  body: string;
  file: string;
}

interface VariableType {
  varName: string;
  typeName: string;
}

const allMethods: ParsedMethod[] = [];
const globalCalls: { caller: string; callee: string }[] = [];
const classNames: Set<string> = new Set();

/* ---------- PARSE ALL FILES FIRST ---------- */

fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });

const fileToClasses = new Map<string, string[]>();

for (const javaFile of getAllJavaFiles(JAVA_FOLDER)) {
  const code = removeComments(fs.readFileSync(javaFile, "utf-8"));
  
  const classRegex = /\b(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?class\s+(\w+)/g;
  const classesInFile: string[] = [];
  let classMatch;
  
  while ((classMatch = classRegex.exec(code)) !== null) {
    classesInFile.push(classMatch[1]);
    classNames.add(classMatch[1]);
  }
  
  fileToClasses.set(javaFile, classesInFile);

  for (const className of classesInFile) {
    const classStartPattern = new RegExp(
      `\\bclass\\s+${className}\\b[^{]*\\{`
    );
    const classStartMatch = code.match(classStartPattern);
    
    if (!classStartMatch) continue;
    
    const classStartIndex = code.indexOf(classStartMatch[0]);
    const classBodyStart = classStartIndex + classStartMatch[0].length - 1;
    const classBodyEnd = findMatchingBrace(code, classBodyStart + 1);
    const classBody = code.substring(classBodyStart + 1, classBodyEnd);

    const methodRegex =
      /\b(public|private|protected)?\s*(static\s+)?(final\s+)?(synchronized\s+)?[\w<>\[\].,\s]+\s+(\w+)\s*\([^)]*\)\s*(?:throws\s+[\w\s,]+)?\s*\{/g;

    let match;
    while ((match = methodRegex.exec(classBody)) !== null) {
      const visibility = match[1] || "package-private";
      const isStatic = !!match[2];
      const methodName = match[5];

      if (methodName === className) continue;

      const methodBodyStart = match.index + match[0].length - 1;
      const methodBodyEnd = findMatchingBrace(classBody, methodBodyStart + 1);
      const body = classBody.slice(methodBodyStart + 1, methodBodyEnd);

      allMethods.push({
        className,
        methodName,
        fullName: `${className}.${methodName}`,
        visibility,
        isStatic,
        body,
        file: javaFile
      });
    }
  }
}

/* ---------- EXTRACT LOCAL VARIABLES AND THEIR TYPES ---------- */

function extractLocalVariables(methodBody: string): VariableType[] {
  const variables: VariableType[] = [];
  
  // Pattern: ClassName varName = ...
  // Matches: OrderService service = new OrderService();
  //          Database db = getDatabase();
  const varDeclRegex = /\b([A-Z]\w+)\s+(\w+)\s*=/g;
  let match;
  
  while ((match = varDeclRegex.exec(methodBody)) !== null) {
    const typeName = match[1];
    const varName = match[2];
    
    // Only track if it's a known class
    if (classNames.has(typeName)) {
      variables.push({ varName, typeName });
    }
  }
  
  return variables;
}

/* ---------- EXTRACT CALLS FROM METHOD BODIES ---------- */

for (const method of allMethods) {
  const cleanBody = removeStringLiterals(method.body);
  
  // Extract local variables in this method
  const localVars = extractLocalVariables(cleanBody);
  
  const skipWords = [
    "if", "for", "while", "switch", "new", "catch", "synchronized", 
    "return", "super", "this", "assert", "throw", "instanceof",
    "System", "String", "Integer", "Boolean", "Double", "Float",
    "Long", "Short", "Byte", "Character", "Math", "Arrays", "List",
    "Set", "Map", "Collection", "Object", "Class", "Thread", "Exception",
    "RuntimeException", "Throwable", "Error", "ArrayList", "HashMap",
    "HashSet", "LinkedList", "Scanner", "File", "StringBuilder"
  ];

  // Pattern 1: Qualified static calls - ClassName.methodName(...)
  const qualifiedStaticRegex = /\b([A-Z]\w+)\.(\w+)\s*\(/g;
  let match;
  
  while ((match = qualifiedStaticRegex.exec(cleanBody)) !== null) {
    const targetClassName = match[1];
    const targetMethodName = match[2];
    
    if (skipWords.includes(targetClassName) || skipWords.includes(targetMethodName)) {
      continue;
    }
    
    const targetMethod = allMethods.find(
      (m) => m.className === targetClassName && m.methodName === targetMethodName
    );
    
    if (targetMethod) {
      globalCalls.push({
        caller: method.fullName,
        callee: targetMethod.fullName
      });
    }
  }
  
  // Pattern 2: Object method calls - object.methodName(...)
  // This now includes BOTH fields AND local variables
  const objectCallRegex = /\b(\w+)\.(\w+)\s*\(/g;
  
  while ((match = objectCallRegex.exec(cleanBody)) !== null) {
    const objectName = match[1];
    const targetMethodName = match[2];
    
    if (skipWords.includes(objectName) || skipWords.includes(targetMethodName)) {
      continue;
    }
    
    // Skip if it's a qualified static call (already handled)
    if (/^[A-Z]/.test(objectName)) {
      continue;
    }
    
    // Check if this object is a local variable with known type
    const localVar = localVars.find(v => v.varName === objectName);
    
    if (localVar) {
      // We know the exact type! Find methods in that class
      const targetMethod = allMethods.find(
        (m) => m.className === localVar.typeName && m.methodName === targetMethodName
      );
      
      if (targetMethod) {
        globalCalls.push({
          caller: method.fullName,
          callee: targetMethod.fullName
        });
      }
    } else {
      // Object type unknown - try to find matching methods in all classes
      // This handles field references and other cases
      const possibleMethods = allMethods.filter(
        (m) => m.methodName === targetMethodName && m.className !== method.className
      );
      
      for (const targetMethod of possibleMethods) {
        globalCalls.push({
          caller: method.fullName,
          callee: targetMethod.fullName
        });
      }
    }
  }
  
  // Pattern 3: Direct method calls (same class only) - methodName(...)
  const directCallRegex = /\b([A-Za-z_]\w*)\s*\(/g;
  
  while ((match = directCallRegex.exec(cleanBody)) !== null) {
    const calledName = match[1];
    
    if (skipWords.includes(calledName)) {
      continue;
    }
    
    if (calledName === method.methodName) continue;
    
    const sameClassMethod = allMethods.find(
      (m) => m.className === method.className && m.methodName === calledName
    );
    
    if (sameClassMethod) {
      globalCalls.push({
        caller: method.fullName,
        callee: sameClassMethod.fullName
      });
    }
  }
}

/* ---------- BUILD CONTEXT FOR EACH METHOD ---------- */

const methodInfoMap = new Map<string, FunctionInfo>();

for (const method of allMethods) {
  methodInfoMap.set(method.fullName, {
    visibility: method.visibility,
    static: method.isStatic,
    calls: {},
    calledBy: {},
    risk: "low"
  });
}

for (const call of globalCalls) {
  const callerInfo = methodInfoMap.get(call.caller);
  const calleeInfo = methodInfoMap.get(call.callee);

  if (callerInfo) {
    callerInfo.calls[call.callee] = (callerInfo.calls[call.callee] || 0) + 1;
  }

  if (calleeInfo) {
    calleeInfo.calledBy[call.caller] = (calleeInfo.calledBy[call.caller] || 0) + 1;
  }
}

for (const [fullName, info] of methodInfoMap.entries()) {
  let totalCallCount = 0;
  for (const count of Object.values(info.calledBy)) {
    totalCallCount += count;
  }
  
  const uniqueCallers = Object.keys(info.calledBy).length;
  
  if (info.visibility === "private") {
    info.risk = "low";
  } else if (info.visibility === "public" && totalCallCount >= 2) {
    info.risk = "high";
  } else if (info.visibility === "public" || info.static) {
    info.risk = "medium";
  } else if (uniqueCallers >= 3) {
    info.risk = "high";
  } else if (uniqueCallers === 2) {
    info.risk = "medium";
  } else {
    info.risk = "low";
  }
}

/* ---------- GENERATE JSON FILES ---------- */

for (const [javaFile, classesInFile] of fileToClasses.entries()) {
  const fileContext: FileContext = {};

  for (const className of classesInFile) {
    const classContext: ClassContext = {};

    const methodsInClass = allMethods.filter((m) => m.className === className);

    for (const method of methodsInClass) {
      const info = methodInfoMap.get(method.fullName);
      if (info) {
        classContext[method.methodName] = info;
      }
    }

    fileContext[className] = classContext;
  }

  const baseName = path.basename(javaFile, ".java");
  const outputPath = path.join(OUTPUT_FOLDER, `${baseName}.json`);

  fs.writeFileSync(outputPath, JSON.stringify(fileContext, null, 2));
}

console.log("✅ Context memory generated per Java file");