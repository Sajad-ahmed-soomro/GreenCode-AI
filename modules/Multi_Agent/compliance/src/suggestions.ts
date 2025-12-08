// src/suggestions.ts

export function suggestSnakeCase(oldName: string): string {
  return `Rename '${oldName}' to snake_case format.`;
}

export function suggestPascalCase(oldName: string): string {
  const suggestion = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  return `Rename '${oldName}' to PascalCase (e.g., '${suggestion}').`;
}

export function suggestUpperCase(oldName: string): string {
  return `Convert '${oldName}' to UPPER_CASE format.`;
}

export function suggestIndentation(lineNumber: number): string {
  return `Fix indentation on line ${lineNumber}. Use consistent spacing.`;
}

export function suggestRemoveTrailingSpaces(lineNumber: number): string {
  return `Remove trailing spaces on line ${lineNumber}.`;
}

export function suggestFunctionDocstring(functionName: string): string {
  return `Add a docstring or comment above the function '${functionName}'.`;
}

export function suggestClassDocstring(className: string): string {
  return `Add a docstring or comment above the class '${className}'.`;
}

export function suggestRemoveUnusedImport(importName: string): string {
  return `Remove unused import '${importName}'.`;
}

export function suggestSplitLongLine(lineNumber: number): string {
  return `Split line ${lineNumber} because it exceeds the recommended limit.`;
}

export function suggestRemoveDeadCode(lineNumber: number): string {
  return `Remove commented-out code on line ${lineNumber}.`;
}

export const suggestions = {
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
