from typing import Dict, List
from models.issue import Issue, Severity, AnalyzerType

def process_report_issues(filename: str, data: Dict) -> List[Issue]:
    """Process report analyzer results"""
    issues = []
    
    for idx, detail in enumerate(data.get("details", [])):
        rule_id = detail.get("ruleId", "")
        description = detail.get("description", "")
        severity_str = detail.get("severity", "medium")
        
        # Map severity
        severity_map = {
            "critical": Severity.CRITICAL,
            "high": Severity.HIGH,
            "medium": Severity.MEDIUM,
            "low": Severity.LOW
        }
        severity = severity_map.get(severity_str.lower(), Severity.MEDIUM)
        
        # Determine issue type from rule ID
        issue_type = _classify_report_issue(rule_id, description)
        
        # Can we auto-fix?
        can_auto_fix, fix_confidence = _determine_auto_fix(rule_id, issue_type)
        
        # Generate suggestions
        suggestions = _generate_report_suggestions(rule_id, description)
        
        # Create issue - IN CORRECT ORDER
        issue = Issue(
            # Fields WITHOUT defaults (IN ORDER)
            id=f"report_{filename}_{rule_id}_{idx}",
            file_path=filename,
            type=f"report_{issue_type}",
            severity=severity,
            description=description,
            analyzer=AnalyzerType.REPORT,
            raw_data=detail,
            suggestions=suggestions,
            
            # Fields WITH defaults (IN ORDER)
            line=0,  # Need line detection
            column=None,
            fix_confidence=fix_confidence,
            can_auto_fix=can_auto_fix,
            energy_impact=None,
            memory_impact=None
        )
        
        issues.append(issue)
    
    return issues

def _classify_report_issue(rule_id: str, description: str) -> str:
    """Classify report issue based on rule ID and description"""
    if rule_id.startswith("QA"):
        return "code_quality"
    elif rule_id.startswith("QD"):
        return "documentation"
    elif "switch" in description.lower() and "default" in description.lower():
        return "switch_missing_default"
    elif "documentation" in description.lower():
        return "missing_documentation"
    else:
        return "general_issue"

def _determine_auto_fix(rule_id: str, issue_type: str) -> tuple[bool, float]:
    """Determine if we can auto-fix and with what confidence"""
    if issue_type == "switch_missing_default":
        return True, 0.9  # Easy to add default case
    
    elif issue_type == "missing_documentation":
        return False, 0.3  # Hard to auto-generate good docs
    
    elif issue_type == "code_quality":
        return True, 0.7  # Many code quality issues can be auto-fixed
    
    else:
        return False, 0.5

def _generate_report_suggestions(rule_id: str, description: str) -> List[str]:
    """Generate suggestions for report issues"""
    suggestions = []
    
    if "switch without default" in description:
        suggestions.append("Add a default case to handle unexpected values")
        suggestions.append("Consider throwing an exception in default case for safety")
    
    elif "Missing documentation" in description:
        suggestions.append("Add JavaDoc comments for the method/class")
        suggestions.append("Document parameters, return values, and exceptions")
    
    elif rule_id.startswith("QA"):
        suggestions.append("Review code quality guidelines")
        suggestions.append("Consider refactoring for better maintainability")
    
    else:
        suggestions.append("Review the reported issue")
        suggestions.append("Consider best practices for the specific pattern")
    
    return suggestions