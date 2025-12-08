"use strict";
// src/suggestions.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestions = void 0;
exports.suggestSnakeCase = suggestSnakeCase;
exports.suggestPascalCase = suggestPascalCase;
exports.suggestUpperCase = suggestUpperCase;
exports.suggestIndentation = suggestIndentation;
exports.suggestRemoveTrailingSpaces = suggestRemoveTrailingSpaces;
exports.suggestFunctionDocstring = suggestFunctionDocstring;
exports.suggestClassDocstring = suggestClassDocstring;
exports.suggestRemoveUnusedImport = suggestRemoveUnusedImport;
exports.suggestSplitLongLine = suggestSplitLongLine;
exports.suggestRemoveDeadCode = suggestRemoveDeadCode;
function suggestSnakeCase(oldName) {
    return `Rename '${oldName}' to snake_case format.`;
}
function suggestPascalCase(oldName) {
    const suggestion = oldName.charAt(0).toUpperCase() + oldName.slice(1);
    return `Rename '${oldName}' to PascalCase (e.g., '${suggestion}').`;
}
function suggestUpperCase(oldName) {
    return `Convert '${oldName}' to UPPER_CASE format.`;
}
function suggestIndentation(lineNumber) {
    return `Fix indentation on line ${lineNumber}. Use consistent spacing.`;
}
function suggestRemoveTrailingSpaces(lineNumber) {
    return `Remove trailing spaces on line ${lineNumber}.`;
}
function suggestFunctionDocstring(functionName) {
    return `Add a docstring or comment above the function '${functionName}'.`;
}
function suggestClassDocstring(className) {
    return `Add a docstring or comment above the class '${className}'.`;
}
function suggestRemoveUnusedImport(importName) {
    return `Remove unused import '${importName}'.`;
}
function suggestSplitLongLine(lineNumber) {
    return `Split line ${lineNumber} because it exceeds the recommended limit.`;
}
function suggestRemoveDeadCode(lineNumber) {
    return `Remove commented-out code on line ${lineNumber}.`;
}
exports.suggestions = {
    suggestSnakeCase,
    suggestPascalCase,
    suggestUpperCase,
    suggestIndentation,
    suggestRemoveTrailingSpaces,
    suggestFunctionDocstring,
    suggestClassDocstring,
    suggestRemoveUnusedImport,
    suggestSplitLongLine,
    suggestRemoveDeadCode
};
