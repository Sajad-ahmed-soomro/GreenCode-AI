from typing import Dict, List
from models.issue import Issue, Severity, AnalyzerType

def process_optimization_issues(filename: str, data: Dict) -> List[Issue]:
    """Process optimization analyzer results"""
    issues = []
    
    for idx, result in enumerate(data.get("results", [])):
        message = result.get("message", "")
        severity_str = result.get("severity", "low")
        
        # Map severity
        severity_map = {
            "high": Severity.HIGH,
            "medium": Severity.MEDIUM,
            "low": Severity.LOW
        }
        severity = severity_map.get(severity_str.lower(), Severity.LOW)
        
        # Determine issue type from message
        issue_type = _classify_optimization_issue(message)
        
        # Generate suggestions
        suggestions = _generate_optimization_suggestions(message, issue_type)
        
        fix_confidence = 0.6 if "loop" in issue_type else 0.4
        can_auto_fix = "loop" in issue_type
        
        # Create issue - IN CORRECT ORDER
        issue = Issue(
            # Fields WITHOUT defaults (IN ORDER)
            id=f"optimization_{filename}_{idx}_{issue_type}",
            file_path=filename,
            type=f"optimization_{issue_type}",
            severity=severity,
            description=message,
            analyzer=AnalyzerType.OPTIMIZATION,
            raw_data=result,
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

def _classify_optimization_issue(message: str) -> str:
    """Classify optimization issue based on message content"""
    message_lower = message.lower()
    
    if "loop" in message_lower:
        if "nested" in message_lower:
            return "nested_loop"
        elif "linear scan" in message_lower:
            return "linear_scan_loop"
        else:
            return "general_loop"
    elif "data structure" in message_lower:
        return "data_structure"
    elif "algorithm" in message_lower:
        return "algorithm"
    elif "heavy work" in message_lower:
        return "heavy_operation"
    else:
        return "general_optimization"

def _generate_optimization_suggestions(message: str, issue_type: str) -> List[str]:
    """Generate specific optimization suggestions"""
    suggestions = []
    
    if issue_type == "nested_loop":
        suggestions.append("Consider flattening nested loops or using caching")
        suggestions.append("Evaluate if both loops are necessary")
        suggestions.append("For matrix operations, consider block algorithms")
    
    elif issue_type == "linear_scan_loop":
        suggestions.append("For frequent lookups, consider HashSet or HashMap")
        suggestions.append("If sorting is acceptable, binary search can improve performance")
    
    elif issue_type == "data_structure":
        suggestions.append("ArrayList for random access, LinkedList for frequent insertions")
        suggestions.append("HashSet for uniqueness checks, TreeSet for sorted iteration")
        suggestions.append("HashMap for key-value lookups")
    
    elif issue_type == "heavy_operation":
        suggestions.append("Move heavy operations outside of loops")
        suggestions.append("Consider lazy evaluation or caching")
        suggestions.append("Evaluate if operation can be done asynchronously")
    
    else:
        suggestions.append("Review algorithm complexity")
        suggestions.append("Consider parallel processing if thread-safe")
        suggestions.append("Profile code to identify bottlenecks")
    
    return suggestions