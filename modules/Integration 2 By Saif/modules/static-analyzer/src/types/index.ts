export type Severity = "low" | "medium" | "high" | "critical";

export interface RuleViolation {
  ruleId: string;
  severity: Severity;
  description: string;
  location: string; // e.g. "src/Foo.java > MyClass.myMethod()"
  filePath: string; // absolute or relative file path
}

export interface AnalysisReport {
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  details: RuleViolation[];
}

export interface AnalyzerModule {
  name: string;
  analyze: (filePath: string, ast: any) => Promise<RuleViolation[]>;
}
