import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_OUTPUT_DIR = path.join(process.cwd(), 'output');

// Helper function to get all compliance files
const getAllComplianceFiles = (baseDir = BASE_OUTPUT_DIR) => {
  const result = [];
  
  if (!fs.existsSync(baseDir)) {
    console.warn(`Directory not found: ${baseDir}`);
    return result;
  }
  
  try {
    const folders = fs.readdirSync(baseDir);
    
    folders.forEach(folder => {
      const folderPath = path.join(baseDir, folder);
      
      try {
        if (fs.statSync(folderPath).isDirectory()) {
          const compliancePath = path.join(folderPath, 'compliance');
          
          if (fs.existsSync(compliancePath) && fs.statSync(compliancePath).isDirectory()) {
            const files = fs.readdirSync(compliancePath)
              .filter(f => f.includes('.report.json') || f.endsWith('.json'))
              .map(f => ({
                fullPath: path.join(compliancePath, f),
                fileName: f,
                folder: folder
              }));
            
            result.push(...files);
          }
        }
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error in getAllComplianceFiles:', error);
    return [];
  }
};

// Extract base file name
const extractBaseFileName = (jsonFileName) => {
  let fileName = jsonFileName.replace('.report.json', '').replace('.json', '');
  const hashRegex = /^[a-f0-9]+_/;
  if (hashRegex.test(fileName)) {
    fileName = fileName.replace(hashRegex, '');
  }
  
  fileName = fileName
    .replace('_extracted-', '')
    .replace('compliance_', '')
    .replace('_report', '')
    .replace('_compliance', '')
    .replace('.compliance', '')
    .replace('maintainability_', '')
    .replace('data-structure_', '');
  
  if (!fileName.endsWith('.java')) {
    fileName += '.java';
  }
  
  return fileName;
};

// Get available compliance files
export const getAvailableComplianceFiles = () => {
  try {
    const files = getAllComplianceFiles();
    
    return files.map(file => {
      try {
        const stats = fs.statSync(file.fullPath);
        const baseName = extractBaseFileName(file.fileName);
        const fileId = `${file.folder}-${baseName.replace('.java', '')}`;
        
        return {
          id: fileId,
          name: baseName.replace('.java', ''),
          fileName: baseName,
          path: file.fullPath,
          folder: file.folder,
          size: stats.size,
          modified: stats.mtime,
          fullPath: file.fullPath
        };
      } catch (error) {
        console.error(`Error reading file stats for ${file.fullPath}:`, error);
        return null;
      }
    }).filter(Boolean);
    
  } catch (error) {
    console.error('Error in getAvailableComplianceFiles:', error);
    return [];
  }
};

// Process compliance analysis
const processComplianceAnalysis = (rawAnalysis) => {
  // Initialize with defaults
  const processed = {
    fileName: rawAnalysis.fileName || rawAnalysis.file || 'unknown.java',
    totalIssues: 0,
    issues: [],
    violations: [],
    suggestions: [],
    complianceScore: 0,
    standards: ['Java Coding Standards', 'PEP8 (snake_case)'],
    agent: rawAnalysis.agent || 'ComplianceAgent'
  };
  
  // Extract issues from the raw analysis
  if (rawAnalysis.issues && Array.isArray(rawAnalysis.issues)) {
    // Transform issues to match frontend expectations
    processed.issues = rawAnalysis.issues.map(issue => {
      // Determine severity based on issue type
      let severity = 'medium';
      let category = 'other';
      
      if (issue.type && issue.type.includes('Naming')) {
        severity = 'medium';
        category = 'naming';
      } else if (issue.type && issue.type.includes('Formatting')) {
        severity = 'low';
        category = 'style';
      }
      
      return {
        type: issue.type || 'Compliance Issue',
        severity: severity,
        lineNumber: issue.line || issue.lineNumber || 0,
        description: issue.message || issue.description || 'No description',
        recommendation: issue.suggestion || `Fix ${issue.type || 'compliance issue'}`,
        rule: issue.type || 'ComplianceRule',
        category: category,
        // Include original data for reference
        original: issue
      };
    });
    
    processed.totalIssues = rawAnalysis.issues.length;
  }
  
  // Extract suggestions if available
  if (rawAnalysis.suggestions && Array.isArray(rawAnalysis.suggestions)) {
    processed.suggestions = rawAnalysis.suggestions.map(suggestion => ({
      line: suggestion.line || 0,
      suggestion: suggestion.suggestion || suggestion.message || 'No suggestion',
      type: 'Suggestion'
    }));
  }
  
  // Calculate severity summary
  processed.severitySummary = {
    critical: processed.issues.filter(i => i.severity === 'critical').length,
    high: processed.issues.filter(i => i.severity === 'high').length,
    medium: processed.issues.filter(i => i.severity === 'medium').length,
    low: processed.issues.filter(i => i.severity === 'low').length
  };
  
  // Calculate issue categories
  processed.issueCategories = {
    naming: processed.issues.filter(i => i.category === 'naming').length,
    style: processed.issues.filter(i => i.category === 'style').length,
    documentation: processed.issues.filter(i => i.category === 'documentation').length,
    security: processed.issues.filter(i => i.category === 'security').length,
    performance: processed.issues.filter(i => i.category === 'performance').length,
    other: processed.issues.filter(i => i.category === 'other').length
  };
  
  // Extract recommendations
  const recommendations = new Set();
  processed.issues.forEach(issue => {
    if (issue.recommendation) {
      recommendations.add(issue.recommendation);
    }
  });
  processed.recommendations = Array.from(recommendations);
  
  // Calculate compliance score (100 - (issues * weight))
  // Weight: critical=5, high=3, medium=2, low=1
  const severityWeight = processed.severitySummary.critical * 5 + 
                        processed.severitySummary.high * 3 + 
                        processed.severitySummary.medium * 2 + 
                        processed.severitySummary.low * 1;
  
  processed.complianceScore = Math.max(0, 100 - (severityWeight * 0.5));
  
  // Mark as real data
  processed.actualData = true;
  
  return processed;
};

// Get compliance analysis for multiple files
export const getComplianceAnalysis = (fileIds = []) => {
  try {
    const analyses = [];
    const availableFiles = getAvailableComplianceFiles();
    
    if (fileIds.length === 0) {
      fileIds = availableFiles.map(file => file.id);
    }
    
    for (const fileId of fileIds) {
      try {
        let fileInfo = availableFiles.find(f => f.id === fileId);
        
        if (!fileInfo) {
          const fileNameOnly = fileId.includes('-') ? fileId.split('-')[1] : fileId;
          fileInfo = availableFiles.find(f => 
            f.name.toLowerCase() === fileNameOnly.toLowerCase() ||
            f.id.includes(fileNameOnly)
          );
        }
        
        if (fileInfo && fs.existsSync(fileInfo.path)) {
          const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
          const rawAnalysis = JSON.parse(fileContent);
          const processedAnalysis = processComplianceAnalysis(rawAnalysis);
          
          analyses.push({
            id: fileInfo.id,
            name: fileInfo.name,
            fileName: fileInfo.name,
            path: fileInfo.path,
            folder: fileInfo.folder,
            analysis: processedAnalysis,
            success: true
          });
        } else {
          analyses.push({
            id: fileId,
            name: `${fileId}.java`,
            fileName: `${fileId}.java`,
            folder: 'no-data',
            analysis: {
              fileName: `${fileId}.java`,
              agent: "compliance",
              issues: [],
              totalIssues: 0,
              issueCategories: {
                naming: 0,
                style: 0,
                documentation: 0,
                security: 0,
                performance: 0,
                other: 0
              },
              severitySummary: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
              },
              recommendations: [],
              complianceScore: 0,
              standards: ['Java Coding Standards']
            },
            success: false,
            message: 'No compliance data found'
          });
        }
      } catch (error) {
        console.error(`Error reading compliance file ${fileId}:`, error);
        analyses.push({
          id: fileId,
          name: `${fileId}.java`,
          fileName: `${fileId}.java`,
          folder: 'error',
          analysis: {
            fileName: `${fileId}.java`,
            agent: "compliance",
            issues: [],
            totalIssues: 0,
            issueCategories: {
              naming: 0,
              style: 0,
              documentation: 0,
              security: 0,
              performance: 0,
              other: 0
            },
            severitySummary: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0
            },
            recommendations: [],
            complianceScore: 0,
            standards: ['Java Coding Standards']
          },
          success: false,
          error: error.message
        });
      }
    }
    
    return analyses;
  } catch (error) {
    console.error('Error in getComplianceAnalysis:', error);
    return [];
  }
};

// Get single file analysis
export const getFileComplianceAnalysis = (fileId) => {
  const analysis = getComplianceAnalysis([fileId]);
  return analysis.length > 0 ? analysis[0] : null;
};

// Calculate aggregated metrics
export const calculateComplianceAggregatedMetrics = (analyses) => {
  const totalIssues = analyses.reduce((sum, file) => sum + (file.analysis.totalIssues || 0), 0);
  const totalCriticalIssues = analyses.reduce((sum, file) => sum + (file.analysis.severitySummary?.critical || 0), 0);
  
  const severityBreakdown = analyses.reduce((acc, file) => {
    const breakdown = file.analysis.severitySummary || {};
    Object.entries(breakdown).forEach(([severity, count]) => {
      acc[severity] = (acc[severity] || 0) + count;
    });
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });
  
  const issueTypes = {};
  analyses.forEach(file => {
    file.analysis.issueCategories && Object.entries(file.analysis.issueCategories).forEach(([category, count]) => {
      issueTypes[category] = (issueTypes[category] || 0) + count;
    });
  });
  
  const mostCommonIssue = Object.entries(issueTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  
  const totalScore = analyses.reduce((sum, file) => sum + (file.analysis.complianceScore || 0), 0);
  const avgComplianceScore = analyses.length > 0 ? totalScore / analyses.length : 0;
  
  return {
    totalFiles: analyses.length,
    totalIssues,
    totalCriticalIssues,
    avgIssuesPerFile: analyses.length > 0 ? (totalIssues / analyses.length).toFixed(2) : 0,
    severityBreakdown,
    issueTypes,
    mostCommonIssue,
    avgComplianceScore: avgComplianceScore.toFixed(1)
  };
};

// Search for compliance files
export const searchComplianceFiles = (query) => {
  try {
    const availableFiles = getAvailableComplianceFiles();
    const analyses = getComplianceAnalysis();
    
    const searchResults = [];
    const queryLower = query.toLowerCase();
    
    // Search in file names
    availableFiles.forEach(file => {
      if (file.name.toLowerCase().includes(queryLower) || 
          file.folder.toLowerCase().includes(queryLower)) {
        const fileAnalysis = analyses.find(a => a.id === file.id) || getFileComplianceAnalysis(file.id);
        searchResults.push({
          type: 'file',
          id: file.id,
          name: file.name,
          folder: file.folder,
          match: file.name.toLowerCase().includes(queryLower) ? 'filename' : 'folder',
          analysis: fileAnalysis
        });
      }
    });
    
    // Search in analysis content
    analyses.forEach(analysis => {
      // Search in issues
      analysis.analysis.issues.forEach(issue => {
        if (issue.description.toLowerCase().includes(queryLower) || 
            issue.type.toLowerCase().includes(queryLower)) {
          searchResults.push({
            type: 'issue',
            fileId: analysis.id,
            fileName: analysis.name,
            folder: analysis.folder,
            issue: issue,
            match: issue.description.toLowerCase().includes(queryLower) ? 'issue description' : 'issue type'
          });
        }
      });
      
      // Search in recommendations
      analysis.analysis.recommendations.forEach(rec => {
        if (rec.toLowerCase().includes(queryLower)) {
          searchResults.push({
            type: 'recommendation',
            fileId: analysis.id,
            fileName: analysis.name,
            folder: analysis.folder,
            recommendation: rec,
            match: 'recommendation'
          });
        }
      });
    });
    
    // Remove duplicates based on fileId for file matches
    const uniqueResults = [];
    const seenFileIds = new Set();
    
    searchResults.forEach(result => {
      if (result.type === 'file') {
        if (!seenFileIds.has(result.id)) {
          seenFileIds.add(result.id);
          uniqueResults.push(result);
        }
      } else {
        // For issues/recommendations, include them all
        uniqueResults.push(result);
      }
    });
    
    return uniqueResults;
  } catch (error) {
    console.error('Error in searchComplianceFiles:', error);
    return [];
  }
};

// Get compliance summary
export const getComplianceSummary = () => {
  try {
    const availableFiles = getAvailableComplianceFiles();
    const allAnalyses = getComplianceAnalysis();
    
    const summary = {
      totalFiles: availableFiles.length,
      totalAnalyses: allAnalyses.length,
      aggregatedMetrics: calculateComplianceAggregatedMetrics(allAnalyses),
      latestFiles: availableFiles
        .sort((a, b) => new Date(b.modified) - new Date(a.modified))
        .slice(0, 5)
    };
    
    return summary;
  } catch (error) {
    console.error('Error in getComplianceSummary:', error);
    return {
      success: false,
      message: 'Failed to generate compliance summary',
      error: error.message
    };
  }
};

// Get compliance standards
export const getComplianceStandards = () => {
  return {
    naming: [
      { rule: 'VariableNaming', description: 'Use descriptive variable names', severity: 'medium' },
      { rule: 'MethodNaming', description: 'Use camelCase for method names', severity: 'medium' },
      { rule: 'ClassName', description: 'Use PascalCase for class names', severity: 'high' },
      { rule: 'ConstantNaming', description: 'Use UPPER_SNAKE_CASE for constants', severity: 'medium' }
    ],
    style: [
      { rule: 'Indentation', description: 'Use consistent indentation (4 spaces)', severity: 'low' },
      { rule: 'BraceStyle', description: 'Use consistent brace placement', severity: 'low' },
      { rule: 'LineLength', description: 'Limit line length to 120 characters', severity: 'low' },
      { rule: 'ImportOrder', description: 'Maintain consistent import order', severity: 'low' }
    ],
    documentation: [
      { rule: 'Javadoc', description: 'Add Javadoc for public methods and classes', severity: 'medium' },
      { rule: 'CommentQuality', description: 'Write clear, useful comments', severity: 'low' },
      { rule: 'TodoComments', description: 'Resolve or update TODO comments', severity: 'low' }
    ],
    security: [
      { rule: 'SQLInjection', description: 'Use parameterized queries', severity: 'critical' },
      { rule: 'InputValidation', description: 'Validate all user inputs', severity: 'high' },
      { rule: 'HardcodedSecrets', description: 'Avoid hardcoded passwords/keys', severity: 'critical' }
    ],
    performance: [
      { rule: 'ResourceLeak', description: 'Close resources properly', severity: 'high' },
      { rule: 'LoopOptimization', description: 'Optimize loop performance', severity: 'medium' },
      { rule: 'MemoryUsage', description: 'Avoid memory leaks', severity: 'high' }
    ]
  };
};