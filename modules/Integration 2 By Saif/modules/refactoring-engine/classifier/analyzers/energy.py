from typing import Dict, List
from models.issue import Issue, Severity, AnalyzerType

def process_energy_issues(filename: str, data: Dict) -> List[Issue]:
    """Process energy analyzer results"""
    issues = []
    
    # Process each method report
    for idx, report in enumerate(data.get("reports", [])):
        energy_score = report.get("energyScore", 0)
        combined_score = report.get("combinedEnergyScore", energy_score)
        
        # Only flag high energy methods
        if combined_score < 0.5:
            continue  # Skip low energy methods
        
        # Determine severity based on energy score
        if combined_score >= 0.8:
            severity = Severity.HIGH
            fix_confidence = 0.7
        elif combined_score >= 0.7:
            severity = Severity.MEDIUM
            fix_confidence = 0.6
        else:
            severity = Severity.LOW
            fix_confidence = 0.5
        
        # Generate description
        method_name = report.get("methodName", f"method_{idx}")
        description = f"Method '{method_name}' has high energy consumption (score: {combined_score:.3f})"
        
        # Generate suggestions
        suggestions = _generate_energy_suggestions(report)
        
        # CREATE ISSUE - IN CORRECT ORDER
        issue = Issue(
            # Fields WITHOUT defaults (IN ORDER)
            id=f"energy_{filename}_{method_name}_{idx}",
            file_path=filename,
            type="high_energy_method",
            severity=severity,
            description=description,
            analyzer=AnalyzerType.ENERGY,
            raw_data=report,
            suggestions=suggestions,
            
            # Fields WITH defaults (IN ORDER)
            line=0,  # Will need to find line number from AST
            column=None,
            fix_confidence=fix_confidence,
            can_auto_fix=False,
            energy_impact=combined_score,  # ← This will now work!
            memory_impact=None
        )
        
        issues.append(issue)
    
    return issues

def _generate_energy_suggestions(report: Dict) -> List[str]:
    """Generate specific suggestions based on energy report"""
    suggestions = []
    
    # Loop-related suggestions
    loop_count = report.get("loopCount", 0)
    if loop_count > 0:
        if loop_count > 1:
            suggestions.append("Consider combining multiple loops into a single pass")
        
        nesting_depth = report.get("nestingDepth", 0)
        if nesting_depth > 1:
            suggestions.append(f"Reduce loop nesting depth (currently {nesting_depth})")
        
        method_calls_in_loop = report.get("methodCallsInsideLoop", 0)
        if method_calls_in_loop > 0:
            suggestions.append(f"Move {method_calls_in_loop} method call(s) outside the loop if possible")
    
    # Method call suggestions
    method_calls = report.get("methodCalls", 0)
    if method_calls > 10:
        suggestions.append(f"High number of method calls ({method_calls}), consider caching results")
    
    # I/O suggestions
    io_calls = report.get("ioCalls", 0)
    if io_calls > 0:
        suggestions.append(f"Avoid I/O operations ({io_calls} calls) in performance-critical code")
    
    # Default suggestions
    if not suggestions:
        suggestions.append("Review algorithm complexity")
        suggestions.append("Consider caching frequently computed values")
        suggestions.append("Check for redundant calculations")
    
    return suggestions