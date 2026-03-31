from typing import Dict, List
from models.issue import Issue, Severity, AnalyzerType

def process_compliance_issues(filename: str, data: Dict) -> List[Issue]:
    """Process compliance analyzer results"""
    issues = []
    
    # Extract issues array
    issues_data = data.get("issues", [])
    
    for idx, issue_data in enumerate(issues_data):
        issue_type = issue_data.get("type", "")
        
        # Map severity
        severity_map = {
            "high": Severity.HIGH,
            "medium": Severity.MEDIUM,
            "low": Severity.LOW
        }
        severity = severity_map.get(issue_data.get("severity", "medium"), Severity.MEDIUM)
        
        # Determine if we can auto-fix
        can_auto_fix = False
        fix_confidence = 0.5
        
        if "naming" in issue_type.lower():
            can_auto_fix = True
            fix_confidence = 0.9  # Naming fixes are usually safe
        
        # Extract suggestions
        suggestions = _extract_suggestions(data)
        
        # Create issue - IN CORRECT ORDER
        issue = Issue(
            # Fields WITHOUT defaults (IN ORDER)
            id=f"compliance_{filename}_{idx}_{issue_type}",
            file_path=filename,
            type=f"compliance_{issue_type}",
            severity=severity,
            description=issue_data.get("message", ""),
            analyzer=AnalyzerType.COMPLIANCE,
            raw_data=issue_data,
            suggestions=suggestions,
            
            # Fields WITH defaults (IN ORDER)
            line=issue_data.get("line", 0),
            column=None,
            fix_confidence=fix_confidence,
            can_auto_fix=can_auto_fix,
            energy_impact=None,
            memory_impact=None
        )
        
        issues.append(issue)
    
    return issues

def _extract_suggestions(data: Dict) -> List[str]:
    """Extract suggestions from compliance data"""
    suggestions = []
    
    for suggestion in data.get("suggestions", []):
        if "suggestion" in suggestion:
            suggestions.append(suggestion["suggestion"])
    
    return suggestions