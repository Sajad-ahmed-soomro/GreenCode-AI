// src/suggestions.ts - UPDATED FOR JAVA CAMELCASE

export function suggestCamelCase(oldName: string): string {
  // Convert various formats to camelCase
  let suggestion = oldName;
  
  // If it's snake_case (user_name) → camelCase (userName)
  if (oldName.includes('_')) {
    suggestion = oldName.toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  // If it's PascalCase (UserName) → camelCase (userName)
  else if (/^[A-Z]/.test(oldName)) {
    suggestion = oldName.charAt(0).toLowerCase() + oldName.slice(1);
  }
  // If it's already mostly camelCase but has issues
  else if (/^[a-z]/.test(oldName)) {
    // Check if it has uppercase letters in wrong places
    if (/[A-Z]{2,}/.test(oldName)) {
      // Handle consecutive uppercase: HTTPRequest → httpRequest
      suggestion = oldName.charAt(0).toLowerCase() + oldName.slice(1);
    } else {
      suggestion = oldName; // Already starts with lowercase
    }
  }
  
  return `Rename '${oldName}' to camelCase (e.g., '${suggestion}').`;
}

export function suggestPascalCase(oldName: string): string {
  // Convert to PascalCase: first letter uppercase
  let suggestion = oldName;
  
  if (oldName.includes('_')) {
    // snake_case → PascalCase (user_name → UserName)
    suggestion = oldName
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  } else if (/^[a-z]/.test(oldName)) {
    // camelCase → PascalCase (userName → UserName)
    suggestion = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  }
  // If it's already PascalCase but has issues like consecutive caps
  else if (/^[A-Z]/.test(oldName)) {
    suggestion = oldName; // Keep as is if it starts with uppercase
  }
  
  return `Rename '${oldName}' to PascalCase (e.g., '${suggestion}').`;
}

export function suggestUpperSnakeCase(oldName: string): string {
  // Convert to UPPER_SNAKE_CASE
  let suggestion = oldName;
  
  if (/^[a-z][a-zA-Z0-9]*$/.test(oldName)) {
    // camelCase (userName) → USER_NAME
    suggestion = oldName
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase();
  } else if (/^[A-Z][a-z][a-zA-Z0-9]*$/.test(oldName)) {
    // PascalCase (UserName) → USER_NAME
    suggestion = oldName
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .substring(1); // Remove leading underscore
  } else if (oldName.includes('_')) {
    // Already has underscores but mixed case
    suggestion = oldName.toUpperCase();
  } else {
    // Simple uppercase conversion for single words
    suggestion = oldName.toUpperCase();
  }
  
  return `Convert '${oldName}' to UPPER_SNAKE_CASE (e.g., '${suggestion}').`;
}

// Specialized suggestions for Java getters/setters
export function suggestGetterMethodName(fieldName: string): string {
  // Convert field name to getter: userName → getUserName
  const baseName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  return `Rename method to follow getter convention: get${baseName}()`;
}

export function suggestSetterMethodName(fieldName: string): string {
  // Convert field name to setter: userName → setUserName
  const baseName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  return `Rename method to follow setter convention: set${baseName}()`;
}

export function suggestBooleanGetterMethodName(fieldName: string): string {
  // Convert boolean field to getter: active → isActive
  let baseName = fieldName;
  
  // Handle common boolean prefixes
  if (fieldName.startsWith('is') && fieldName.length > 2) {
    baseName = fieldName.charAt(2).toUpperCase() + fieldName.slice(3);
  } else if (fieldName.startsWith('has') && fieldName.length > 3) {
    baseName = fieldName.charAt(3).toUpperCase() + fieldName.slice(4);
  } else if (fieldName.startsWith('can') && fieldName.length > 3) {
    baseName = fieldName.charAt(3).toUpperCase() + fieldName.slice(4);
  }
  
  const suggestion = 'is' + baseName.charAt(0).toUpperCase() + baseName.slice(1);
  return `Rename method to follow boolean getter convention: ${suggestion}()`;
}

// Existing formatting suggestions (unchanged)
export function suggestIndentation(lineNumber: number): string {
  return `Fix indentation on line ${lineNumber}. Use consistent spacing (2 or 4 spaces).`;
}

export function suggestRemoveTrailingSpaces(lineNumber: number): string {
  return `Remove trailing spaces on line ${lineNumber}.`;
}

export function suggestMethodDocstring(methodName: string): string {
  return `Add Javadoc comment above method '${methodName}()'.`;
}

export function suggestClassDocstring(className: string): string {
  return `Add Javadoc comment above class '${className}'.`;
}

export function suggestRemoveUnusedImport(importName: string): string {
  return `Remove unused import: ${importName}`;
}

export function suggestSplitLongLine(lineNumber: number): string {
  return `Split line ${lineNumber} (exceeds 120 characters).`;
}

export function suggestRemoveDeadCode(lineNumber: number): string {
  return `Remove commented-out code on line ${lineNumber}.`;
}

export function suggestPackageNaming(packageName: string): string {
  const suggestion = packageName.toLowerCase().replace(/[^a-z0-9.]/g, '.');
  return `Package name should be lowercase: '${suggestion}'`;
}

export function suggestInterfaceNaming(interfaceName: string): string {
  let suggestion = interfaceName;
  
  if (/^[a-z]/.test(interfaceName)) {
    // Starts lowercase → PascalCase
    suggestion = interfaceName.charAt(0).toUpperCase() + interfaceName.slice(1);
  }
  
  // Optional: Add 'I' prefix if not present
  if (!interfaceName.startsWith('I') || /^[a-z]/.test(interfaceName)) {
    return `Interface name should be PascalCase (e.g., '${suggestion}'). Optionally prefix with 'I' for clarity.`;
  }
  
  return `Interface name should follow convention: IName or DescriptiveName (e.g., '${suggestion}').`;
}

// Updated suggestions object
export const suggestions = {
  suggestCamelCase,            // Replaces suggestSnakeCase
  suggestPascalCase,
  suggestUpperSnakeCase,       // Replaces suggestUpperCase
  suggestGetterMethodName,
  suggestSetterMethodName,
  suggestBooleanGetterMethodName,
  suggestIndentation,
  suggestRemoveTrailingSpaces,
  suggestMethodDocstring,      // Renamed from suggestFunctionDocstring
  suggestClassDocstring,
  suggestRemoveUnusedImport,
  suggestSplitLongLine,
  suggestRemoveDeadCode,
  suggestPackageNaming,
  suggestInterfaceNaming
};