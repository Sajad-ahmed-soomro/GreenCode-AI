import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory where maintainability results are stored
const BASE_OUTPUT_DIR = path.join(process.cwd(), 'output');

// Function to read all maintainability files
export const getAllMaintainabilityFiles = (baseDir = BASE_OUTPUT_DIR) => {
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
          const maintainabilityPath = path.join(folderPath, 'maintainability');
          
          if (fs.existsSync(maintainabilityPath) && fs.statSync(maintainabilityPath).isDirectory()) {
            const files = fs.readdirSync(maintainabilityPath)
              .filter(f => f.endsWith('.json'))
              .map(f => ({
                fullPath: path.join(maintainabilityPath, f),
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
    console.error('Error in getAllMaintainabilityFiles:', error);
    return [];
  }
};

// Get all available files with metadata - EXACTLY like data structure
export const getAvailableFiles = () => {
  try {
    const files = getAllMaintainabilityFiles();
    
    return files.map(file => {
      try {
        const stats = fs.statSync(file.fullPath);
        
        // Extract the base name WITHOUT any hash prefixes
        // This is the key part - must match what frontend sends
        const baseName = extractBaseFileName(file.fileName);
        
        // Create ID format: folder-filename (without .java)
        const fileId = `${file.folder}-${baseName.replace('.java', '')}`;
        
        return {
          id: fileId, // This ID will match what frontend sends
          name: baseName,
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
    console.error('Error in getAvailableFiles:', error);
    return [];
  }
};

// Extract base filename - MUST MATCH DATA STRUCTURE LOGIC
const extractBaseFileName = (jsonFileName) => {
  // Remove .json extension
  let fileName = jsonFileName.replace('.json', '');
  
  // Remove hash prefixes (e.g., "2efcad81a0d32d458bd08b6df2d7e8db_")
  const hashRegex = /^[a-f0-9]+_/;
  if (hashRegex.test(fileName)) {
    fileName = fileName.replace(hashRegex, '');
  }
  
  // Remove other prefixes/suffixes
  fileName = fileName
    .replace('_extracted-', '')
    .replace('maintainability_', '')
    .replace('_report', '')
    .replace('_maintainability', '');
  
  // Ensure it ends with .java
  if (!fileName.endsWith('.java')) {
    fileName += '.java';
  }
  
  return fileName;
};

// Get analysis for specific files - WITH PROPER ID MATCHING
export const getAnalysis = (fileIds = []) => {
  try {
    const analyses = [];
    const availableFiles = getAvailableFiles();
    
    console.log('🔍 Maintainability Service - Looking for files:');
    console.log('   Requested IDs:', fileIds);
    console.log('   Available files:', availableFiles.map(f => ({ 
      id: f.id, 
      name: f.name,
      path: f.path 
    })));
    
    // If no files specified, return all
    if (fileIds.length === 0) {
      fileIds = availableFiles.map(file => file.id);
    }
    
    for (const fileId of fileIds) {
      try {
        // Find file by ID (exact match)
        const fileInfo = availableFiles.find(f => f.id === fileId);
        
        if (fileInfo && fs.existsSync(fileInfo.path)) {
          console.log(`✅ Found file: ${fileId} -> ${fileInfo.path}`);
          
          const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
          const rawAnalysis = JSON.parse(fileContent);
          
          // Process analysis data
          const processedAnalysis = processMaintainabilityAnalysis(rawAnalysis);
          
          analyses.push({
            id: fileInfo.id,
            name: fileInfo.name,
            fileName: fileInfo.name,
            path: fileInfo.path,
            folder: fileInfo.folder,
            analysis: processedAnalysis
          });
        } else {
          console.warn(`❌ File not found: ${fileId}`);
          // Try to find by partial match
          const partialMatch = availableFiles.find(f => 
            f.name.toLowerCase().includes(fileId.toLowerCase().replace('.java', '')) ||
            f.id.toLowerCase().includes(fileId.toLowerCase())
          );
          
          if (partialMatch) {
            console.log(`   Partial match found: ${partialMatch.id}`);
          }
        }
      } catch (error) {
        console.error(`Error reading file ${fileId}:`, error);
      }
    }
    
    console.log(`📊 Returning ${analyses.length} analyses`);
    return analyses;
  } catch (error) {
    console.error('Error in getAnalysis:', error);
    return [];
  }
};

// Process maintainability analysis data
const processMaintainabilityAnalysis = (rawAnalysis) => {
  // Initialize with defaults
  const processed = {
    fileName: rawAnalysis.fileName || rawAnalysis.file || 'unknown.java',
    totalIssues: 0,
    suggestions: [],
    totalClasses: rawAnalysis.totalClasses || 1,
    totalMethods: rawAnalysis.totalMethods || 0,
    realLOC: rawAnalysis.realLOC || rawAnalysis.loc || 0,
    realComments: rawAnalysis.realComments || 0,
    averageScore: rawAnalysis.averageScore || rawAnalysis.maintainabilityScore || 0,
    maintainabilityLevel: rawAnalysis.maintainabilityLevel || 'Unknown',
    results: rawAnalysis.results || [],
    criticalIssues: 0,
    issueTypes: {}
  };
  
  // Calculate total issues from results or suggestions
  if (rawAnalysis.results && Array.isArray(rawAnalysis.results)) {
    processed.totalIssues = rawAnalysis.results.length;
    
    // Convert results to suggestions format
    processed.suggestions = rawAnalysis.results.map((result, index) => ({
      issueType: 'MaintainabilityIssue',
      pattern: `${result.className}.${result.methodName} - Score: ${result.methodScore}`,
      recommendedDataStructure: 'N/A',
      why: `Maintainability score ${result.methodScore} (${result.maintainabilityLevel})`,
      energyImpact: 'Improving maintainability reduces technical debt and maintenance costs',
      lineNumber: index + 1
    }));
  } else if (rawAnalysis.suggestions && Array.isArray(rawAnalysis.suggestions)) {
    processed.totalIssues = rawAnalysis.suggestions.length;
    processed.suggestions = rawAnalysis.suggestions;
  }
  
  // Calculate critical issues (scores below 50)
  if (processed.results.length > 0) {
    processed.criticalIssues = processed.results.filter(r => r.methodScore < 50).length;
  } else if (processed.averageScore < 50) {
    processed.criticalIssues = 1;
  }
  
  // Group by issue type
  processed.issueTypes = {
    MaintainabilityIssue: processed.totalIssues
  };
  
  return processed;
};

// Get single file analysis
export const getFileAnalysis = (fileId) => {
  const analysis = getAnalysis([fileId]);
  return analysis.length > 0 ? analysis[0] : null;
};

// Calculate aggregated metrics
export const calculateAggregatedMetrics = (analyses) => {
  const totalFiles = analyses.length;
  
  if (totalFiles === 0) {
    return {
      totalFiles: 0,
      totalClasses: 0,
      totalMethods: 0,
      totalLOC: 0,
      totalComments: 0,
      averageScore: 0,
      commentRatio: '0%',
      totalIssues: 0,
      criticalIssues: 0,
      avgIssuesPerFile: '0.00',
      issueTypes: {},
      mostCommonIssue: 'None'
    };
  }
  
  // Calculate sums
  const totalClasses = analyses.reduce((sum, file) => sum + (file.analysis?.totalClasses || 0), 0);
  const totalMethods = analyses.reduce((sum, file) => sum + (file.analysis?.totalMethods || 0), 0);
  const totalLOC = analyses.reduce((sum, file) => sum + (file.analysis?.realLOC || 0), 0);
  const totalComments = analyses.reduce((sum, file) => sum + (file.analysis?.realComments || 0), 0);
  const totalIssues = analyses.reduce((sum, file) => sum + (file.analysis?.totalIssues || 0), 0);
  const criticalIssues = analyses.reduce((sum, file) => sum + (file.analysis?.criticalIssues || 0), 0);
  
  // Calculate average score
  const scores = analyses
    .map(file => file.analysis?.averageScore || 0)
    .filter(score => score > 0);
  
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
  
  // Calculate comment ratio
  const commentRatio = totalLOC > 0 
    ? ((totalComments / totalLOC) * 100).toFixed(1) + '%' 
    : '0%';
  
  // Group issue types
  const issueTypes = analyses.reduce((acc, file) => {
    Object.entries(file.analysis?.issueTypes || {}).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + count;
    });
    return acc;
  }, {});
  
  return {
    totalFiles,
    totalClasses,
    totalMethods,
    totalLOC,
    totalComments,
    averageScore: averageScore.toFixed(1),
    commentRatio,
    totalIssues,
    criticalIssues,
    avgIssuesPerFile: totalFiles > 0 ? (totalIssues / totalFiles).toFixed(2) : '0.00',
    issueTypes,
    mostCommonIssue: Object.keys(issueTypes).reduce((a, b) => 
      issueTypes[a] > issueTypes[b] ? a : b, 'None'
    )
  };
};

// Search files
export const searchFiles = (query) => {
  try {
    const availableFiles = getAvailableFiles();
    
    return availableFiles.filter(file => {
      // Search in file name or folder
      return file.name.toLowerCase().includes(query.toLowerCase()) ||
             file.folder.toLowerCase().includes(query.toLowerCase());
    });
  } catch (error) {
    console.error('Error in searchFiles:', error);
    return [];
  }
};

export default {
  getAllMaintainabilityFiles,
  getAvailableFiles,
  getAnalysis,
  getFileAnalysis,
  calculateAggregatedMetrics,
  searchFiles
};