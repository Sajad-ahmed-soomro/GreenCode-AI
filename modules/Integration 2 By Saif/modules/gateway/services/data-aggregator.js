// data-aggregator.js
const fs = require('fs').promises;
const path = require('path');
const { UnifiedIssue } = require('../schema/unified-schema');

class DataAggregator {
  constructor(outputPath = './output') {
    this.outputPath = outputPath;
  }

  async loadAllData() {
    try {
      const [
        astData,
        cfgData,
        energyData,
        maintainabilityData,
        complianceData,
        optimizationData,
        benchmarkData
      ] = await Promise.all([
        this.loadASTData(),
        this.loadCFGData(),
        this.loadEnergyData(),
        this.loadMaintainabilityData(),
        this.loadComplianceData(),
        this.loadOptimizationData(),
        this.loadBenchmarkData()
      ]);

      return this.normalizeData({
        ast: astData,
        cfg: cfgData,
        energy: energyData,
        maintainability: maintainabilityData,
        compliance: complianceData,
        optimization: optimizationData,
        benchmarks: benchmarkData
      });
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  async loadASTData() {
    try {
      const astPath = path.join(this.outputPath, 'ast');
      const files = await fs.readdir(astPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let allData = [];
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(astPath, file), 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          allData = allData.concat(data);
        } else if (data.issues || data.details) {
          allData = allData.concat(data.issues || data.details || []);
        }
      }
      return allData;
    } catch (error) {
      console.warn('AST data not found or error loading:', error.message);
      return [];
    }
  }

  async loadCFGData() {
    try {
      const cfgPath = path.join(this.outputPath, 'cfg');
      const files = await fs.readdir(cfgPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let allData = [];
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(cfgPath, file), 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          allData = allData.concat(data);
        }
      }
      return allData;
    } catch (error) {
      console.warn('CFG data not found or error loading:', error.message);
      return [];
    }
  }

