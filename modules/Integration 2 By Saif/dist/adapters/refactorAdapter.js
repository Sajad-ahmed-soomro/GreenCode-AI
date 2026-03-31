"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptRefactor = adaptRefactor;
function adaptRefactor(refactorData) {
    if (!refactorData)
        return [];
    return refactorData.fixes?.map((fix) => ({
        type: 'refactor',
        issueId: fix.id || '',
        description: fix.description || '',
        updatedCode: fix.code || ''
    })) || [];
}
