"use strict";
// src/rules.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRules = exports.documentationRules = exports.formattingRules = exports.namingRules = void 0;
// src/rules.ts - UPDATED VERSION
exports.namingRules = [
    {
        name: "variable_camel_case",
        description: "Variables must follow camelCase naming convention.",
        // Allows: start with lowercase, then letters/numbers
        pattern: /^[a-z][a-zA-Z0-9]*$/,
        message: "Variable name should be in camelCase."
    },
    {
        name: "method_camel_case",
        description: "Methods must follow camelCase.",
        // Same pattern as variable for standard Java methods
        pattern: /^[a-z][a-zA-Z0-9]*$/,
        message: "Method name should be in camelCase."
    },
    {
        name: "class_pascal_case",
        description: "Classes must follow PascalCase.",
        // Allows: start with uppercase, then letters/numbers
        pattern: /^[A-Z][a-zA-Z0-9]*$/,
        message: "Class name should be in PascalCase."
    },
    {
        name: "constant_upper_snake_case", // Updated name for clarity
        description: "Constants should be in UPPER_SNAKE_CASE.",
        // Uppercase letters, numbers, underscores
        pattern: /^[A-Z][A-Z0-9_]*$/,
        message: "Constant should be in UPPER_SNAKE_CASE."
    },
    // Optional: Add rule for static final fields
    {
        name: "static_final_upper_snake_case",
        description: "Static final fields should be in UPPER_SNAKE_CASE.",
        pattern: /^[A-Z][A-Z0-9_]*$/,
        message: "Static final field should be in UPPER_SNAKE_CASE."
    }
];
exports.formattingRules = [
    {
        name: "no_trailing_spaces",
        description: "Line should not end with trailing spaces.",
        pattern: /\s+$/,
        message: "Remove trailing spaces."
    },
    {
        name: "no_tabs_allowed",
        description: "Code should not contain tab characters.",
        pattern: /\t/,
        message: "Replace tab characters with spaces."
    },
    {
        name: "line_length_limit",
        description: "Line should not exceed 120 characters.",
        pattern: /^.{121,}$/,
        message: "Line is too long (limit: 120 characters)."
    }
];
exports.documentationRules = [
    {
        name: "missing_docstring_function",
        description: "Functions should have a docstring/comment.",
        pattern: /function\s+\w+\s*\(/,
        message: "Function appears to be missing a docstring or comment."
    },
    {
        name: "missing_docstring_class",
        description: "Classes should have a docstring.",
        pattern: /class\s+\w+/,
        message: "Class appears to be missing a docstring or comment."
    },
    {
        name: "dead_commented_code",
        description: "Commented-out code should be removed.",
        pattern: /\/\/.*(;|\{|\})/,
        message: "Potential dead commented code detected."
    }
];
exports.importRules = [
    {
        name: "unused_import",
        description: "Imports that are never used should be removed.",
        pattern: /^import\s+.*$/,
        message: "Unused import detected."
    },
    {
        name: "incorrect_import_grouping",
        description: "Imports should be grouped (built-in, external, local).",
        pattern: /^import\s+.*$/,
        message: "Import grouping inconsistent."
    }
];
