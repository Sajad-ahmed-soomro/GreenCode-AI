import json
from typing import Dict, List
from models.issue import Issue, AnalyzerType

# Import analyzer processors
from analyzers.compliance import process_compliance_issues
from analyzers.energy import process_energy_issues
from analyzers.optimization import process_optimization_issues
from analyzers.report import process_report_issues

class IssueClassifier:
    def __init__(self, context_memory: Dict = None):
        self.context_memory = context_memory or {}
        self.issue_count = 0
    
    def classify_from_unified_results(self, unified_data: Dict) -> List[Issue]:
        """Main classification entry point"""
        all_issues = []
        
        # Extract files from unified results
        files = unified_data.get("data", {}).get("files", {})
        
        for filename, file_data in files.items():
            file_issues = self._process_file(filename, file_data)
            all_issues.extend(file_issues)
        
        # Apply context filtering
        filtered_issues = self._apply_context_filter(all_issues)
        
        return filtered_issues
    
    def _process_file(self, filename: str, file_data: Dict) -> List[Issue]:
        """Process all analyzers for a single file"""
        file_issues = []
        analyzers = file_data.get("analyzers", {})
        
        # Process each analyzer type
        for analyzer_name, analyzer_results in analyzers.items():
            for result in analyzer_results:
                raw_data = result.get("rawData", {})
                
                # Route to appropriate processor
                if analyzer_name == AnalyzerType.COMPLIANCE.value:
                    issues = process_compliance_issues(filename, raw_data)
                
                elif analyzer_name == AnalyzerType.ENERGY.value:
                    issues = process_energy_issues(filename, raw_data)
                
                elif analyzer_name == AnalyzerType.OPTIMIZATION.value:
                    issues = process_optimization_issues(filename, raw_data)
                
                elif analyzer_name == AnalyzerType.REPORT.value:
                    issues = process_report_issues(filename, raw_data)
                
                # Add more analyzers as needed
                else:
                    issues = self._process_generic_analyzer(filename, analyzer_name, raw_data)
                
                file_issues.extend(issues)
        
        return file_issues
    
    def _process_generic_analyzer(self, filename: str, analyzer_name: str, data: Dict) -> List[Issue]:
        """Process analyzers without specific handlers"""
        # For now, create a generic issue
        from models.issue import Issue, Severity
        
        return [Issue(
            id=f"generic_{filename}_{analyzer_name}_{self.issue_count}",
            file_path=filename,
            type=f"generic_{analyzer_name}",
            severity=Severity.LOW,
            description=f"Issue found by {analyzer_name} analyzer",
            analyzer=AnalyzerType(analyzer_name) if analyzer_name in [a.value for a in AnalyzerType] else AnalyzerType.REPORT,
            raw_data=data,
            suggestions=["Review analyzer output"],
            fix_confidence=0.3,
            can_auto_fix=False
        )]
    
    def _apply_context_filter(self, issues: List[Issue]) -> List[Issue]:
        """Filter issues based on context memory"""
        if not self.context_memory:
            return issues
        
        filtered = []
        
        for issue in issues:
            # Simple filtering logic
            should_include = True
            
            # Example: Check if this type of issue was previously rejected
            if self._was_previously_rejected(issue):
                should_include = False
            
            # Example: Check method risk from context
            method_name = issue.raw_data.get("methodName", "")
            if method_name:
                method_risk = self._get_method_risk(issue.file_path, method_name)
                if method_risk == "high" and issue.severity.value == "low":
                    should_include = False
            
            if should_include:
                filtered.append(issue)
        
        return filtered
    
    def _was_previously_rejected(self, issue: Issue) -> bool:
        """Check if similar issue was rejected before"""
        # This is a stub - integrate with your actual context memory
        # For now, return False
        return False
    
    def _get_method_risk(self, file_path: str, method_name: str) -> str:
        """Get method risk from context memory"""
        # This is a stub - integrate with your actual context memory
        # For now, return "medium"
        return "medium"