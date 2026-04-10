export function adaptAgent(agentData: any): any[] {
    if (!agentData) return [];

    const suggestions = Array.isArray(agentData.suggestions) ? agentData.suggestions : [];
    return suggestions.map((s: any, idx: number) => ({
        id: `agent_${idx}`,
        source: 'agent',
        filePath: s.filePath || s.file || 'Unknown.java',
        line: s.line ?? 0,
        severity: (s.severity || 'medium') as 'high' | 'medium' | 'low',
        issueType: s.category || 'AGENT_SUGGESTION',
        description: s.message || 'Agent suggestion',
        explanation: s.reason || '',
        recommendation: s.recommendation || '',
        fixedCode: s.patch || '',
        confidence: Number(s.confidence ?? 0.75),
        tags: ['agent']
    }));
}