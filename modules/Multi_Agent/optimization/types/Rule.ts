// src/types/Rule.ts

import { AgentResult } from "./AgentResult";
import { JavaMethodAst } from "../src/optimizationAgent";

export interface RuleContext {
  filePath: string;   // absolute path to .java file
  className: string;  // e.g. "User"
  methodName: string; // e.g. "run"
}

export interface Rule {
  name: string;
  description: string;

  // Decide if this rule cares about this method
  applies(node: JavaMethodAst, context: RuleContext): boolean;

  // Produce a finding, or null if nothing to report
  analyze(node: JavaMethodAst, context: RuleContext): AgentResult | null;
}
