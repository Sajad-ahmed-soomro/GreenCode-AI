"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJavaASTMethod = analyzeJavaASTMethod;
exports.loadASTFile = loadASTFile;
// src/analyzers/astAnalyzer.ts
const fs_1 = __importDefault(require("fs"));
/**
 * Analyze one Java AST method (heuristic).
 * Works with your provided simple shape (loops[], conditionals[], calls[]) and with richer bodyNodes if present.
 */
function analyzeJavaASTMethod(m) {
    const loops = Array.isArray(m.loops) ? m.loops : [];
    // ✅ USE THE NEW FIELDS FROM PARSER
    // If totalLoopCount exists, use it; otherwise fall back to loops.length
    const loopCount = typeof m.totalLoopCount === 'number' ? m.totalLoopCount : loops.length;
    const conditionalsCount = Array.isArray(m.conditionals) ? m.conditionals.length : 0;
    const methodCalls = Array.isArray(m.calls) ? m.calls.length : 0;
    let objectCreations = typeof m.objectCreations === "number" ? m.objectCreations : 0;
    const ioCallNames = [
        "executequery", "executeupdate", "preparestatement", "createstatement",
        "getinputstream", "read", "write", "println", "printstacktrace", "logger", "log",
        "files.readallbytes", "files.readalllines", "system.out.print", "system.out.println",
        "find", "findall", "save", "getbyid", "file", "stream", "socket", "connection"
    ];
    const dbCallNames = [
        "jdbc", "sql", "statement", "preparestatement", "createstatement",
        "executequery", "executeupdate", "resultset", "connection"
    ];
    let ioCalls = 0;
    let dbCalls = 0;
    let methodCallsInsideLoop = 0;
    let recursion = Boolean(m.isRecursive);
    // Analyze calls array if present
    if (Array.isArray(m.calls)) {
        for (const c of m.calls) {
            const name = (c.name || "").toString().toLowerCase();
            if (!name)
                continue;
            if (dbCallNames.some(k => name.includes(k))) {
                dbCalls++;
                ioCalls++; // DB calls are also IO calls
            }
            else if (ioCallNames.some(k => name.includes(k))) {
                ioCalls++;
            }
        }
    }
    // Enhanced AST node traversal
    if (Array.isArray(m.bodyNodes)) {
        function traverse(nodes, inLoop = false, depth = 0) {
            for (const node of nodes || []) {
                const nodeType = ((node && (node.nodeType || node.type || node.kind)) || "").toString().toLowerCase();
                if (!nodeType) {
                    if (Array.isArray(node.children))
                        traverse(node.children, inLoop, depth);
                    continue;
                }
                // Detect loops
                if (nodeType.includes("for") || nodeType.includes("while") || nodeType.includes("do")) {
                    const loopBody = node.body || node.statements || node.children || [];
                    traverse(loopBody, true, depth + 1);
                }
                // Detect method calls
                else if (nodeType.includes("methodcall") || nodeType.includes("methodinvocation") || nodeType === "call") {
                    const calledName = (node.name || node.identifier || node.methodName || node.callTarget || "").toString();
                    if (calledName) {
                        if (inLoop)
                            methodCallsInsideLoop++;
                        const lname = calledName.toLowerCase();
                        if (dbCallNames.some(k => lname.includes(k))) {
                            dbCalls++;
                            ioCalls++;
                        }
                        else if (ioCallNames.some(k => lname.includes(k))) {
                            ioCalls++;
                        }
                        // Detect recursion
                        if (lname === (m.name || "").toLowerCase()) {
                            recursion = true;
                        }
                    }
                }
                // Detect object creations
                else if (nodeType.includes("objectcreation") || nodeType.includes("new") || nodeType.includes("classinstantiation")) {
                    objectCreations++;
                }
                // Recursive traversal
                else {
                    if (Array.isArray(node.children))
                        traverse(node.children, inLoop, depth);
                    if (Array.isArray(node.body))
                        traverse(node.body, inLoop, depth);
                    if (Array.isArray(node.statements))
                        traverse(node.statements, inLoop, depth);
                }
            }
        }
        traverse(m.bodyNodes, false, 0);
    }
    // Fallback recursion detection
    if (!recursion && typeof m.body === "string" && m.body.toLowerCase().includes(m.name.toLowerCase())) {
        recursion = true;
    }
    return {
        loopCount, // ✅ Now uses totalLoopCount if available
        loops,
        conditionalsCount,
        methodCalls,
        objectCreations,
        ioCalls,
        dbCalls,
        methodCallsInsideLoop,
        recursion,
        // ✅ RETURN NESTING DEPTH from parser
        nestingDepth: m.loopNestingDepth || 1 // Default to 1 if not present
    };
}
/** Helper to load an AST JSON file from disk and parse as JavaASTFile */
function loadASTFile(path) {
    const txt = fs_1.default.readFileSync(path, "utf8");
    return JSON.parse(txt);
}
