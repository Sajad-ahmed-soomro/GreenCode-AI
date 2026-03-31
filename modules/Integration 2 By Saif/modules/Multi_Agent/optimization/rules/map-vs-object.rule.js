"use strict";
// src/rules/map-vs-object.rule.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapVsObjectRule = void 0;
class MapVsObjectRule {
    constructor() {
        this.name = "Map vs Object";
        this.description = "Suggests using Map/HashMap when code relies heavily on dynamic keys. (Requires richer AST data to be effective.)";
    }
    applies(_node, _context) {
        // With the current AST (only loops/conditionals), there is nothing
        // map-specific to inspect, so this rule never fires.
        return false;
    }
    analyze(_node, _context) {
        return null;
    }
}
exports.MapVsObjectRule = MapVsObjectRule;
