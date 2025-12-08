"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeCyclomatic = computeCyclomatic;
exports.estimateNestingDepth = estimateNestingDepth;
exports.hasCycle = hasCycle;
exports.loadCFGFile = loadCFGFile;
// src/analyzers/cfgAnalyzer.ts
const fs_1 = __importDefault(require("fs"));
/** Compute cyclomatic complexity M = E - N + 2P (P=1 assumed) */
function computeCyclomatic(cfg) {
    if (!cfg || !Array.isArray(cfg.nodes) || !Array.isArray(cfg.edges))
        return 1;
    const N = cfg.nodes.length;
    const E = cfg.edges.length;
    const P = 1;
    const M = E - N + 2 * P;
    return Math.max(1, M);
}
/** Heuristic nesting depth: count loop-like node labels. */
function estimateNestingDepth(cfg) {
    if (!cfg || !Array.isArray(cfg.nodes))
        return 1;
    let depth = 1;
    for (const n of cfg.nodes) {
        const lab = (n.label || n.type || "").toLowerCase();
        if (lab.includes("for") || lab.includes("while") || lab.includes("loop") || lab.includes("foreach"))
            depth++;
    }
    return depth;
}
/** Detect cycles in CFG (simple DFS). If cycle present, may indicate loops/recursion in control-flow. */
function hasCycle(cfg) {
    if (!cfg || !Array.isArray(cfg.nodes) || !Array.isArray(cfg.edges))
        return false;
    const adj = {};
    for (const n of cfg.nodes)
        adj[n.id] = [];
    for (const e of cfg.edges || []) {
        const [from, to] = e;
        if (!adj[from])
            adj[from] = [];
        adj[from].push(to);
    }
    const visited = {};
    const inStack = {};
    let found = false;
    function dfs(u) {
        if (found)
            return;
        visited[u] = true;
        inStack[u] = true;
        for (const v of adj[u] || []) {
            if (!visited[v])
                dfs(v);
            else if (inStack[v]) {
                found = true;
                return;
            }
        }
        inStack[u] = false;
    }
    for (const nid of Object.keys(adj)) {
        if (!visited[nid])
            dfs(nid);
        if (found)
            break;
    }
    return found;
}
/** Helper to load a CFG JSON file from disk */
function loadCFGFile(path) {
    const txt = fs_1.default.readFileSync(path, "utf8");
    return JSON.parse(txt);
}
