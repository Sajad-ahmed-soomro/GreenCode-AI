import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory where optimization results are stored
const BASE_OUTPUT_DIR = path.join(process.cwd(), 'output');

// Helper function to extract method name from optimization message
const extractMethodName = (message) => {
  const match = message.match(/Method '([^']+)'/);
  return match ? match[1] : 'Unknown Method';
};

// Helper function to extract issue type from optimization message
const extractIssueType = (message) => {
  if (message.includes('Nested loops')) return 'NestedLoops';
  if (message.includes('contains a loop')) return 'LoopOptimization';
  if (message.includes('linear scan')) return 'LinearScan';
  return 'GeneralOptimization';
};

// Helper function to generate suggestion based on issue
const generateSuggestion = (message) => {
  if (message.includes('Nested loops')) {
    return "Consider using hash maps or sets to eliminate nested loops. Convert O(n²) to O(n) complexity.";
  }
  if (message.includes('linear scan')) {
    return "Use hash-based data structures (HashSet/HashMap) for O(1) lookups instead of linear scans.";
  }
  return "Review loop body for optimization opportunities and consider algorithmic improvements.";
};

// Get all optimization files from the output directory
// In optimizationService.js, update the getAllOptimizationFiles function:
export const getAllOptimizationFiles = (baseDir = BASE_OUTPUT_DIR) => {
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
          // Try multiple possible optimization directories
          const possiblePaths = [
            path.join(folderPath, 'optimization'),
            path.join(folderPath, 'optimization-report'),
            path.join(folderPath, 'optimization-results'),
            path.join(folderPath, 'optimization_reports')
          ];
          
          for (const optimizationPath of possiblePaths) {
            if (fs.existsSync(optimizationPath) && fs.statSync(optimizationPath).isDirectory()) {
              console.log(`📁 Found optimization directory: ${optimizationPath}`);
              const files = fs.readdirSync(optimizationPath)
                .filter(f => f.endsWith('.json'))
                .map(f => ({
                  fullPath: path.join(optimizationPath, f),
                  fileName: f,
                  folder: folder
                }));
              
              result.push(...files);
              break; // Stop after finding first valid directory
            }
          }
        }
      } catch (error) {
        console.error(`Error processing folder ${folder}:`, error);
      }
    });
    
    console.log(`🔍 Total optimization files found: ${result.length}`);
    return result;
  } catch (error) {
    console.error('Error in getAllOptimizationFiles:', error);
    return [];
  }
};
// Extract base file name (same pattern as other agents)
// In optimizationService.js, update the extractBaseFileName function:
const extractBaseFileName = (jsonFileName) => {
  // Remove .json extension
  let fileName = jsonFileName.replace('.json', '');
  
  // Remove hash prefixes (e.g., "2efcad81a0d32d458bd08b6df2d7e8db_")
  const hashRegex = /^[a-f0-9]+_/;
  if (hashRegex.test(fileName)) {
    fileName = fileName.replace(hashRegex, '');
  }
  
  // Remove other prefixes/suffixes - handle multiple patterns
  fileName = fileName
    .replace('_extracted-', '')
    .replace('optimization_', '')
    .replace('_report', '')
    .replace('_optimization-report', '')
    .replace('.optimization-report', '')
    .replace('.optimization', '')
    .replace('optimization-report_', '')
    .replace('optimization-report.', '')
    .replace('optimization.', '')
    .replace('maintainability_', '')
    .replace('data-structure_', '')
    .replace('compliance_', '');
  
  // Ensure it ends with .java
  if (!fileName.endsWith('.java')) {
    fileName += '.java';
  }
  
  console.log(`📝 Extracted file name: ${jsonFileName} -> ${fileName}`);
  return fileName;
};
// Get available optimization files (matching other agents' pattern)
export const getAvailableOptimizationFiles = () => {
  try {
    const files = getAllOptimizationFiles();
    
    return files.map(file => {
      try {
        const stats = fs.statSync(file.fullPath);
        const baseName = extractBaseFileName(file.fileName);
        
        // Create ID in same format as other agents: folder-filename
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
    console.error('Error in getAvailableOptimizationFiles:', error);
    return [];
  }
};

// Process optimization analysis data
const processOptimizationAnalysis = (rawAnalysis) => {
  const processed = {
    fileName: rawAnalysis.fileName || 'unknown.java',
    agent: rawAnalysis.agent || 'optimization',
    sourcePath: rawAnalysis.sourcePath || '',
    results: [],
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      severityBreakdown: { high: 0, medium: 0, low: 0 },
      methodsAffected: 0,
      mostCommonIssue: 'None',
      performanceImpact: 'Low',
      energySavings: 0
    }
  };
  
  // Process results
  if (rawAnalysis.results && Array.isArray(rawAnalysis.results)) {
    const methodNames = new Set();
    const issueTypes = {};
    
    processed.results = rawAnalysis.results.map(result => {
      const methodName = extractMethodName(result.message);
      const issueType = extractIssueType(result.message);
      
      // Track unique methods
      methodNames.add(methodName);
      
      // Track issue types
      issueTypes[issueType] = (issueTypes[issueType] || 0) + 1;
      
      // Track severities
      if (result.severity) {
        processed.summary.severityBreakdown[result.severity] = 
          (processed.summary.severityBreakdown[result.severity] || 0) + 1;
      }
      
      return {
        ...result,
        methodName,
        issueType,
        suggestion: generateSuggestion(result.message),
        energyImpact: result.severity === 'high' ? 'High energy consumption. Significant CPU cycles wasted.' :
                     result.severity === 'medium' ? 'Moderate energy impact. Room for optimization.' :
                     'Low impact. Minor optimization opportunity.',
        complexity: result.message.includes('Nested loops') ? 'O(n²)' : 'O(n)',
        optimizedComplexity: result.message.includes('Nested loops') ? 'O(n)' : 'O(1)'
      };
    });
    
    // Update summary
    processed.summary.totalIssues = processed.results.length;
    processed.summary.criticalIssues = processed.results.filter(r => r.severity === 'high').length;
    processed.summary.methodsAffected = methodNames.size;
    
    // Find most common issue
    const mostCommonIssue = Object.entries(issueTypes).sort((a, b) => b[1] - a[1])[0];
    processed.summary.mostCommonIssue = mostCommonIssue ? mostCommonIssue[0] : 'None';
    
    // Calculate performance impact
    if (processed.summary.totalIssues > 10) {
      processed.summary.performanceImpact = 'High';
    } else if (processed.summary.totalIssues > 5) {
      processed.summary.performanceImpact = 'Medium';
    } else {
      processed.summary.performanceImpact = 'Low';
    }
    
    // Calculate energy savings
    const nestedLoops = processed.results.filter(r => r.issueType === 'NestedLoops').length;
    const linearScans = processed.results.filter(r => r.issueType === 'LinearScan').length;
    processed.summary.energySavings = Math.min(95, (nestedLoops * 70) + (linearScans * 40));
  }
  
  // Mark as real data
  processed.actualData = true;
  
  return processed;
};

// Get optimization analysis for specific files
export const getOptimizationAnalysis = (fileIds = []) => {
  try {
    const analyses = [];
    const availableFiles = getAvailableOptimizationFiles();
    
    console.log('🔍 Optimization Service - Looking for files:');
    console.log('   Requested IDs:', fileIds);
    console.log('   Available files:', availableFiles.map(f => ({ 
      id: f.id, 
      name: f.name,
      folder: f.folder
    })));
    
    // If no files specified, return all
    if (fileIds.length === 0) {
      fileIds = availableFiles.map(file => file.id);
    }
    
    for (const fileId of fileIds) {
      try {
        // Find file by ID (exact match first)
        let fileInfo = availableFiles.find(f => f.id === fileId);
        
        // If no exact match, try partial match
        if (!fileInfo) {
          const fileNameOnly = fileId.includes('-') ? fileId.split('-')[1] : fileId;
          fileInfo = availableFiles.find(f => 
            f.name.toLowerCase() === fileNameOnly.toLowerCase() ||
            f.id.includes(fileNameOnly)
          );
          if (fileInfo) {
            console.log(`   Found partial match: ${fileId} -> ${fileInfo.id}`);
          }
        }
        
        // If still not found, try by removing extracted- prefix
        if (!fileInfo && fileId.includes('extracted-')) {
          const cleanId = fileId.replace('extracted-', '');
          fileInfo = availableFiles.find(f => f.id.includes(cleanId));
          if (fileInfo) {
            console.log(`   Found match after cleaning extracted: ${fileId} -> ${fileInfo.id}`);
          }
        }
        
        if (fileInfo && fs.existsSync(fileInfo.path)) {
          console.log(`✅ Found optimization file: ${fileId} -> ${fileInfo.path}`);
          
          const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
          const rawAnalysis = JSON.parse(fileContent);
          
          // Process analysis data
          const processedAnalysis = processOptimizationAnalysis(rawAnalysis);
          
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
          console.warn(`❌ Optimization file not found: ${fileId}`);
          
          // Return empty analysis
          analyses.push({
            id: fileId,
            name: `${fileId}.java`,
            fileName: `${fileId}.java`,
            folder: 'no-data',
            analysis: {
              fileName: `${fileId}.java`,
              agent: "optimization",
              results: [],
              summary: {
                totalIssues: 0,
                criticalIssues: 0,
                severityBreakdown: { high: 0, medium: 0, low: 0 },
                methodsAffected: 0,
                mostCommonIssue: 'None',
                performanceImpact: 'Low',
                energySavings: 0
              }
            },
            success: false,
            message: 'No optimization data found for this file'
          });
        }
      } catch (error) {
        console.error(`Error reading optimization file ${fileId}:`, error);
        analyses.push({
          id: fileId,
          name: `${fileId}.java`,
          fileName: `${fileId}.java`,
          folder: 'error',
          analysis: {
            fileName: `${fileId}.java`,
            agent: "optimization",
            results: [],
            summary: {
              totalIssues: 0,
              criticalIssues: 0,
              severityBreakdown: { high: 0, medium: 0, low: 0 },
              methodsAffected: 0,
              mostCommonIssue: 'None',
              performanceImpact: 'Low',
              energySavings: 0
            }
          },
          success: false,
          error: error.message
        });
      }
    }
    
    console.log(`📊 Returning ${analyses.length} optimization analyses`);
    return analyses;
  } catch (error) {
    console.error('Error in getOptimizationAnalysis:', error);
    return [];
  }
};

// Get analysis for a single file
export const getSingleFileOptimizationAnalysis = (fileId) => {
  const analysis = getOptimizationAnalysis([fileId]);
  return analysis.length > 0 ? analysis[0] : null;
};

// Calculate aggregated metrics
export const calculateOptimizationAggregatedMetrics = (analyses) => {
  const totalIssues = analyses.reduce((sum, file) => {
    return sum + (file.analysis.summary?.totalIssues || 0);
  }, 0);
  
  const totalCriticalIssues = analyses.reduce((sum, file) => {
    return sum + (file.analysis.summary?.criticalIssues || 0);
  }, 0);
  
  const severityBreakdown = analyses.reduce((acc, file) => {
    const breakdown = file.analysis.summary?.severityBreakdown || {};
    Object.entries(breakdown).forEach(([severity, count]) => {
      acc[severity] = (acc[severity] || 0) + count;
    });
    return acc;
  }, { high: 0, medium: 0, low: 0 });
  
  // Collect all issue types
  const issueTypes = {};
  analyses.forEach(file => {
    file.analysis.results?.forEach(result => {
      const type = result.issueType || 'GeneralOptimization';
      issueTypes[type] = (issueTypes[type] || 0) + 1;
    });
  });
  
  const mostCommonIssue = Object.entries(issueTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  
  // Calculate performance score
  const performanceScore = calculatePerformanceScore(totalIssues, totalCriticalIssues, analyses.length);
  
  // Calculate estimated energy savings
  const estimatedSavings = Math.min(95, (totalCriticalIssues * 70) + ((totalIssues - totalCriticalIssues) * 40));
  
  return {
    totalFiles: analyses.length,
    totalIssues,
    totalCriticalIssues,
    avgIssuesPerFile: analyses.length > 0 ? (totalIssues / analyses.length).toFixed(2) : 0,
    severityBreakdown,
    issueTypes,
    mostCommonIssue,
    performanceScore,
    estimatedSavings
  };
};

// Calculate performance score
const calculatePerformanceScore = (totalIssues, criticalIssues, fileCount) => {
  if (fileCount === 0) return 100;
  
  const avgIssues = totalIssues / fileCount;
  const criticalRatio = criticalIssues / totalIssues || 0;
  
  let score = 100;
  score -= avgIssues * 2;
  score -= criticalRatio * 30;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Search for optimization files
export const searchOptimizationFiles = (query) => {
  try {
    const availableFiles = getAvailableOptimizationFiles();
    
    return availableFiles.filter(file => {
      try {
        // Search in file name
        if (file.name.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        
        // Search in file content
        if (fs.existsSync(file.path)) {
          const content = fs.readFileSync(file.path, 'utf8');
          const analysis = JSON.parse(content);
          
          // Search in results
          const allResults = analysis.results || [];
          
          return allResults.some(result => 
            result.message?.toLowerCase().includes(query.toLowerCase()) ||
            result.methodName?.toLowerCase().includes(query.toLowerCase()) ||
            result.issueType?.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        return false;
      } catch (error) {
        console.error(`Error searching file ${file.name}:`, error);
        return false;
      }
    });
  } catch (error) {
    console.error('Error in searchOptimizationFiles:', error);
    return [];
  }
};

// Get all files endpoint response
export const getAllOptimizationFilesResponse = () => {
  try {
    const files = getAvailableOptimizationFiles();
    
    return {
      success: true,
      files: files.map(file => ({
        id: file.id,
        name: file.name,
        fileName: file.fileName,
        folder: file.folder,
        size: file.size,
        modified: file.modified,
        path: file.path
      })),
      count: files.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getAllOptimizationFilesResponse:', error);
    return {
      success: false,
      message: 'Failed to fetch optimization files',
      error: error.message,
      files: []
    };
  }
};

// Get optimization summary
export const getOptimizationSummary = () => {
  try {
    const availableFiles = getAvailableOptimizationFiles();
    const allAnalyses = getOptimizationAnalysis();
    
    const summary = {
      totalFiles: availableFiles.length,
      totalAnalyses: allAnalyses.length,
      aggregatedMetrics: calculateOptimizationAggregatedMetrics(allAnalyses),
      latestFiles: availableFiles
        .sort((a, b) => new Date(b.modified) - new Date(a.modified))
        .slice(0, 5)
    };
    
    return {
      success: true,
      summary,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getOptimizationSummary:', error);
    return {
      success: false,
      message: 'Failed to generate optimization summary',
      error: error.message
    };
  }
};

export default {
  getAllOptimizationFiles,
  getAvailableOptimizationFiles,
  getOptimizationAnalysis,
  getSingleFileOptimizationAnalysis,
  calculateOptimizationAggregatedMetrics,
  searchOptimizationFiles,
  getAllOptimizationFilesResponse,
  getOptimizationSummary
};