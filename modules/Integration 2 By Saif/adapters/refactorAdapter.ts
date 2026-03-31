export function adaptRefactor(refactorData: any): any[] {
    if (!refactorData) return [];

    return refactorData.fixes?.map((fix: any) => ({
        type: 'refactor',
        issueId: fix.id || '',
        description: fix.description || '',
        updatedCode: fix.code || ''
    })) || [];
}