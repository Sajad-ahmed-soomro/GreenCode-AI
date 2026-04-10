export function adaptRefactor(refactorData: any): any[] {
    if (!refactorData) return [];

    const fixes = Array.isArray(refactorData.fixes) ? refactorData.fixes : [];
    return fixes.map((fix: any, idx: number) => ({
        id: fix.id || `refactor_${idx}`,
        source: 'refactor',
        filePath: fix.filePath || 'Unknown.java',
        line: fix.line ?? 0,
        severity: (fix.severity || 'medium') as 'high' | 'medium' | 'low',
        issueType: 'REFACTOR_FIX',
        description: fix.description || 'Refactor recommendation',
        explanation: fix.rationale || '',
        recommendation: fix.description || '',
        fixedCode: fix.code || '',
        confidence: Number(fix.confidence ?? 0.8),
        tags: ['refactor']
    }));
}