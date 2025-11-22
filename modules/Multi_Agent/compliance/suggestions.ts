/**
 * Suggestion Helper Functions for Compliance Agent
 *
 * These helpers generate human-readable suggestions.
 * No detection logic here, only message builders.
 */

// Suggest snake_case name
function suggestSnakeCase(oldName: string): string {
    return `Rename '${oldName}' to snake_case format.`;
}

// Suggest PascalCase name
function suggestPascalCase(oldName: string): string {
    const suggestion = oldName.charAt(0).toUpperCase() + oldName.slice(1);
    return `Rename '${oldName}' to PascalCase (e.g., '${suggestion}').`;
}

// Suggest UPPER_CASE for constants
function suggestUpperCase(oldName: string): string {
    return `Convert '${oldName}' to UPPER_CASE format.`;
}

// Suggest indentation fix
function suggestIndentation(lineNumber: number): string {
    return `Fix indentation on line ${lineNumber}. Use consistent spacing.`;
}

// Suggest removing trailing spaces
function suggestRemoveTrailingSpaces(lineNumber: number): string {
    return `Remove trailing spaces on line ${lineNumber}.`;
}

// Suggest adding function docstring
function suggestFunctionDocstring(functionName: string): string {
    return `Add a docstring or comment above the function '${functionName}'.`;
}

// Suggest adding class docstring
function suggestClassDocstring(className: string): string {
    return `Add a docstring or comment above the class '${className}'.`;
}

// Suggest removing unused import
function suggestRemoveUnusedImport(importName: string): string {
    return `Remove unused import '${importName}'.`;
}

// Suggest splitting long line
function suggestSplitLongLine(lineNumber: number): string {
    return `Split line ${lineNumber} because it exceeds the recommended limit.`;
}

// Suggest removing commented-out code
function suggestRemoveDeadCode(lineNumber: number): string {
    return `Remove commented-out code on line ${lineNumber}.`;
}

/**
 * EXPORT ALL HELPERS (CommonJS compatible)
 */
const suggestions = {
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

export = suggestions;
