export interface ModuleOutput {
    ast?: any;
    energy?: any;
    agent?: any;
    refactor?: any;
}

export interface Issue {
    line: number;
    severity: 'high' | 'medium' | 'low';
    issueType: string;
    description: string;
    explanation: string;
    fixedCode?: string;
    confidence?: number;
}