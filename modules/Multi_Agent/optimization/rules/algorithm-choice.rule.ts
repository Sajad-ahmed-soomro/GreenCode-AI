// src/rules/algorithm-choice.rule.ts

import { AgentResult } from "../types/AgentResult";
import { Rule, RuleContext } from "../types/Rule";
import { JavaMethodAst } from "../src/optimizationAgent";

export class AlgorithmChoiceRule implements Rule {
  name = "Algorithm Choice";
  description =
    "Uses loop patterns in a method to hint at possible linear search or manual deduplication and suggest more efficient data structures.";

  applies(node: JavaMethodAst, _context: RuleContext): boolean {
    // Only consider methods that have at least one loop
    return Array.isArray(node.loops) && node.loops.length > 0;
  }

  analyze(node: JavaMethodAst, context: RuleContext): AgentResult | null {
    const { filePath, className, methodName } = context;
    const loops = Array.isArray(node.loops) ? node.loops : [];
    const loopCount = loops.length;

    if (loopCount === 0) {
      return null;
    }

    const messages: string[] = [];
    let severity: AgentResult["severity"] = "low";

    // Heuristic hints based on how many loops a method has
    if (loopCount >= 3) {
      severity = "high";
      messages.push(
        `Method '${className}.${methodName}' contains ${loopCount} loop constructs. This often indicates nested iterations used for linear search or manual deduplication. Consider replacing inner loops with HashSet/Map lookups or using better algorithms (for example, binary search on sorted data).`
      );
    } else if (loopCount === 2) {
      severity = "medium";
      messages.push(
        `Method '${className}.${methodName}' contains 2 loop constructs. Nested loops are commonly used for searching or checking duplicates; if the collections are large, consider using Sets/Maps or precomputed indexes instead of scanning in the inner loop.`
      );
    } else {
      // Single loop: still point out potential linear scan if collections are big
      severity = "low";
      messages.push(
        `Method '${className}.${methodName}' contains a loop that likely performs a linear scan. If this runs over large collections or is called frequently, think about using more efficient data structures (for example, HashSet/Map) or algorithms.`
      );
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
