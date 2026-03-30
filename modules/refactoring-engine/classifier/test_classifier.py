#!/usr/bin/env python3
"""
Test script for the classifier
"""
import json
import sys
import os

# Add to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from issue_classifier import IssueClassifier

def test_with_sample_data():
    """Test with a minimal sample of your data structure"""
    
    # Create a minimal unified results structure matching your data
    sample_data = {
        "success": True,
        "data": {
            "summary": {
                "totalFiles": 1,
                "totalIssues": 5
            },
            "files": {
                "Calculator.java": {
                    "fileName": "Calculator.java",
                    "analyzers": {
                        "compliance": [{
                            "rawData": {
                                "issues": [{
                                    "line": 1,
                                    "type": "Naming Issue",
                                    "name": "Calculator",
                                    "message": "Method name should be in camelCase.",
                                    "severity": "medium"
                                }],
                                "suggestions": [{
                                    "line": 1,
                                    "suggestion": "Rename 'Calculator' to camelCase (e.g., 'calculator')."
                                }]
                            }
                        }],
                        "energy": [{
                            "rawData": {
                                "reports": [{
                                    "methodName": "sumArray",
                                    "energyScore": 0.515,
                                    "loopCount": 1,
                                    "nestingDepth": 1
                                }]
                            }
                        }]
                    }
                }
            }
        }
    }
    
    print("Testing classifier with sample data...")
    classifier = IssueClassifier()
    issues = classifier.classify_from_unified_results(sample_data)
    
    print(f"\nFound {len(issues)} issues:")
    for issue in issues:
        print(f"\n- {issue.type} ({issue.severity.value}): {issue.description}")
        if issue.suggestions:
            print(f"  Suggestions: {issue.suggestions[0]}")
    
    return issues

if __name__ == "__main__":
    test_with_sample_data()