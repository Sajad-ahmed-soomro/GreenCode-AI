import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory where your data structure results are stored
const BASE_OUTPUT_DIR = path.join(process.cwd(), 'output');

// Function to read all data structure files from the output directory
export const getAllDataStructuresFiles = (baseDir = BASE_OUTPUT_DIR) => {
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
          const energyPath = path.join(folderPath, 'data-structure-results');
          
          if (fs.existsSync(energyPath) && fs.statSync(energyPath).isDirectory()) {
            const files = fs.readdirSync(energyPath)
              .filter(f => f.endsWith('report.json'))
              .map(f => ({
                fullPath: path.join(energyPath, f),
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
    console.error('Error in getAllDataStructuresFiles:', error);
    return [];
  }
};

// Get all available JSON files with metadata
// Update the extractBaseFileName function to match maintainability:
const extractBaseFileName = (jsonFileName) => {
  // Remove .report.json extension
  let fileName = jsonFileName.replace('.report.json', '');
  
  // Remove hash prefixes (e.g., "2efcad81a0d32d458bd08b6df2d7e8db_")
  const hashRegex = /^[a-f0-9]+_/;
  if (hashRegex.test(fileName)) {
    fileName = fileName.replace(hashRegex, '');
  }
  
  // Remove other prefixes/suffixes
  fileName = fileName
    .replace('_extracted-', '')
    .replace('data_structure_', '')
    .replace('_report', '')
    .replace('_analysis', '');
  
  // Ensure it ends with .java
  if (!fileName.endsWith('.java')) {
    fileName += '.java';
  }
  
  return fileName;
};

// Update the getAvailableFiles function:
export const getAvailableFiles = () => {
  try {
    const files = getAllDataStructuresFiles();
    
    return files.map(file => {
      try {
        const stats = fs.statSync(file.fullPath);
        // Use the same logic as maintainability
        const baseName = extractBaseFileName(file.fileName);
        
        // Create ID format: folder-filename (without .java)
        const fileId = `${file.folder}-${baseName.replace('.java', '')}`;
        
        return {
          id: fileId, // This ID format should match maintainability
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
// Get analysis for specific files
// Remove the getMockAnalysis function call and replace with:

export const getAnalysis = (fileIds = []) => {
  try {
    const analyses = [];
    const availableFiles = getAvailableFiles();
    
    console.log('🔍 Data Structure Service - Looking for files:');
    console.log('   Requested IDs:', fileIds);
    console.log('   Available files:', availableFiles.map(f => ({ 
      id: f.id, 
      name: f.name,
      path: f.path 
    })));
    
    // If no files specified, get all available
    if (fileIds.length === 0) {
      fileIds = availableFiles.map(file => file.id);
    }
    
    for (const fileId of fileIds) {
      try {
        // Find the file in available files
        const fileInfo = availableFiles.find(f => f.id === fileId);
        
        if (fileInfo && fs.existsSync(fileInfo.path)) {
          console.log(`✅ Found data structure file: ${fileId} -> ${fileInfo.path}`);
          
          const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
          const analysis = JSON.parse(fileContent);
          
          // Add enriched data structure
          const enrichedAnalysis = {
            ...analysis,
            id: fileId,
            folder: fileInfo.folder,
            totalIssues: analysis.suggestions?.length || 0,
            criticalIssues: calculateCriticalIssues(analysis.suggestions || []),
            issueTypes: groupByIssueType(analysis.suggestions || []),
            recommendations: extractRecommendations(analysis.suggestions || [])
          };
          
          analyses.push({
            id: fileId,
            name: analysis.fileName || fileInfo.name,
            path: fileInfo.path,
            folder: fileInfo.folder,
            analysis: enrichedAnalysis
          });
        } else {
          console.warn(`❌ Data structure file not found: ${fileId}`);
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
        console.error(`Error reading data structure file ${fileId}:`, error);
      }
    }
    
    console.log(`📊 Returning ${analyses.length} data structure analyses`);
    return analyses;
  } catch (error) {
    console.error('Error in getAnalysis:', error);
    return [];
  }
};// Get analysis for a single file
export const getFileAnalysis = (fileId) => {
  try {
    const availableFiles = getAvailableFiles();
    const fileInfo = availableFiles.find(f => f.id === fileId);
    
    if (fileInfo && fs.existsSync(fileInfo.path)) {
      const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
      const analysis = JSON.parse(fileContent);
      
      return {
        id: fileId,
        name: analysis.fileName || fileInfo.name,
        path: fileInfo.path,
        folder: fileInfo.folder,
        analysis: {
          ...analysis,
          totalIssues: analysis.suggestions?.length || 0,
          criticalIssues: calculateCriticalIssues(analysis.suggestions || []),
          issueTypes: groupByIssueType(analysis.suggestions || []),
          recommendations: extractRecommendations(analysis.suggestions || [])
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getFileAnalysis for ${fileId}:`, error);
    return null;
  }
};

// Calculate critical issues based on issue type
const calculateCriticalIssues = (suggestions) => {
  return suggestions.filter(s => 
    s.issueType === 'NestedLoops' || 
    s.issueType === 'ManualArraySearch' ||
    s.severity === 'high' ||
    s.severity === 'critical'
  ).length;
};

// Extract unique recommendations
const extractRecommendations = (suggestions) => {
  const recommendations = new Set();
  suggestions.forEach(suggestion => {
    if (suggestion.recommendedDataStructure) {
      recommendations.add(suggestion.recommendedDataStructure);
    }
  });
  return Array.from(recommendations);
};

// Helper function to group suggestions by issue type
const groupByIssueType = (suggestions) => {
  return suggestions.reduce((acc, suggestion) => {
    acc[suggestion.issueType] = (acc[suggestion.issueType] || 0) + 1;
    return acc;
  }, {});
};

// Calculate aggregated metrics
export const calculateAggregatedMetrics = (analyses) => {
  const totalIssues = analyses.reduce((sum, file) => {
    return sum + (file.analysis.totalIssues || 0);
  }, 0);
  
  const criticalIssues = analyses.reduce((sum, file) => {
    return sum + (file.analysis.criticalIssues || 0);
  }, 0);
  
  const issueTypes = analyses.reduce((acc, file) => {
    Object.entries(file.analysis.issueTypes || {}).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + count;
    });
    return acc;
  }, {});
  
  const avgIssuesPerFile = analyses.length > 0 ? totalIssues / analyses.length : 0;
  
  // Calculate most common recommendations across all files
  const recommendationCounts = analyses.reduce((acc, file) => {
    file.analysis.suggestions?.forEach(suggestion => {
      const key = suggestion.recommendedDataStructure || suggestion.issueType;
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
    });
    return acc;
  }, {});
  
  const mostCommonRecommendations = Object.entries(recommendationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  
  // Calculate estimated energy impact
  const energyImpact = {
    potentialSavings: Math.round(totalIssues * 8.5), // Arbitrary calculation
    highImpactIssues: criticalIssues,
    estimatedReduction: criticalIssues > 0 ? 'High' : 'Medium',
    totalFilesAnalyzed: analyses.length
  };
  
  return {
    totalIssues,
    criticalIssues,
    avgIssuesPerFile: avgIssuesPerFile.toFixed(2),
    issueTypes,
    totalFiles: analyses.length,
    mostCommonIssue: Object.keys(issueTypes).reduce((a, b) => 
      issueTypes[a] > issueTypes[b] ? a : b, 'No issues'
    ),
    mostCommonRecommendations,
    energyImpact,
    folders: [...new Set(analyses.map(f => f.folder))] // Unique folders
  };
};

// Mock data generator for testing (fallback)
// const getMockAnalysis = (fileId) => {
//   const mockSuggestions = [
//     {
//       issueType: 'ManualArraySearch',
//       pattern: 'Manual arr[i] search inside loop',
//       recommendedDataStructure: 'Use Set or Map depending on logic',
//       why: 'Manual scanning inside loop is slow (O(n)). Hashed lookup is O(1).',
//       energyImpact: 'Reduces unnecessary CPU usage and energy waste.',
//       lineNumber: 24
//     },
//     {
//       issueType: 'NestedLoops',
//       pattern: 'Nested loops detected',
//       recommendedDataStructure: 'Use HashMap/HashSet for matching instead of O(n²) nested scans.',
//       why: 'Nested loops cause O(n²) complexity. Converting one list to a Map reduces time to O(n).',
//       energyImpact: 'Massive CPU & energy reduction (up to 95%).',
//       lineNumber: 115,
//       outerLoopStartsAt: 114
//     }
//   ];
  
//   return {
//     id: fileId,
//     name: `${fileId}.java`,
//     folder: 'mock-data',
//     analysis: {
//       fileName: `${fileId}.java`,
//       suggestions: mockSuggestions,
//       totalIssues: mockSuggestions.length,
//       criticalIssues: mockSuggestions.filter(s => s.issueType === 'NestedLoops').length,
//       issueTypes: groupByIssueType(mockSuggestions),
//       recommendations: ['Use HashMap/HashSet', 'Use Set or Map']
//     }
//   };
// };

// Search for files by name or content
export const searchFiles = (query) => {
  try {
    const availableFiles = getAvailableFiles();
    
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
          
          // Search in suggestions
          if (analysis.suggestions) {
            return analysis.suggestions.some(suggestion => 
              suggestion.issueType.toLowerCase().includes(query.toLowerCase()) ||
              suggestion.pattern.toLowerCase().includes(query.toLowerCase()) ||
              suggestion.recommendedDataStructure.toLowerCase().includes(query.toLowerCase())
            );
          }
        }
        
        return false;
      } catch (error) {
        console.error(`Error searching file ${file.name}:`, error);
        return false;
      }
    });
  } catch (error) {
    console.error('Error in searchFiles:', error);
    return [];
  }
};