"use strict";
// src/optimizationAgent.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationAgent = void 0;
const loop_optimization_rule_1 = require("../rules/loop-optimization.rule");
const algorithm_choice_rule_1 = require("../rules/algorithm-choice.rule");
const map_vs_object_rule_1 = require("../rules/map-vs-object.rule");
const array_includes_vs_set_rule_1 = require("../rules/array-includes-vs-set.rule");
const memoization_rule_1 = require("../rules/memoization.rule");
class OptimizationAgent {
    constructor() {
        this.rules = [
            new loop_optimization_rule_1.LoopOptimizationRule(),
            new algorithm_choice_rule_1.AlgorithmChoiceRule(),
            new map_vs_object_rule_1.MapVsObjectRule(),
            new array_includes_vs_set_rule_1.ArrayIncludesVsSetRule(),
            new memoization_rule_1.MemoizationRule()
        ];
    }
    /**
     * Analyze one Java file using its summarized AST JSON.
     * @param filePath absolute path to the .java file on disk
     * @param ast parsed JSON like the example you sent
     */
    analyzeJavaAst(filePath, ast) {
        const results = [];
        for (const cls of ast.classes || []) {
            for (const method of cls.methods || []) {
                const context = {
                    filePath,
                    className: cls.name,
                    methodName: method.name
                };
                for (const rule of this.rules) {
                    if (rule.applies(method, context)) {
                        const res = rule.analyze(method, context);
                        if (res) {
                            results.push(res);
                        }
                    }
                }
            }
        }
        return results;
    }
}
exports.OptimizationAgent = OptimizationAgent;
