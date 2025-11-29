// src/rules/map-vs-object.rule.ts

import { AgentResult } from "../types/AgentResult";
import { Rule, RuleContext } from "../types/Rule";
import { JavaMethodAst } from "../src/optimizationAgent";

export class MapVsObjectRule implements Rule {
  name = "Map vs Object";
  description =
    "Suggests using Map/HashMap when code relies heavily on dynamic keys. (Requires richer AST data to be effective.)";

  applies(_node: JavaMethodAst, _context: RuleContext): boolean {
    // With the current AST (only loops/conditionals), there is nothing
    // map-specific to inspect, so this rule never fires.
    return false;
  }

  analyze(
    _node: JavaMethodAst,
    _context: RuleContext
  ): AgentResult | null {
    return null;
  }
}
