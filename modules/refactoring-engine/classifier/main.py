#!/usr/bin/env python3
"""
GreenCode AI - Issue Classifier
Takes unified results and classifies issues for refactoring
"""
import json
import sys
import os
import requests
from typing import Dict, List

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from issue_classifier import IssueClassifier
from models.issue import Issue

def load_unified_results_from_api(api_url: str) -> Dict:
    """Load unified results from API endpoint"""
    try:
        print(f"Fetching data from API: {api_url}")
        response = requests.get(api_url, timeout=30)
        response.raise_for_status()  # Raise error for bad status codes
        
        data = response.json()
        print(f"Successfully fetched data from API")
        return data
    
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to API at {api_url}")
        print("Make sure the server is running on http://localhost:5400")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print(f"Error: Request to {api_url} timed out")
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Error: Failed to fetch from API - {e}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON response from API")
        sys.exit(1)

def load_unified_results_from_file(filepath: str) -> Dict:
    """Load unified results JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {filepath}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in file - {filepath}")
        sys.exit(1)

def load_context_memory(context_path: str = None) -> Dict:
    """Load context memory if provided"""
    if not context_path or not os.path.exists(context_path):
        return {}
    
    try:
        with open(context_path, 'r') as f:
            return json.load(f)
    except:
        print(f"Warning: Could not load context memory from {context_path}")
        return {}

def save_issues(issues: List[Issue], output_path: str = "issues.json"):
    """Save classified issues to JSON file"""
    issues_dict = [issue.to_dict() for issue in issues]
    
    with open(output_path, 'w') as f:
        json.dump(issues_dict, f, indent=2)
    
    print(f"Saved {len(issues)} issues to {output_path}")
    return output_path

def main():
    """Command line entry point"""
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python main.py <source> [context_memory.json] [output.json]")
        print("\nSource can be:")
        print("  - API URL: http://localhost:5400/api/report")
        print("  - File path: /path/to/unified_results.json")
        print("\nExamples:")
        print("  python main.py http://localhost:5400/api/report")
        print("  python main.py http://localhost:5400/api/report context.json issues.json")
        print("  python main.py ../../test_data/unified_results.json")
        sys.exit(1)
    
    source = sys.argv[1]
    context_file = sys.argv[2] if len(sys.argv) > 2 else None
    output_file = sys.argv[3] if len(sys.argv) > 3 else "issues.json"
    
    print("=" * 60)
    print("GreenCode AI - Issue Classifier")
    print("=" * 60)
    
    # Load data - detect if source is URL or file path
    if source.startswith('http://') or source.startswith('https://'):
        unified_data = load_unified_results_from_api(source)
    else:
        print(f"Loading unified results from file: {source}")
        unified_data = load_unified_results_from_file(source)
    
    print(f"Loading context memory from: {context_file or 'None'}")
    context_memory = load_context_memory(context_file)
    
    # Classify issues
    print("\nClassifying issues...")
    classifier = IssueClassifier(context_memory)
    issues = classifier.classify_from_unified_results(unified_data)
    
    # Print summary
    print(f"\nClassification Complete:")
    print(f"  Total issues found: {len(issues)}")
    
    # Count by severity
    severity_counts = {}
    type_counts = {}
    for issue in issues:
        severity = issue.severity.value
        issue_type = issue.type
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
        type_counts[issue_type] = type_counts.get(issue_type, 0) + 1
    
    print(f"  By severity:")
    for severity, count in sorted(severity_counts.items()):
        print(f"    {severity}: {count}")
    
    print(f"  By analyzer:")
    analyzer_counts = {}
    for issue in issues:
        analyzer = issue.analyzer.value
        analyzer_counts[analyzer] = analyzer_counts.get(analyzer, 0) + 1
    
    for analyzer, count in sorted(analyzer_counts.items()):
        print(f"    {analyzer}: {count}")
    
    # Save issues
    output_path = save_issues(issues, output_file)
    
    # Print sample issues
    if issues:
        print(f"\nSample issues (first 3):")
        for i, issue in enumerate(issues[:3]):
            print(f"\n{i+1}. {issue.type} - {issue.severity.value}")
            print(f"   File: {issue.file_path}")
            print(f"   Description: {issue.description}")
            if issue.suggestions:
                print(f"   Suggestions: {issue.suggestions[0]}")
    
    print(f"\nOutput saved to: {output_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()