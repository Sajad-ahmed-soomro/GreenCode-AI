import fs from 'fs';
import {
  getComplianceAnalysis,
  getFileComplianceAnalysis,
  calculateComplianceAggregatedMetrics,
  getAvailableComplianceFiles,
  searchComplianceFiles,
  getComplianceSummary,
  getComplianceStandards as getStandardsService
} from '../services/complianceService.js';

// Get compliance analysis for multiple files
export const getComplianceAnalysisData = async (req, res) => {
  try {
    const { files, folder } = req.query;
    const fileIds = files ? files.split(',') : [];
    
    console.log('📋 Compliance Controller - Requested files:', fileIds);
    
    // Get analysis data
    let analyses = getComplianceAnalysis(fileIds);
    
    // Filter by folder if specified
    if (folder) {
      analyses = analyses.filter(file => file.folder === folder);
    }
    
    if (analyses.length === 0) {
      // Try to get available files first
      const availableFiles = getAvailableComplianceFiles();
      const availableFileIds = availableFiles.map(f => f.id);
      
      console.log('⚠️ No analyses found. Available files:', availableFileIds);
      
      return res.status(404).json({
        success: false,
        message: 'No compliance analysis data found for the requested files',
        availableFiles: availableFileIds,
        suggestion: `Available files: ${availableFileIds.join(', ')}`
      });
    }
    
    // Calculate aggregated metrics
    const aggregatedMetrics = calculateComplianceAggregatedMetrics(analyses);
    
    console.log(`✅ Returning ${analyses.length} compliance analyses`);
    
    // Respond with data
    res.json({
      success: true,
      files: analyses,
      aggregated: aggregatedMetrics,
      totalFiles: analyses.length,
      timestamp: new Date().toISOString(),
      message: `Successfully analyzed ${analyses.length} file(s) for compliance`,
      availableFolders: [...new Set(analyses.map(f => f.folder))]
    });
    
  } catch (error) {
    console.error('Error in getComplianceAnalysisData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load compliance analysis',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get analysis for a single file
export const getSingleFileComplianceAnalysis = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }
    
    const fileAnalysis = getFileComplianceAnalysis(fileId);
    
    if (!fileAnalysis) {
      // Provide available files for reference
      const availableFiles = getAvailableComplianceFiles();
      const availableFileIds = availableFiles.map(f => f.id);
      
      return res.status(404).json({
        success: false,
        message: `Compliance analysis not found for: ${fileId}`,
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
    console.error('Error in getSingleFileComplianceAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file compliance analysis',
      error: error.message
    });
  }
};

// Get list of all available compliance files
export const getAvailableComplianceDataFiles = async (req, res) => {
  try {
    const files = getAvailableComplianceFiles();
    
    res.json({
      success: true,
      files: files,
      count: files.length,
      timestamp: new Date().toISOString(),
      folders: [...new Set(files.map(f => f.folder))]
    });
    
  } catch (error) {
    console.error('Error in getAvailableComplianceDataFiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available compliance files',
      error: error.message
    });
  }
};

// Get compliance analysis summary/statistics
export const getComplianceAnalysisSummary = async (req, res) => {
  try {
    const { folder } = req.query;
    let analyses = getComplianceAnalysis([]); // Get all analyses
    
    // Filter by folder if specified
    if (folder) {
      analyses = analyses.filter(file => file.folder === folder);
    }
    
    const aggregatedMetrics = calculateComplianceAggregatedMetrics(analyses);
    const summary = getComplianceSummary();
    
    res.json({
      success: true,
      summary: {
        metrics: aggregatedMetrics,
        overview: summary
      },
      timestamp: new Date().toISOString(),
      totalFilesAnalyzed: analyses.length,
      folder: folder || 'all'
    });
    
  } catch (error) {
    console.error('Error in getComplianceAnalysisSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance analysis summary',
      error: error.message
    });
  }
};

// Search for compliance files
export const searchComplianceAnalysis = async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const results = searchComplianceFiles(q.trim());
    
    // Filter by type if specified
    let filteredResults = results;
    if (type && ['file', 'issue', 'recommendation'].includes(type)) {
      filteredResults = results.filter(result => result.type === type);
    }
    
    res.json({
      success: true,
      query: q,
      type: type || 'all',
      results: filteredResults,
      count: filteredResults.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in searchComplianceAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search compliance analysis',
      error: error.message
    });
  }
};

// Get raw compliance file content
export const getRawComplianceFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }
    
    const availableFiles = getAvailableComplianceFiles();
    const fileInfo = availableFiles.find(f => f.id === fileId);
    
    if (!fileInfo || !fs.existsSync(fileInfo.path)) {
      return res.status(404).json({
        success: false,
        message: `Compliance file not found: ${fileId}`
      });
    }
    
    const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
    
    // Try to parse as JSON, but also keep raw content
    let parsedContent;
    try {
      parsedContent = JSON.parse(fileContent);
    } catch (parseError) {
      parsedContent = { raw: fileContent, parseError: parseError.message };
    }
    
    res.json({
      success: true,
      file: {
        id: fileId,
        name: fileInfo.name,
        path: fileInfo.path,
        folder: fileInfo.folder,
        size: fileInfo.size,
        modified: fileInfo.modified,
        content: parsedContent,
        raw: fileContent
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getRawComplianceFileContent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance file content',
      error: error.message
    });
  }
};

// Get compliance standards/rules overview
export const getComplianceStandards = async (req, res) => {
  try {
    const standards = getStandardsService();
    
    // Calculate totals
    const totalRules = Object.values(standards).reduce((sum, category) => sum + category.length, 0);
    
    // Calculate severity distribution
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    Object.values(standards).forEach(category => {
      category.forEach(rule => {
        if (rule.severity && severityCounts.hasOwnProperty(rule.severity)) {
          severityCounts[rule.severity]++;
        }
      });
    });
    
    res.json({
      success: true,
      standards: standards,
      metadata: {
        totalRules,
        categories: Object.keys(standards),
        severityDistribution: severityCounts,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getComplianceStandards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance standards',
      error: error.message
    });
  }
};