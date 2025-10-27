import chalk from "chalk";
import { calculateCyclomaticComplexity } from "./CyclomaticComplexity.js";
import { calculateNestingDepth } from "./NestingDepth.js";
import { calculateFunctionSize } from "./FunctionSize.js";
import {  buildClassCFG } from "../cfg/CFGBuilder.js";
import { FileMetrics, ClassMetrics, MethodMetrics } from "../../types/MethodMetrics.js";

/* ---------------- Helper AST types ---------------- */
interface MethodNode {
  name?: string;
  loops?: string[];
  conditionals?: string[];
  constructorChaining?: string[];
  conditionalsTree?: any[];
}

interface ClassNode {
  name?: string;
  methods?: MethodNode[];
}

interface ASTFile {
  file: string;
  classes?: ClassNode[];
}

// Track processed methods globally to prevent duplicates across multiple calls
const processedMethods = new Set<string>();

/* ---------------- Main Analyzer (Typed + Safe + Deduplicated) ---------------- */
export function analyzeAST(astJson: ASTFile, filePath: string): FileMetrics {
  const classes: ClassMetrics[] = [];

  if (!astJson.classes || astJson.classes.length === 0) {
    console.log(chalk.yellow(`⚠️  No classes found in ${filePath}`));
    return { fileName: filePath, classes: [] };
  }

  console.log(chalk.dim(`\n[CFG] Starting analysis for ${astJson.classes.length} class(es)...`));

  for (const cls of astJson.classes) {
    const className: string = cls.name || "AnonymousClass";
    const methods: MethodNode[] = cls.methods || [];

    console.log(chalk.dim(`[CFG] Class: ${className} → ${methods.length} method(s)`));

    // 🧠 Generate Class-Level CFG (merged CFG of all methods)
    const classCFG = buildClassCFG({
      name: className,
      methods: methods.map((m) => ({
        name: m.name,
        loops: m.loops || [],
        conditionals: m.conditionals || [],
        constructorChaining: m.constructorChaining || [],
        conditionalsTree: m.conditionalsTree || [],
      })),
    });

    console.log(
      chalk.green(
        `   [CFG ✓] ${className} (merged) → ${classCFG?.nodes?.length ?? 0} nodes, ${
          classCFG?.edges?.length ?? 0
        } edges`
      )
    );

    // Compute metrics for each method (unchanged)
    const methodMetrics: MethodMetrics[] = methods.map((method: MethodNode): MethodMetrics => {
      const methodName: string = method.name || "anonymous";
      const uniqueKey = `${filePath}::${className}::${methodName}`;

      if (processedMethods.has(uniqueKey)) {
        console.log(chalk.gray(`   [SKIP] ${methodName} (already processed)`));
        return {
          name: methodName,
          cyclomaticComplexity: 0,
          nestingDepth: 0,
          functionSize: 0,
        };
      }

      processedMethods.add(uniqueKey);

      const complexity = calculateCyclomaticComplexity(method);
      const depth = calculateNestingDepth(method);
      const size = calculateFunctionSize(method);

      return {
        name: methodName,
        cyclomaticComplexity: complexity,
        nestingDepth: depth,
        functionSize: size,
      };
    });

    // Push results per class
    classes.push({
      className,
      methods: methodMetrics,
      cfg: classCFG, // ✅ attach merged CFG
    });
  }

  return { fileName: filePath, classes };
}

/* ---------------- Utility ---------------- */
export function resetAnalysisTracking() {
  processedMethods.clear();
}
