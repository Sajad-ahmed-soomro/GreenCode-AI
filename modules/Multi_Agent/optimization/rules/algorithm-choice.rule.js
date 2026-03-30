"use strict";
// src/rules/algorithm-choice.rule.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlgorithmChoiceRule = void 0;
class AlgorithmChoiceRule {
    constructor() {
        this.name = "Algorithm Choice";
        this.description = "Uses loop patterns in a method to hint at possible linear search or manual deduplication and suggest more efficient data structures.";
    }
    applies(node, _context) {
        // Only consider methods that have at least one loop
        return Array.isArray(node.loops) && node.loops.length > 0;
    }
    analyze(node, context) {
        const { filePath, className, methodName } = context;
        const loops = Array.isArray(node.loops) ? node.loops : [];
        const loopCount = loops.length;
        if (loopCount === 0) {
            return null;
        }
        const messages = [];
        let severity = "low";
        // Heuristic hints based on how many loops a method has
        if (loopCount >= 3) {
            severity = "high";
            messages.push(`Method '${className}.${methodName}' contains ${loopCount} loop constructs. This often indicates nested iterations used for linear search or manual deduplication. Consider replacing inner loops with HashSet/Map lookups or using better algorithms (for example, binary search on sorted data).`);
        }
        else if (loopCount === 2) {
            severity = "medium";
            messages.push(`Method '${className}.${methodName}' contains 2 loop constructs. Nested loops are commonly used for searching or checking duplicates; if the collections are large, consider using Sets/Maps or precomputed indexes instead of scanning in the inner loop.`);
        }
        else {
            // Single loop: still point out potential linear scan if collections are big
            severity = "low";
            messages.push(`Method '${className}.${methodName}' contains a loop that likely performs a linear scan. If this runs over large collections or is called frequently, think about using more efficient data structures (for example, HashSet/Map) or algorithms.`);
        }
        if (messages.length === 0) {
            return null;
        }
        return {
            message: messages.join(" "),
            severity,
            location: filePath
        };
    }
}
exports.AlgorithmChoiceRule = AlgorithmChoiceRule;
