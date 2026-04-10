export function adaptAst(ast: any): any[] {
    const normalized: any[] = [];

    if (!ast.classes) return normalized;

    ast.classes.forEach((cls: any) => {
        cls.methods.forEach((method: any) => {
            normalized.push({
                type: 'method',
                className: cls.name,
                methodName: method.name,
                loopDepth: method.loopNestingDepth || 0,
                loopCount: method.totalLoopCount || 0,
                conditionCount: method.conditionals ? method.conditionals.length : 0
            });
        });
    });

    return normalized;
}