# classifier/analyzers/__init__.py
from analyzers.compliance import process_compliance_issues
from analyzers.energy import process_energy_issues
from analyzers.optimization import process_optimization_issues
from analyzers.report import process_report_issues

__all__ = [
    'process_compliance_issues',
    'process_energy_issues',
    'process_optimization_issues',
    'process_report_issues'
]