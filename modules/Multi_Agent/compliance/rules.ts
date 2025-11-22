/**
 * Compliance Agent Rules (CommonJS Export)
 */

// Naming rules
const namingRules = [
  {
    name: "variable_snake_case",
    description: "Variables must follow snake_case naming convention.",
    pattern: /^[a-z]+(_[a-z]+)*$/,
    message: "Variable name should be in snake_case."
  },
  {
    name: "function_snake_case",
    description: "Functions must follow snake_case.",
    pattern: /^[a-z]+(_[a-z]+)*$/,
    message: "Function name should be in snake_case."
  },
  {
    name: "class_pascal_case",
    description: "Classes must follow PascalCase.",
    pattern: /^[A-Z][A-Za-z0-9]*$/,
    message: "Class name should be in PascalCase."
  },
  {
    name: "constant_upper_case",
    description: "Constants should be in UPPER_CASE.",
    pattern: /^[A-Z0-9_]+$/,
    message: "Constant should be in UPPER_CASE."
  }
];

// Formatting rules
const formattingRules = [
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

// Documentation rules
const documentationRules = [
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

// Import rules
const importRules = [
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

// CommonJS export
export = {
  namingRules,
  formattingRules,
  documentationRules,
  importRules
};
