import fs from 'fs';
import {
  getAnalysis,
  getFileAnalysis,
  getAvailableFiles,  // Changed from getAvailableMaintainabilityFiles
  calculateAggregatedMetrics,  
  searchFiles  // Changed from searchMaintainabilityFiles
} from '../services/maintainabilityService.js';

// Get maintainability analysis for multiple files
export const getMaintainabilityAnalysisData = async (req, res) => {
  try {
    const { files, folder } = req.query;
    const fileIds = files ? files.split(',') : [];
    
    // Get analysis data
    let analyses = getAnalysis(fileIds);  // Changed from getMaintainabilityAnalysis
    
    // Filter by folder if specified
    if (folder) {
      analyses = analyses.filter(file => file.folder === folder);
    }
    
    if (analyses.length === 0) {
      // Try to get available files first
      const availableFiles = getAvailableFiles();  // Changed from getAvailableMaintainabilityFiles
      const availableFileIds = availableFiles.map(f => f.id);
      
      return res.status(404).json({
        success: false,
        message: 'No maintainability analysis data found',
        availableFiles: availableFileIds,
        suggestion: `Available files: ${availableFileIds.join(', ')}`
      });
    }
    
    // Calculate aggregated metrics
    const aggregatedMetrics = calculateAggregatedMetrics(analyses);
    
    // Respond with data
    res.json({
      success: true,
      files: analyses,
      aggregated: aggregatedMetrics,
      totalFiles: analyses.length,
      timestamp: new Date().toISOString(),
      message: `Successfully analyzed ${analyses.length} file(s) for maintainability`,
      availableFolders: [...new Set(analyses.map(f => f.folder))]
    });
    
  } catch (error) {
    console.error('Error in getMaintainabilityAnalysisData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load maintainability analysis',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get analysis for a single file
export const getSingleFileMaintainabilityAnalysis = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }
    
    const fileAnalysis = getFileAnalysis(fileId);  // Changed from getFileMaintainabilityAnalysis
    
    if (!fileAnalysis) {
      // Provide available files for reference
      const availableFiles = getAvailableFiles();  // Changed from getAvailableMaintainabilityFiles
      const availableFileIds = availableFiles.map(f => f.id);
      
      return res.status(404).json({
        success: false,
        message: `Maintainability analysis not found for: ${fileId}`,
        availableFiles: availableFileIds,
        suggestion: `Try one of: ${availableFileIds.join(', ')}`
      });
    }
    
    res.json({
      success: true,
      file: fileAnalysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getSingleFileMaintainabilityAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file maintainability analysis',
      error: error.message
    });
  }
};

// Get list of all available maintainability files
export const getAvailableMaintainabilityDataFiles = async (req, res) => {
  try {
    const files = getAvailableFiles();  // Changed from getAvailableMaintainabilityFiles
    
    res.json({
      success: true,
      files: files,
      count: files.length,
      timestamp: new Date().toISOString(),
      folders: [...new Set(files.map(f => f.folder))]
    });
    
  } catch (error) {
    console.error('Error in getAvailableMaintainabilityDataFiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available maintainability files',
      error: error.message
    });
  }
};

// Get maintainability analysis summary/statistics
export const getMaintainabilityAnalysisSummary = async (req, res) => {
  try {
    const { folder } = req.query;
    let analyses = getAnalysis([]); // Get all analyses - Changed from getMaintainabilityAnalysis
    
    // Filter by folder if specified
    if (folder) {
      analyses = analyses.filter(file => file.folder === folder);
    }
    
    const aggregatedMetrics = calculateAggregatedMetrics(analyses);
    
    res.json({
      success: true,
      summary: aggregatedMetrics,
      timestamp: new Date().toISOString(),
      totalFilesAnalyzed: analyses.length,
      folder: folder || 'all'
    });
    
  } catch (error) {
    console.error('Error in getMaintainabilityAnalysisSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintainability analysis summary',
      error: error.message
    });
  }
};

// Search for maintainability files
export const searchMaintainabilityAnalysis = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const results = searchFiles(q.trim());  // Changed from searchMaintainabilityFiles
    
    res.json({
      success: true,
      query: q,
      results: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in searchMaintainabilityAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search maintainability analysis',
      error: error.message
    });
  }
};

// Get raw maintainability file content
export const getRawMaintainabilityFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }
    
    const availableFiles = getAvailableFiles();  // Changed from getAvailableMaintainabilityFiles
    const fileInfo = availableFiles.find(f => f.id === fileId);
    
    if (!fileInfo || !fs.existsSync(fileInfo.path)) {
      return res.status(404).json({
        success: false,
        message: `Maintainability file not found: ${fileId}`
      });
    }
    
    const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
    
    res.json({
      success: true,
      file: {
        id: fileId,
        name: fileInfo.name,
        content: JSON.parse(fileContent),
        raw: fileContent
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getRawMaintainabilityFileContent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintainability file content',
      error: error.message
    });
  }
};

// Get maintainability metrics explanation
export const getMaintainabilityMetricsInfo = async (req, res) => {
  try {
    const metricsInfo = {
      cyclomaticComplexity: {
        name: 'Cyclomatic Complexity',
        description: 'Measures the number of linearly independent paths through a program',
        interpretation: 'Lower is better. Values >10 indicate complex code that should be refactored',
        idealRange: '1-10',
        impact: 'High complexity makes testing and maintenance difficult'
      },
      cognitiveComplexity: {
        name: 'Cognitive Complexity',
        description: 'Measures how difficult code is to understand for a human reader',
        interpretation: 'Lower is better. Measures nesting, recursion, and logical operators',
        idealRange: '1-15',
        impact: 'High cognitive load makes code hard to understand and modify'
      },
      maintainabilityIndex: {
        name: 'Maintainability Index',
        description: 'Composite metric based on Halstead volume, cyclomatic complexity, and LOC',
        interpretation: 'Higher is better. 85+ = Excellent, 65-84 = Good, 50-64 = Fair, <50 = Poor',
        idealRange: '85-100',
        impact: 'Direct measure of how easy code is to maintain'
      },
      linesOfCode: {
        name: 'Lines of Code',
        description: 'Total number of lines in a method or file',
        interpretation: 'Smaller methods are generally better. Methods >50 lines should be reviewed',
        idealRange: '1-50 per method',
        impact: 'Long methods violate Single Responsibility Principle'
      },
      commentRatio: {
        name: 'Comment Ratio',
        description: 'Percentage of comment lines to total lines',
        interpretation: 'Higher is better for complex code. Balance between documentation and code',
        idealRange: '10-30%',
        impact: 'Proper documentation helps understanding but over-commenting can be noise'
      }
    };
    
    res.json({
      success: true,
      metrics: metricsInfo,
      timestamp: new Date().toISOString(),
      totalMetrics: Object.keys(metricsInfo).length
    });
    
  } catch (error) {
    console.error('Error in getMaintainabilityMetricsInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintainability metrics info',
      error: error.message
    });
  }
};