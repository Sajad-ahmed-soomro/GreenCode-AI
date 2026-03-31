// src/rules/array-includes-vs-set.rule.ts

import { AgentResult } from "../types/AgentResult";
import { Rule, RuleContext } from "../types/Rule";
import { JavaMethodAst } from "../src/optimizationAgent";

export class ArrayIncludesVsSetRule implements Rule {
  name = "Array Includes vs Set";
  description =
    "Would detect linear membership checks inside loops and suggest Set/HashSet, but the current Java AST does not expose this information.";

  applies(_node: JavaMethodAst, _context: RuleContext): boolean {
    // No per-expression info in the current AST -> rule cannot run.
    return false;
  }

  analyze(
    _node: JavaMethodAst,
    _context: RuleContext
  ): AgentResult | null {
    return null;
  }
}
