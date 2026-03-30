package patch

import (
	"fmt"
	"os"
	"strings"
	"greencode-engine/internal/models"
)

// Generator creates patches for issues
type Generator struct {
	templates map[string]PatchTemplate
}

// NewGenerator creates a new patch generator
func NewGenerator() *Generator {
	return &Generator{
		templates: GetPatchTemplates(),
	}
}

// GeneratePatch generates a patch for a single issue
func (g *Generator) GeneratePatch(issue models.Issue) (*models.Patch, error) {
	// Read the source file
	content, err := os.ReadFile(issue.FilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %v", issue.FilePath, err)
	}

	sourceCode := string(content)
	
	// Get the template for this issue type
	template, exists := g.templates[issue.Type]
	if !exists {
		// Use generic template
		template = g.getGenericTemplate(issue.Type)
	}

	// Extract context from issue
	context := g.extractContext(issue)

	// Generate the fix
	original := g.extractRelevantCode(sourceCode, issue.Line)
	suggested := template.FixFunc(original, context)

	// Create diff
	diff := g.createDiff(original, suggested, issue.FilePath)

	// Determine if we should auto-apply
	autoApply := template.AutoApply && issue.CanAutoFix && issue.FixConfidence > 0.7

	patch := &models.Patch{
		IssueID:     issue.ID,
		FilePath:    issue.FilePath,
		Original:    original,
		Suggested:   suggested,
		Diff:        diff,
		Explanation: template.Description,
		Tradeoffs:   template.Tradeoffs,
		AutoApply:   autoApply,
		Confidence:  template.Confidence * issue.FixConfidence,
	}

	return patch, nil
}

// extractRelevantCode extracts code around the issue line
func (g *Generator) extractRelevantCode(source string, line int) string {
	lines := strings.Split(source, "\n")
	
	if line <= 0 || line > len(lines) {
		return source // Return all if line is invalid
	}

	// Get context around the line (3 lines before and after)
	start := max(0, line-4) // Convert to 0-index and get context
	end := min(len(lines), line+3) // line is 1-indexed in JSON
	
	return strings.Join(lines[start:end], "\n")
}

// createDiff creates a simple unified diff
func (g *Generator) createDiff(original, suggested, filePath string) string {
	if original == suggested {
		return ""
	}

	// Simple diff format
	return fmt.Sprintf("--- a/%s\n+++ b/%s\n@@ -1,1 +1,1 @@\n-%s\n+%s",
		filePath, filePath, original, suggested)
}

// extractContext extracts context information from issue
func (g *Generator) extractContext(issue models.Issue) map[string]string {
	context := make(map[string]string)
	
	// Add energy score if available
	if issue.EnergyImpact != nil {
		context["energyScore"] = fmt.Sprintf("%.3f", *issue.EnergyImpact)
	}
	
	// Add analyzer info
	context["analyzer"] = issue.Analyzer
	context["severity"] = issue.Severity
	
	return context
}

// getGenericTemplate returns a generic template for unknown issue types
func (g *Generator) getGenericTemplate(issueType string) PatchTemplate {
	return PatchTemplate{
		IssueType:   issueType,
		Description: "Generic fix suggestion",
		FixFunc: func(original string, context map[string]string) string {
			return "// Review this code for potential improvements\n" +
				"// Check: " + context["analyzer"] + " analyzer reported issue"
		},
		Tradeoffs: map[string]string{
			"various": "depends on specific fix",
		},
		AutoApply:  false,
		Confidence: 0.3,
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}