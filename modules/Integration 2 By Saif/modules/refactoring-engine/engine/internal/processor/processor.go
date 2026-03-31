package processor

import (
	"encoding/json"
	"fmt"
	"os"
	"greencode-engine/internal/models"
	"greencode-engine/internal/patch"
)

// Processor handles the patch generation pipeline
type Processor struct {
	config    models.EngineConfig
	generator *patch.Generator
}

// NewProcessor creates a new processor
func NewProcessor(config models.EngineConfig) *Processor {
	return &Processor{
		config:    config,
		generator: patch.NewGenerator(),
	}
}

// ProcessIssues generates patches for a list of issues
func (p *Processor) ProcessIssues(issues []models.Issue) ([]models.Patch, error) {
	var patches []models.Patch
	patchCountByFile := make(map[string]int)

	for _, issue := range issues {
		// Check if we've reached max patches for this file
		if count, exists := patchCountByFile[issue.FilePath]; exists && count >= p.config.MaxPatchesPerFile {
			fmt.Printf("Skipping issue %s: reached max patches for file %s\n", issue.ID, issue.FilePath)
			continue
		}

		// Generate patch
		patch, err := p.generator.GeneratePatch(issue)
		if err != nil {
			fmt.Printf("Warning: Failed to generate patch for issue %s: %v\n", issue.ID, err)
			continue
		}

		// Apply auto-apply threshold
		if patch.AutoApply && patch.Confidence < p.config.AutoApplyThreshold {
			patch.AutoApply = false
		}

		patches = append(patches, *patch)
		patchCountByFile[issue.FilePath]++
	}

	return patches, nil
}

// LoadIssues loads issues from JSON file
func LoadIssues(filePath string) ([]models.Issue, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read issues file: %v", err)
	}

	var issues []models.Issue
	if err := json.Unmarshal(data, &issues); err != nil {
		return nil, fmt.Errorf("failed to parse issues JSON: %v", err)
	}

	return issues, nil
}

// SavePatches saves patches to JSON file
func SavePatches(patches []models.Patch, filePath string) error {
	data, err := json.MarshalIndent(patches, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal patches: %v", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write patches file: %v", err)
	}

	return nil
}