  async loadEnergyData() {
    try {
      const energyPath = path.join(this.outputPath, 'energy');
      const files = await fs.readdir(energyPath);
      
      // Look for enhanced energy report or any energy JSON
      const reportFile = files.find(f => f.includes('enhanced-energy-report') || f.includes('energy-report'));
      if (reportFile) {
        const content = await fs.readFile(path.join(energyPath, reportFile), 'utf8');
        return JSON.parse(content);
      }
      
      // Fallback: combine all energy JSON files
      let allData = [];
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(energyPath, file), 'utf8');
        const data = JSON.parse(content);
        if (data.topConsumers || data.details) {
          allData = allData.concat(data.topConsumers || data.details || []);
        }
      }
      return allData;
    } catch (error) {
      console.warn('Energy data not found or error loading:', error.message);
      return [];
    }
  }

  async loadMaintainabilityData() {
    try {
      const maintainabilityPath = path.join(this.outputPath, 'maintainability');
      const files = await fs.readdir(maintainabilityPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let allData = [];
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(maintainabilityPath, file), 'utf8');
        const data = JSON.parse(content);
        if (data.details || data.issues) {
          allData = allData.concat(data.details || data.issues || []);
        }
      }
      return allData;
    } catch (error) {
      console.warn('Maintainability data not found or error loading:', error.message);
      return [];
    }
  }

  async loadComplianceData() {
    try {
      const compliancePath = path.join(this.outputPath, 'compliance');
      const files = await fs.readdir(compliancePath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let allData = [];
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(compliancePath, file), 'utf8');
        const data = JSON.parse(content);
        if (data.details || data.rules) {
          allData = allData.concat(data.details || data.rules || []);
        }
      }
      return allData;
    } catch (error) {
      console.warn('Compliance data not found or error loading:', error.message);
      return [];
    }
  }

  async loadOptimizationData() {
    try {
      const optimizationPath = path.join(this.outputPath, 'optimization-report');
      const files = await fs.readdir(optimizationPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      let allData = [];
      for (const file of jsonFiles) {
        const content = await fs.readFile(path.join(optimizationPath, file), 'utf8');
        const data = JSON.parse(content);
        if (data.suggestions || data.optimizations) {
          allData = allData.concat(data.suggestions || data.optimizations || []);
        }
      }
      return allData;
    } catch (error) {
      console.warn('Optimization data not found or error loading:', error.message);
      return [];
    }
  }

  async loadBenchmarkData() {
    try {
      const benchmarkPath = this.outputPath;
      const files = await fs.readdir(benchmarkPath);
      const benchmarkFile = files.find(f => f.includes('benchmark-results'));
      
      if (benchmarkFile) {
        const content = await fs.readFile(path.join(benchmarkPath, benchmarkFile), 'utf8');
        return JSON.parse(content);
      }
      return {};
    } catch (error) {
      console.warn('Benchmark data not found:', error.message);
      return {};
    }
  }

  normalizeData(rawData) {
    const unifiedIssues = [];
    
    // Process AST issues
    if (rawData.ast && Array.isArray(rawData.ast)) {
      rawData.ast.forEach(issue => {
        unifiedIssues.push(UnifiedIssue.fromAST(issue));
      });
    }
    
    // Process energy data
    if (rawData.energy) {
      if (Array.isArray(rawData.energy)) {
        rawData.energy.forEach(issue => {
          unifiedIssues.push(UnifiedIssue.fromEnergy(issue));
        });
      } else if (rawData.energy.topConsumers) {
        rawData.energy.topConsumers.forEach(issue => {
          unifiedIssues.push(UnifiedIssue.fromEnergy(issue));
        });
      }
    }
    
    // Process maintainability data
    if (rawData.maintainability && Array.isArray(rawData.maintainability)) {
      rawData.maintainability.forEach(issue => {
        unifiedIssues.push(UnifiedIssue.fromMaintainability(issue));
      });
    }
    
    // Process compliance data
    if (rawData.compliance && Array.isArray(rawData.compliance)) {
      rawData.compliance.forEach(issue => {
        unifiedIssues.push(UnifiedIssue.fromCompliance(issue));
      });
    }
    
    // Process optimization data
    if (rawData.optimization && Array.isArray(rawData.optimization)) {
      rawData.optimization.forEach(issue => {
        unifiedIssues.push(UnifiedIssue.fromOptimization(issue));
      });
    }
    
    // Group issues by file and method
    const groupedIssues = this.groupIssues(unifiedIssues);
    
    // Merge duplicate issues (same file+method+pattern)
    const mergedIssues = this.mergeDuplicateIssues(groupedIssues);
    
    return {
      summary: this.generateSummary(mergedIssues),
      issues: mergedIssues,
      metadata: {
        totalSources: Object.keys(rawData).length,
        benchmarks: rawData.benchmarks,
        timestamp: new Date().toISOString()
      }
    };
  }

  groupIssues(issues) {
    const groups = {};
    
    issues.forEach(issue => {
      const key = `${issue.file}-${issue.class}-${issue.method}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(issue);
    });
    
    return groups;
  }

  mergeDuplicateIssues(groupedIssues) {
    const merged = [];
    
    Object.values(groupedIssues).forEach(issues => {
      const uniqueIssues = {};
      
      issues.forEach(issue => {
        const key = `${issue.pattern}-${issue.description}`;
        
        if (!uniqueIssues[key]) {
          uniqueIssues[key] = issue.toJSON();
          uniqueIssues[key].source = [...issue.source];
        } else {
          // Merge sources
          uniqueIssues[key].source = [...new Set([...uniqueIssues[key].source, ...issue.source])];
          
          // Merge evidence (take highest values)
          Object.keys(issue.evidence).forEach(metric => {
            if (typeof issue.evidence[metric] === 'number') {
              uniqueIssues[key].evidence[metric] = Math.max(
                uniqueIssues[key].evidence[metric] || 0,
                issue.evidence[metric]
              );
            }
          });
          
          // Use highest severity
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          if (severityOrder[issue.severity] > severityOrder[uniqueIssues[key].severity]) {
            uniqueIssues[key].severity = issue.severity;
          }
          
          // Use highest confidence
          const confidenceOrder = { high: 3, medium: 2, low: 1 };
          if (confidenceOrder[issue.confidence] > confidenceOrder[uniqueIssues[key].confidence]) {
            uniqueIssues[key].confidence = issue.confidence;
          }
        }
      });
      
      merged.push(...Object.values(uniqueIssues));
    });
    
    return merged;
  }

  generateSummary(issues) {
    const summary = {
      total: issues.length,
      byCategory: {},
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      bySource: {},
      topEnergyConsumers: [],
      topComplexityIssues: []
    };
    
    issues.forEach(issue => {
      // Count by category
      summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;
      
      // Count by severity
      summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] || 0) + 1;
      
      // Count by source
      issue.source.forEach(source => {
        summary.bySource[source] = (summary.bySource[source] || 0) + 1;
      });
      
      // Track top energy consumers
      if (issue.evidence.energyScore > 0.5) {
        summary.topEnergyConsumers.push({
          method: issue.method,
          energy: issue.evidence.energyScore,
          file: issue.file
        });
      }
      
      // Track top complexity issues
      if (issue.evidence.complexityScore > 50) {
        summary.topComplexityIssues.push({
          method: issue.method,
          complexity: issue.evidence.complexityScore,
          file: issue.file
        });
      }
    });
    
    // Sort top lists
    summary.topEnergyConsumers.sort((a, b) => b.energy - a.energy).slice(0, 5);
    summary.topComplexityIssues.sort((a, b) => b.complexity - a.complexity).slice(0, 5);
    
    return summary;
  }
}