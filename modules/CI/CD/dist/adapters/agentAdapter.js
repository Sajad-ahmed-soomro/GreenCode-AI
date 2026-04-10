"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptAgent = adaptAgent;
function adaptAgent(agentData) {
    if (!agentData)
        return [];
    const suggestions = Array.isArray(agentData.suggestions) ? agentData.suggestions : [];
    return suggestions.map((s, idx) => ({
        id: `agent_${idx}`,
        source: 'agent',
        filePath: s.filePath || s.file || 'Unknown.java',
        line: s.line ?? 0,
        severity: (s.severity || 'medium'),
        issueType: s.category || 'AGENT_SUGGESTION',
        description: s.message || 'Agent suggestion',
        explanation: s.reason || '',
        recommendation: s.recommendation || '',
        fixedCode: s.patch || '',
        confidence: Number(s.confidence ?? 0.75),
        tags: ['agent']
    }));
}
