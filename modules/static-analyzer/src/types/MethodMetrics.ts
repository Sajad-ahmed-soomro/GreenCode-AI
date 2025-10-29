
export interface MethodMetrics {
  name: string;
  cyclomaticComplexity: number;
  nestingDepth: number;
  functionSize: number;
  
}

export interface ClassMetrics {
  className: string;
  methods: MethodMetrics[];
  summary?: {
    totalCyclomaticComplexity: number;
    maxNestingDepth: number;
    totalFunctionSize: number;
    totalMethods: number;
  };
}

export interface FileMetrics {
  fileName: string;
  classes: ClassMetrics[];
}
