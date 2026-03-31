"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptAgent = adaptAgent;
function adaptAgent(agentData) {
    if (!agentData)
        return [];
    return agentData.suggestions?.map((s) => ({
        type: 'agent',
        category: s.category || 'general',
        message: s.message || '',
        recommendation: s.recommendation || ''
    })) || [];
}
