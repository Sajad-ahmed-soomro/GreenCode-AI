package patch

import "strings"

// PatchTemplate defines a fix template for a specific issue type
type PatchTemplate struct {
	IssueType   string
	Description string
	FixFunc     func(original string, context map[string]string) string
	Tradeoffs   map[string]string
	AutoApply   bool
	Confidence  float64
}

// GetPatchTemplates returns all available patch templates
func GetPatchTemplates() map[string]PatchTemplate {
	return map[string]PatchTemplate{
		// Naming convention fixes
		"compliance_Naming Issue": {
			IssueType:   "compliance_Naming Issue",
			Description: "Fix naming convention (camelCase)",
			FixFunc: func(original string, context map[string]string) string {
				// Simple camelCase conversion
				if len(original) > 0 {
					// Convert first character to lowercase
					return strings.ToLower(original[:1]) + original[1:]
				}
				return original
			},
			Tradeoffs: map[string]string{
				"readability": "improved",
				"performance": "neutral",
				"maintenance": "improved",
			},
			AutoApply:  true,
			Confidence: 0.9,
		},

		// Switch without default case
		"report_switch_missing_default": {
			IssueType:   "report_switch_missing_default",
			Description: "Add default case to switch statement",
			FixFunc: func(original string, context map[string]string) string {
				if strings.Contains(original, "switch") && !strings.Contains(original, "default") {
					// Add default case before the closing brace
					lines := strings.Split(original, "\n")
					for i, line := range lines {
						if strings.Contains(line, "}") && strings.TrimSpace(line) == "}" {
							// Insert default case
							indent := strings.Repeat(" ", len(line)-len(strings.TrimLeft(line, " ")))
							lines[i] = indent + "default:\n" + indent + "    break;\n" + line
							break
						}
					}
					return strings.Join(lines, "\n")
				}
				return original
			},
			Tradeoffs: map[string]string{
				"robustness": "improved",
				"performance": "neutral",
				"safety":      "improved",
			},
			AutoApply:  true,
			Confidence: 0.85,
		},

		// Loop optimization suggestions
		"optimization_general_loop": {
			IssueType:   "optimization_general_loop",
			Description: "Optimize loop performance",
			FixFunc: func(original string, context map[string]string) string {
				// Suggest StringBuilder for string concatenation in loops
				if strings.Contains(original, "+=") && strings.Contains(original, "for") {
					return "// Consider using StringBuilder for string concatenation in loops\n" +
						"// StringBuilder sb = new StringBuilder();\n" +
						"// for (...) { sb.append(...); }\n" +
						"// String result = sb.toString();"
				}
				return original
			},
			Tradeoffs: map[string]string{
				"performance": "improved",
				"memory":      "slightly increased",
				"readability": "slightly decreased",
			},
			AutoApply:  false,
			Confidence: 0.7,
		},

		// High energy method
		"high_energy_method": {
			IssueType:   "high_energy_method",
			Description: "Optimize high energy consumption method",
			FixFunc: func(original string, context map[string]string) string {
				energyScore := context["energyScore"]
				return "// High energy method detected (score: " + energyScore + ")\n" +
					"// Suggestions:\n" +
					"// 1. Review algorithm complexity\n" +
					"// 2. Cache frequent computations\n" +
					"// 3. Reduce method calls in loops\n" +
					"// 4. Consider using more efficient data structures"
			},
			Tradeoffs: map[string]string{
				"energy":      "potentially reduced",
				"performance": "potentially improved",
				"complexity":  "may increase",
			},
			AutoApply:  false,
			Confidence: 0.6,
		},
	}
}