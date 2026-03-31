// Common types used across the module

export type ASTMethod = {
  name: string;
  params?: Array<{ type?: string; name: string }>;
  loops?: string[]; // e.g., ["for","forEach"]
  conditionals?: string[]; // e.g. ["if","switch"]
  calls?: Array<{ name: string; line?: number }>;
  objectCreations?: number;
  modifiers?: string[];
  returnType?: string;
};

export type ASTFile = {
  file: string;
  classes: Array<{
    type?: string;
    name: string;
    methods: ASTMethod[];
    fields?: string[];
  }>;
};

export type CFG = {
  methodName: string;
  nodes: Array<{ id: string; label?: string; type?: string; next?: string[] }>;
  edges: Array<[string, string]>;
};

export type MethodReport = {
  className: string;
  methodName: string;
  loopCount: number;
  loops: string[];
  conditionalsCount: number;
  methodCalls: number;
  ioCalls: number;
  objectCreations: number;
  cyclomatic: number;
  nestingDepth: number;
  cpuScore: number;
  memScore: number;
  ioScore: number;
  energyScore: number;
  
  // Benchmark-related fields (optional)
  bench?: { medianMs: number; meanMs: number; p95Ms: number; raw: number[] };
  energyJoulesPerOp?: number;
  confidenceLevel?: "high" | "medium" | "low";
  combinedEnergyScore?: number;
  
  // Additional benchmark metrics (when merged with JavaBenchmarkResult)
  medianMs?: number;
  meanMs?: number;
  p95Ms?: number;
  minMs?: number;
  maxMs?: number;
  stdDev?: number;
  benchmarkRuns?: number;
  benchmarkTool?: string;
  runtimeEnergyScore?: number;
  
  // Static score aliases (for compatibility with EnhancedMethodReport)
  staticCpuScore?: number;
  staticMemScore?: number;
  staticIoScore?: number;
  staticEnergyScore?: number;
  
  // Additional analysis fields
  dbCalls?: number;
  recursion?: boolean;
};