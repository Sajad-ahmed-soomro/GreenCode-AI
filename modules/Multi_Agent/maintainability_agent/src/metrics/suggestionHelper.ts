import { MetricResult } from "./metricsHelper.js";

export function generateSuggestions(metrics: MetricResult[]): string[] {
  const suggestions: string[] = [];

  for (const m of metrics) {
    if (m.metric === "Function Length" && m.status === "High") {
      suggestions.push("Function is too long. Split into smaller helper methods.");
    }

    if (m.metric === "Nesting Depth" && m.status === "High") {
      suggestions.push("Deeply nested logic. Consider flattening with early returns or switch cases.");
    }

    if (m.metric === "Cyclomatic Complexity" && m.status === "High") {
      suggestions.push(" High logical complexity. Try breaking down conditions or loops.");
    }

    if (m.metric === "Parameter Count" && m.status === "High") {
      suggestions.push(" Too many parameters. Consider grouping into an object or class.");
    }

    if (m.metric === "Comment Ratio" && m.status === "High") {
      suggestions.push(" Low comment coverage. Add documentation or inline comments.");
    }

    if (m.metric === "Naming Clarity" && m.status === "Medium") {
      suggestions.push(" Some variable names are unclear. Use more descriptive names.");
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(" No major maintainability issues detected.");
  }

  return suggestions;
}
