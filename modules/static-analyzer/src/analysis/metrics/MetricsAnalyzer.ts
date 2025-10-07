import { calculateCyclomaticComplexity } from "./CyclomaticComplexity.js";
import { calculateNestingDepth } from "./NestingDepth.js";
import { calculateFunctionSize } from "./FunctionSize.js";
import { FileMetrics, ClassMetrics, MethodMetrics } from "../../types/MethodMetrics.js";

export function analyzeAST(astJson: any, filePath: string): FileMetrics {
  const classes: ClassMetrics[] = [];

  for (const cls of astJson.classes || []) {
    const methods: MethodMetrics[] = cls.methods.map((m: any) => ({
      name: m.name,
      cyclomaticComplexity: calculateCyclomaticComplexity(m),
      nestingDepth: calculateNestingDepth(m),
      functionSize: calculateFunctionSize(m),
    }));

    classes.push({
      className: cls.name,
      methods,
    });
  }

  return { fileName:filePath, classes };
}
