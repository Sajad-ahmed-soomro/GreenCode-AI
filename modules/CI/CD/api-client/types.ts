export interface ModuleOutput {
    ast?: any;
    energy?: any;
    agent?: any;
    refactor?: any;
}

export interface Issue {
    id?: string;
    source?: 'ast' | 'energy' | 'agent' | 'refactor';
    filePath?: string;
    methodName?: string;
    line: number;
    severity: 'high' | 'medium' | 'low';
    issueType: string;
    description: string;
    explanation: string;
    fixedCode?: string;
    recommendation?: string;
    confidence?: number;
    energyScore?: number;
    tags?: string[];
}

export interface InlineSuggestion {
    id: string;
    filePath: string;
    line: number;
    severity: 'high' | 'medium' | 'low';
    message: string;
    replacement?: string;
}

export interface IntegrationReport {
    generatedAt: string;
    jobPath: string;
    summary: {
        totalIssues: number;
        bySeverity: Record<'high' | 'medium' | 'low', number>;
        bySource: Record<string, number>;
    };
    issues: Issue[];
    inlineSuggestions: InlineSuggestion[];
    detailed: {
        astMethodsScanned: number;
        energyFindings: number;
        refactorFixes: number;
        agentSuggestions: number;
    };
}