"use strict";
// src/rules/memoization.rule.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoizationRule = void 0;
class MemoizationRule {
    constructor() {
        this.name = "Memoization";
        this.description = "Suggests memoization for expensive, deterministic-looking methods that are likely to be called many times.";
    }
    applies(node, _context) {
        // Heuristic: only consider methods whose names look like pure computations
        const name = node.name || "";
        const lower = name.toLowerCase();
        if (lower.includes("compute") ||
            lower.includes("calculate") ||
            lower.includes("hash") ||
            lower.includes("fib") ||
            lower.includes("factorial") ||
            lower.includes("cost") ||
            lower.includes("score")) {
            return true;
        }
        return false;
    }
    analyze(node, context) {
        const { filePath, className, methodName } = context;
        // Use number of loops as a rough proxy for cost: many loops = expensive
        const loopCount = node.loops ? node.loops.length : 0;
        if (loopCount === 0) {
            return null;
        }
        // If there are several loops, treat as a strong memoization candidate
        const severity = loopCount >= 2 ? "high" : "medium";
        const message = `Method '${className}.${methodName}(${node.params.length} params)' contains ${loopCount} loop(s) and its name suggests a deterministic computation. If this method is called frequently with the same arguments, consider adding memoization (for example, caching results in a Map keyed by the input parameters) to avoid repeated work.`;
        // Line/column are not available from your summarized AST; report as 0/0
        return {
            message,
            severity,
            location: filePath
        };
    }
}
exports.MemoizationRule = MemoizationRule;
