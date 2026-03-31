// unified-schema.js
class UnifiedIssue {
  constructor(data = {}) {
    this.file = data.file || '';
    this.class = data.class || '';
    this.method = data.method || '';
    this.issueId = data.issueId || '';
    this.category = data.category || 'unknown'; // performance | energy | maintainability | style | compliance
    this.pattern = data.pattern || '';
    this.description = data.description || '';
    this.evidence = data.evidence || {
      complexityScore: 0,
      energyScore: 0,
      benchmarkP95: 0,
      loopDepth: 0,
      maintainabilityScore: 0
    };
    this.confidence = data.confidence || 'medium'; // high | medium | low
    this.location = data.location || {
      startLine: 0,
      endLine: 0
    };
    this.source = data.source || []; // ['ast', 'cfg', 'energy', 'maintainability', 'optimization-agent', 'compliance']
    this.severity = data.severity || 'medium'; // critical | high | medium | low
    this.rawData = data.rawData || {}; // Store original data for reference
  }

  static fromAST(astIssue) {
    return new UnifiedIssue({
      file: astIssue.file,
      class: astIssue.className,
      method: astIssue.methodName,
      issueId: `AST_${astIssue.ruleId}`,
      category: 'performance',
      pattern: astIssue.pattern || 'AST_Pattern',
      description: astIssue.description,
      evidence: {
        complexityScore: astIssue.complexity || 0,
        loopDepth: astIssue.loopDepth || 0
      },
      location: astIssue.location,
      source: ['ast']
    });
  }

  static fromEnergy(energyIssue) {
    return new UnifiedIssue({
      file: energyIssue.file,
      class: energyIssue.class,
      method: energyIssue.method,
      issueId: `ENERGY_${energyIssue.id || Date.now()}`,
      category: 'energy',
      pattern: energyIssue.pattern || 'EnergyConsumer',
      description: `High energy consumption in ${energyIssue.method}`,
      evidence: {
        energyScore: energyIssue.energy || 0,
        benchmarkP95: energyIssue.benchmark || 0,
        executionTime: energyIssue.executionTime || 0
      },
      confidence: 'high',
      source: ['energy']
    });
  }

  static fromMaintainability(maintainabilityIssue) {
    return new UnifiedIssue({
      file: maintainabilityIssue.file,
      class: maintainabilityIssue.class,
      method: maintainabilityIssue.method,
      issueId: `MAINTAIN_${maintainabilityIssue.ruleId}`,
      category: 'maintainability',
      pattern: maintainabilityIssue.pattern || 'MaintainabilityIssue',
      description: maintainabilityIssue.description,
      evidence: {
        maintainabilityScore: maintainabilityIssue.score || 0,
        complexityScore: maintainabilityIssue.complexity || 0
      },
      location: maintainabilityIssue.location,
      severity: maintainabilityIssue.severity || 'medium',
      source: ['maintainability']
    });
  }

  static fromCompliance(complianceIssue) {
    return new UnifiedIssue({
      file: complianceIssue.location?.file || '',
      class: complianceIssue.class || '',
      method: complianceIssue.method || '',
      issueId: `COMP_${complianceIssue.ruleId}`,
      category: 'compliance',
      pattern: complianceIssue.pattern || 'ComplianceViolation',
      description: complianceIssue.description,
      evidence: {
        ruleId: complianceIssue.ruleId,
        complianceLevel: complianceIssue.level || 'medium'
      },
      severity: complianceIssue.severity || 'medium',
      location: complianceIssue.location,
      source: ['compliance'],
      rawData: complianceIssue
    });
  }

  static fromOptimization(optimizationIssue) {
    return new UnifiedIssue({
      file: optimizationIssue.file,
      class: optimizationIssue.class,
      method: optimizationIssue.method,
      issueId: `OPT_${optimizationIssue.id}`,
      category: 'performance',
      pattern: optimizationIssue.optimizationType,
      description: optimizationIssue.suggestion,
      evidence: {
        potentialSavings: optimizationIssue.savings || 0,
        currentComplexity: optimizationIssue.complexity || 0
      },
      source: ['optimization-agent']
    });
  }

  toJSON() {
    return {
      file: this.file,
      class: this.class,
      method: this.method,
      issueId: this.issueId,
      category: this.category,
      pattern: this.pattern,
      description: this.description,
      evidence: this.evidence,
      confidence: this.confidence,
      location: this.location,
      source: this.source,
      severity: this.severity
    };
  }
}