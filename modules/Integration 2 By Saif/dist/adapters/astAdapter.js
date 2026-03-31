"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptAst = adaptAst;
function adaptAst(ast) {
    const normalized = [];
    if (!ast.classes)
        return normalized;
    ast.classes.forEach((cls) => {
        cls.methods.forEach((method) => {
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
