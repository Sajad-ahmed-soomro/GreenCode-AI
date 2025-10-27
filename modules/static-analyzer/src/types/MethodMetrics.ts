import { CFG } from "./CFGType.js";

export interface MethodMetrics {
  name: string; // was methodName → changed to `name` (matches MetricsAnalyzer + RuleEngine)
  cyclomaticComplexity: number;
  nestingDepth: number;
  functionSize: number;
  cfg?: CFG;
}

export interface ClassMetrics {
  className: string;
  methods: MethodMetrics[];
  cfg?: CFG; 
}

export interface FileMetrics {
  fileName: string;
  classes: ClassMetrics[];
}
