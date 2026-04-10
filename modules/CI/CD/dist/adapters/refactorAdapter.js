"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptRefactor = adaptRefactor;
function adaptRefactor(refactorData) {
    if (!refactorData)
        return [];
    const fixes = Array.isArray(refactorData.fixes) ? refactorData.fixes : [];
    return fixes.map((fix, idx) => ({
        id: fix.id || `refactor_${idx}`,
        source: 'refactor',
        filePath: fix.filePath || 'Unknown.java',
        line: fix.line ?? 0,
        severity: (fix.severity || 'medium'),
        issueType: 'REFACTOR_FIX',
        description: fix.description || 'Refactor recommendation',
        explanation: fix.rationale || '',
        recommendation: fix.description || '',
        fixedCode: fix.code || '',
        confidence: Number(fix.confidence ?? 0.8),
        tags: ['refactor']
    }));
}
