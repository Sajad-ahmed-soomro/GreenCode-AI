"use strict";
// src/rules/array-includes-vs-set.rule.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayIncludesVsSetRule = void 0;
class ArrayIncludesVsSetRule {
    constructor() {
        this.name = "Array Includes vs Set";
        this.description = "Would detect linear membership checks inside loops and suggest Set/HashSet, but the current Java AST does not expose this information.";
    }
    applies(_node, _context) {
        // No per-expression info in the current AST -> rule cannot run.
        return false;
    }
    analyze(_node, _context) {
        return null;
    }
}
exports.ArrayIncludesVsSetRule = ArrayIncludesVsSetRule;
