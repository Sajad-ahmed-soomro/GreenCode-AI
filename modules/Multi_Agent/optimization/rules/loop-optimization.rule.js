"use strict";
// src/rules/loop-optimization.rule.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopOptimizationRule = void 0;
class LoopOptimizationRule {
    constructor() {
        this.name = "Loop Optimization";
        this.description = "Flags methods with many loops as potential hot spots and suggests reducing loop depth or changing algorithms.";
    }
    applies(node, _context) {
        // Only care about methods that actually have loops
        return Array.isArray(node.loops) && node.loops.length > 0;
    }
    analyze(node, context) {
        const { filePath, className, methodName } = context;
        const loops = Array.isArray(node.loops) ? node.loops : [];
        const loopCount = loops.length;
        if (loopCount === 0) {
            return null;
        }
        let severity = "low";
        const issues = [];
        if (loopCount >= 3) {
            severity = "high";
            issues.push(`Method '${className}.${methodName}' contains ${loopCount} loop constructs, which suggests deeply nested or repeated iterations. This can easily lead to O(n^k) behavior. Consider reducing loop depth, breaking the work into smaller passes, or using indexing/maps to avoid inner scans.`);
        }
        else if (loopCount === 2) {
            severity = "medium";
            issues.push(`Method '${className}.${methodName}' contains 2 loop constructs. Nested loops can be costly; consider whether a different algorithm or precomputed data structure (for example, a Map/Set) could avoid one of the loops.`);
        }
        else {
            // single loop: still mention if desired
            severity = "low";
            issues.push(`Method '${className}.${methodName}' contains a loop. If the collection is large or this method is called frequently, ensure the loop body does not contain unnecessary heavy work.`);
        }
        if (issues.length === 0) {
            return null;
        }
        return {
            message: issues.join(" "),
            severity,
            location: filePath
        };
    }
}
exports.LoopOptimizationRule = LoopOptimizationRule;
