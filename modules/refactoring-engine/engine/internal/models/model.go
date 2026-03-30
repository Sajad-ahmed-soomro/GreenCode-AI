package models

// Issue represents a classified issue from Python
type Issue struct {
	ID            string   `json:"id"`
	FilePath      string   `json:"filePath"`
	Line          int      `json:"line"`
	Type          string   `json:"type"`
	Severity      string   `json:"severity"`
	Description   string   `json:"description"`
	Analyzer      string   `json:"analyzer"`
	Suggestions   []string `json:"suggestions"`
	FixConfidence float64  `json:"fixConfidence"`
	CanAutoFix    bool     `json:"canAutoFix"`
	EnergyImpact  *float64 `json:"energyImpact,omitempty"`
}

// Patch represents a generated fix patch
type Patch struct {
	IssueID     string            `json:"issueId"`
	FilePath    string            `json:"filePath"`
	Original    string            `json:"original,omitempty"`
	Suggested   string            `json:"suggested"`
	Diff        string            `json:"diff"`
	Explanation string            `json:"explanation"`
	Tradeoffs   map[string]string `json:"tradeoffs"`
	AutoApply   bool              `json:"autoApply"`
	Confidence  float64           `json:"confidence"`
}

// EngineConfig holds configuration for the engine
type EngineConfig struct {
	AutoApplyThreshold float64 `json:"autoApplyThreshold"`
	MaxPatchesPerFile  int     `json:"maxPatchesPerFile"`
	DryRun             bool    `json:"dryRun"`
}