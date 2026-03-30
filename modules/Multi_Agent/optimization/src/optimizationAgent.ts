// src/optimizationAgent.ts

import { AgentResult } from "../types/AgentResult";
import { Rule } from "../types/Rule";
import { LoopOptimizationRule } from "../rules/loop-optimization.rule";
import { AlgorithmChoiceRule } from "../rules/algorithm-choice.rule";
import { MapVsObjectRule } from "../rules/map-vs-object.rule";
import { ArrayIncludesVsSetRule } from "../rules/array-includes-vs-set.rule";
import { MemoizationRule } from "../rules/memoization.rule";

export interface JavaMethodAst {
  name: string;
  params: any[];
  loops: string[];          // e.g. ["for","while","doWhile"]
  conditionals: any[];
  returnType: string;
  modifiers: string[];
}

export interface JavaClassAst {
  type: "Class";
  name: string;
  methods: JavaMethodAst[];
  fields: any[];
}

export interface JavaFileAst {
  file: string;             // "samples\\model\\User.java"
  classes: JavaClassAst[];
}

export class OptimizationAgent {
  private rules: Rule[];

  constructor() {
    this.rules = [
      new LoopOptimizationRule(),
      new AlgorithmChoiceRule(),
      new MapVsObjectRule(),
      new ArrayIncludesVsSetRule(),
      new MemoizationRule()
    ];
  }

  /**
   * Analyze one Java file using its summarized AST JSON.
   * @param filePath absolute path to the .java file on disk
   * @param ast parsed JSON like the example you sent
   */
  analyzeJavaAst(filePath: string, ast: JavaFileAst): AgentResult[] {
    const results: AgentResult[] = [];

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
