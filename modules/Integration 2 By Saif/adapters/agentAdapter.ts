export function adaptAgent(agentData: any): any[] {
    if (!agentData) return [];

    return agentData.suggestions?.map((s: any) => ({
        type: 'agent',
        category: s.category || 'general',
        message: s.message || '',
        recommendation: s.recommendation || ''
    })) || [];
}