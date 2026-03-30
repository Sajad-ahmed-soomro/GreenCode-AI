from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class AnalyzerType(str, Enum):
    COMPLIANCE = "compliance"
    ENERGY = "energy"
    OPTIMIZATION = "optimization-report"
    REPORT = "report"
    DATA_STRUCTURE = "data-structure-results"
    MAINTAINABILITY = "maintainability"
    AST = "ast"
    CFG = "cfg"

@dataclass
class Issue:
    """Represents a classified issue ready for fixing"""
    # Fields WITHOUT defaults first
    id: str
    file_path: str
    type: str
    severity: Severity
    description: str
    analyzer: AnalyzerType
    raw_data: Dict[str, Any]
    suggestions: List[str]
    
    # Fields WITH defaults after
    line: Optional[int] = None
    column: Optional[int] = None
    fix_confidence: float = 0.0
    can_auto_fix: bool = False
    energy_impact: Optional[float] = None
    memory_impact: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "filePath": self.file_path,
            "line": self.line,
            "column": self.column,
            "type": self.type,
            "severity": self.severity.value,
            "description": self.description,
            "analyzer": self.analyzer.value,
            "suggestions": self.suggestions,
            "fixConfidence": self.fix_confidence,
            "canAutoFix": self.can_auto_fix,
            "energyImpact": self.energy_impact,
            "memoryImpact": self.memory_impact,
            "rawDataSummary": str(self.raw_data)[:100] if self.raw_data else ""
        }