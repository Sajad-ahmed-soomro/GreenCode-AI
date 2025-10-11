import { calculateCyclomaticComplexity } from "./CyclomaticComplexity.js";
import { calculateNestingDepth } from "./NestingDepth.js";
import { calculateFunctionSize } from "./FunctionSize.js";
import { buildCFG } from "../cfg/CFGBuilder.js";
import { FileMetrics, ClassMetrics, MethodMetrics } from "../../types/MethodMetrics.js";

export function analyzeAST(astJson: any, filePath: string): FileMetrics {
  const classes: ClassMetrics[] = [];

  for (const cls of astJson.classes || []) {
    const methods: MethodMetrics[] = cls.methods.map((m: any) => {
      const metrics = {
        name: m.name,
        cyclomaticComplexity: calculateCyclomaticComplexity(m),
        nestingDepth: calculateNestingDepth(m),
        functionSize: calculateFunctionSize(m),
      };

      // Build and attach CFG
      const cfg = buildCFG(m);

      return { ...metrics, cfg };
    });

    classes.push({
      className: cls.name,
      methods,
    });
  }

  return { fileName: filePath, classes };
}
